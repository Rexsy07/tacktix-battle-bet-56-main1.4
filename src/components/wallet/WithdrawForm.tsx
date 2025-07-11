
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BankSearchSelect from "./BankSearchSelect";
import { getUserBalance, deductFromBalance } from "@/utils/wallet-utils";

interface WithdrawFormProps {
  onSuccess?: () => void;
}

const WithdrawForm = ({ onSuccess }: WithdrawFormProps) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const userBalance = await getUserBalance(session.user.id);
      setBalance(userBalance);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !accountNumber || !accountName || !bankCode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (withdrawAmount > balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds for this withdrawal",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Authentication required");
      }

      // Deduct amount from user's balance
      const { success, error: deductError } = await deductFromBalance(session.user.id, withdrawAmount);
      
      if (!success) {
        throw new Error(deductError || "Failed to deduct from balance");
      }

      // Create withdrawal transaction
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: session.user.id,
          type: "withdrawal",
          amount: withdrawAmount,
          status: "pending",
          description: `Withdrawal to ${accountName} - ${accountNumber} (Bank Code: ${bankCode})`
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Withdrawal Requested",
        description: `Your withdrawal of ₦${withdrawAmount.toLocaleString()} has been submitted for processing`,
      });

      // Reset form
      setAmount("");
      setAccountNumber("");
      setAccountName("");
      setBankCode("");
      
      onSuccess?.();
      fetchBalance(); // Refresh balance
    } catch (error: any) {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdraw Funds</CardTitle>
        <p className="text-sm text-gray-400">
          Current Balance: ₦{balance.toLocaleString()}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₦)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max={balance}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank">Bank</Label>
            <BankSearchSelect
              value={bankCode}
              onValueChange={setBankCode}
              placeholder="Select your bank"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              type="text"
              placeholder="Enter your account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountName">Account Name</Label>
            <Input
              id="accountName"
              type="text"
              placeholder="Enter account holder name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !amount || !accountNumber || !accountName || !bankCode}
          >
            {isLoading ? "Processing..." : `Withdraw ₦${amount || "0"}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WithdrawForm;
