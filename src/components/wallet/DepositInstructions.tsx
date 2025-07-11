
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Copy, CheckCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DepositInstructionsProps {
  amount: number;
  transactionId: string;
  onBack: () => void;
  onConfirmSent: () => void;
}

const DepositInstructions = ({ amount, transactionId, onBack, onConfirmSent }: DepositInstructionsProps) => {
  const { toast } = useToast();
  const [isConfirming, setIsConfirming] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Bank details (replace with your actual bank details)
  const bankDetails = {
    bankName: "Zenith Bank",
    accountNumber: "1234567890",
    accountName: "TACKTIX GAMING LTD"
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "Copied!",
        description: `${field} copied to clipboard`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleConfirmSent = async () => {
    setIsConfirming(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Update transaction status to "pending_verification"
      const { error } = await supabase
        .from("transactions")
        .update({ 
          status: "pending_verification",
          description: `Bank transfer deposit of ₦${amount.toLocaleString()} - awaiting verification`
        })
        .eq("id", transactionId);

      if (error) throw error;

      toast({
        title: "Transfer Confirmation Received",
        description: "We will verify your transfer and credit your account within 24 hours",
      });

      onConfirmSent();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to confirm transfer",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">Complete Your Deposit</h2>
        <Badge variant="outline">₦{amount.toLocaleString()}</Badge>
      </div>

      <Card className="border-orange-500/20 bg-orange-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-500">
            <AlertCircle className="h-5 w-5" />
            Important Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white/5 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Step 1: Make Bank Transfer</h3>
            <p className="text-sm text-gray-300 mb-4">
              Transfer <strong>₦{amount.toLocaleString()}</strong> to our bank account using the details below:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-tacktix-dark-light rounded-lg">
                <div>
                  <p className="text-xs text-gray-400">Bank Name</p>
                  <p className="font-medium">{bankDetails.bankName}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(bankDetails.bankName, "Bank Name")}
                >
                  {copiedField === "Bank Name" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-tacktix-dark-light rounded-lg">
                <div>
                  <p className="text-xs text-gray-400">Account Number</p>
                  <p className="font-medium font-mono">{bankDetails.accountNumber}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(bankDetails.accountNumber, "Account Number")}
                >
                  {copiedField === "Account Number" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-tacktix-dark-light rounded-lg">
                <div>
                  <p className="text-xs text-gray-400">Account Name</p>
                  <p className="font-medium">{bankDetails.accountName}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(bankDetails.accountName, "Account Name")}
                >
                  {copiedField === "Account Name" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-red-400">Step 2: Include Your User ID</h3>
            <p className="text-sm text-gray-300 mb-2">
              <strong>VERY IMPORTANT:</strong> When making the transfer, you must include your User ID in the transfer description/narration:
            </p>
            <div className="flex items-center justify-between p-2 bg-red-500/5 rounded border border-red-500/20">
              <code className="font-mono text-red-400">{transactionId}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(transactionId, "User ID")}
              >
                {copiedField === "User ID" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Without this ID, we cannot identify your transfer and credit your account.
            </p>
          </div>

          <div className="bg-white/5 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Step 3: Confirm Transfer</h3>
            <p className="text-sm text-gray-300 mb-4">
              After successfully making the bank transfer, click the button below to notify us. We will verify your transfer and credit your account within 24 hours.
            </p>
            
            <Button
              onClick={handleConfirmSent}
              disabled={isConfirming}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isConfirming ? "Confirming..." : "I Have Made the Transfer"}
            </Button>
          </div>

          <div className="text-xs text-gray-400 space-y-1">
            <p>• Transfers are usually verified within 1-24 hours during business days</p>
            <p>• For urgent deposits, contact support with your transfer receipt</p>
            <p>• Keep your bank transfer receipt as proof of payment</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepositInstructions;
