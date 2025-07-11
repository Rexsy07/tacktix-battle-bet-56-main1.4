
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import WalletBalance from "@/components/wallet/WalletBalance";
import DepositForm from "@/components/wallet/DepositForm";
import WithdrawForm from "@/components/wallet/WithdrawForm";
import TransactionList from "@/components/wallet/TransactionList";

const Wallet = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [wallet, setWallet] = useState<{id: string, balance: number, user_id: string} | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  useEffect(() => {
    checkAuth();
    fetchWalletData();
  }, []);
  
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access your wallet",
        variant: "destructive",
      });
      navigate("/sign-in");
    }
  };
  
  const fetchWalletData = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Authentication required");
      }
      
      // Get or create wallet
      let { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // Wallet doesn't exist, create one
        const { data: newWallet, error: createError } = await supabase
          .from("wallets")
          .insert({ user_id: session.user.id, balance: 0 })
          .select()
          .single();
        
        if (createError) throw createError;
        data = newWallet;
      } else if (error) {
        throw error;
      }
      
      setWallet(data);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      toast({
        title: "Error",
        description: "Failed to load wallet data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDepositSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    fetchWalletData();
  };

  const handleWithdrawSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    fetchWalletData();
  };
  
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">My Wallet</h1>
          <p className="text-gray-400">Manage your funds, deposits, and withdrawals</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <WalletBalance
              onDepositClick={() => setActiveTab("deposit")}
              onWithdrawClick={() => setActiveTab("withdraw")}
              refreshTrigger={refreshTrigger}
            />
            
            <TransactionList />
          </TabsContent>
          
          <TabsContent value="deposit" className="space-y-6">
            <DepositForm onSuccess={handleDepositSuccess} />
          </TabsContent>
          
          <TabsContent value="withdraw" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WithdrawForm 
                onSuccess={handleWithdrawSuccess}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Wallet;
