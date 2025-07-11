
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Copy, CheckCircle, DollarSign, CreditCard, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DepositFormProps {
  onSuccess?: () => void;
}

const DepositForm = ({ onSuccess }: DepositFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bankDetails, setBankDetails] = useState(null);
  const [copiedField, setCopiedField] = useState("");

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("bank_details")
        .select("*")
        .eq("is_active", true)
        .single();

      if (error) throw error;
      setBankDetails(data);
    } catch (error) {
      console.error("Error fetching bank details:", error);
    }
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "Copied!",
        description: `${field} copied to clipboard`,
      });
      setTimeout(() => setCopiedField(""), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy manually",
        variant: "destructive"
      });
    }
  };

  const handleNextStep = () => {
    const depositAmount = parseFloat(amount);
    
    if (!amount || isNaN(depositAmount) || depositAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive"
      });
      return;
    }

    if (depositAmount < 100) {
      toast({
        title: "Minimum Deposit",
        description: "Minimum deposit amount is ₦100",
        variant: "destructive"
      });
      return;
    }

    setStep(2);
  };

  const handleSubmitDeposit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          type: "deposit",
          amount: parseFloat(amount),
          status: "pending",
          description: `Deposit of ₦${amount} pending verification`
        });

      if (error) throw error;

      toast({
        title: "Deposit Submitted",
        description: "Your deposit has been submitted for verification. It will be processed within 24 hours.",
      });

      setAmount("");
      setStep(1);
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting deposit:", error);
      toast({
        title: "Error",
        description: "Failed to submit deposit",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Step 1: Enter Deposit Amount
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (₦)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount to deposit"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="100"
                step="1"
              />
              <p className="text-xs text-gray-400 mt-1">Minimum deposit: ₦100</p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-blue-400 font-medium">Important Notice</p>
                  <p className="text-gray-300 mt-1">
                    All deposits are manually verified for security. Your deposit will be credited within 24 hours after bank transfer confirmation.
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={handleNextStep} className="w-full" size="lg">
              Continue to Payment Details
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && bankDetails && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Step 2: Transfer to Our Bank Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <p className="text-green-400 font-medium text-lg">
                  Transfer Amount: ₦{parseFloat(amount).toLocaleString()}
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-tacktix-dark-light rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Bank Name:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{bankDetails.bank_name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bankDetails.bank_name, "Bank Name")}
                      >
                        {copiedField === "Bank Name" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Account Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium font-mono">{bankDetails.account_number}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bankDetails.account_number, "Account Number")}
                      >
                        {copiedField === "Account Number" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Account Name:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{bankDetails.account_name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bankDetails.account_name, "Account Name")}
                      >
                        {copiedField === "Account Name" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-white/10 pt-3">
                    <span className="text-gray-400">Your User ID:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium font-mono text-sm">{user?.id}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(user?.id, "User ID")}
                      >
                        {copiedField === "User ID" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-yellow-400 font-medium">Important Instructions</p>
                      <ul className="text-gray-300 mt-2 space-y-1 list-disc list-inside">
                        <li>Transfer exactly ₦{parseFloat(amount).toLocaleString()} to the account above</li>
                        <li>Use your User ID as the transfer reference/narration</li>
                        <li>Your deposit will be verified and credited within 24 hours</li>
                        <li>Keep your transfer receipt for verification purposes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleSubmitDeposit} 
                  disabled={isSubmitting}
                  className="flex-1"
                  variant="gradient"
                >
                  {isSubmitting ? "Submitting..." : "I've Made the Transfer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DepositForm;
