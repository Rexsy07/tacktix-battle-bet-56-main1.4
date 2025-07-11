
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowDownRight, ArrowUpRight, RefreshCw, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { getUserBalance } from "@/utils/wallet-utils";

interface WalletBalanceProps {
  onDepositClick: () => void;
  onWithdrawClick: () => void;
  refreshTrigger?: number;
}

const WalletBalance = ({ onDepositClick, onWithdrawClick, refreshTrigger }: WalletBalanceProps) => {
  const { toast } = useToast();
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  const fetchBalance = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const userBalance = await getUserBalance(session.user.id);
      setBalance(userBalance);

      // Fetch user profile for VIP status
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_vip, username")
        .eq("id", session.user.id)
        .single();

      setUserProfile(profile);
    } catch (error) {
      console.error("Error fetching balance:", error);
      toast({
        title: "Error",
        description: "Failed to load wallet balance",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setIsLoading(true);
    fetchBalance();
  };

  return (
    <Card className="glass-card border-tacktix-blue/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-tacktix-blue" />
              Wallet Balance
            </CardTitle>
            <CardDescription>Your current available funds</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-6 flex justify-center">
            <RefreshCw className="animate-spin h-8 w-8 text-gray-400" />
          </div>
        ) : (
          <>
            <div className="flex items-end gap-2 mb-6">
              <div className="text-4xl font-bold text-tacktix-blue">
                ₦{balance.toLocaleString()}
              </div>
              <div className="flex gap-2 mb-1">
                <Badge variant="outline" className="bg-tacktix-blue/10">
                  Available
                </Badge>
                {userProfile?.is_vip && (
                  <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
                    VIP
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="flex-1 flex items-center justify-center bg-tacktix-blue hover:bg-tacktix-blue/90" 
                onClick={onDepositClick}
              >
                <ArrowDownRight size={16} className="mr-2" />
                Deposit
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 flex items-center justify-center border-tacktix-blue text-tacktix-blue hover:bg-tacktix-blue/10" 
                onClick={onWithdrawClick}
                disabled={balance <= 0}
              >
                <ArrowUpRight size={16} className="mr-2" />
                Withdraw
              </Button>
            </div>
            
            {userProfile?.is_vip && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-500">
                  🌟 VIP Member: Enjoy reduced withdrawal fees and priority support!
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletBalance;
