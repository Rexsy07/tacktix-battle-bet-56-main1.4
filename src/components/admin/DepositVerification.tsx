
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { addToBalance } from "@/utils/wallet-utils";

interface PendingDeposit {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
  description: string;
  profiles: {
    username: string;
    phone: string;
  };
}

const DepositVerification = () => {
  const { toast } = useToast();
  const [pendingDeposits, setPendingDeposits] = useState<PendingDeposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState<{[key: string]: string}>({});

  useEffect(() => {
    fetchPendingDeposits();
  }, []);

  const fetchPendingDeposits = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          profiles (
            username,
            phone
          )
        `)
        .eq("type", "deposit")
        .in("status", ["pending", "pending_verification"])
        .order("created_at", { ascending: true });

      if (error) throw error;
      setPendingDeposits(data || []);
    } catch (error: any) {
      console.error("Error fetching pending deposits:", error);
      toast({
        title: "Error",
        description: "Failed to load pending deposits",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveDeposit = async (deposit: PendingDeposit) => {
    setProcessingId(deposit.id);
    try {
      // Add funds to user's wallet
      const { success, error: walletError } = await addToBalance(deposit.user_id, Number(deposit.amount));
      
      if (!success) {
        throw new Error(walletError || "Failed to add funds to wallet");
      }

      // Update transaction status using proper field validation
      const { error: updateError } = await supabase
        .from("transactions")
        .update({ 
          status: "completed",
          description: `${deposit.description} - Verified and approved by admin`,
          updated_at: new Date().toISOString()
        })
        .eq("id", deposit.id);

      if (updateError) {
        console.error("Transaction update error:", updateError);
        throw new Error(`Failed to update transaction: ${updateError.message}`);
      }

      toast({
        title: "Deposit Approved",
        description: `₦${Number(deposit.amount).toLocaleString()} has been credited to ${deposit.profiles.username}'s account`,
      });

      // Remove the approved deposit from the list immediately
      setPendingDeposits(prev => prev.filter(d => d.id !== deposit.id));
    } catch (error: any) {
      console.error("Approval error:", error);
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve deposit",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectDeposit = async (deposit: PendingDeposit) => {
    const notes = rejectionNotes[deposit.id];
    if (!notes?.trim()) {
      toast({
        title: "Rejection Notes Required",
        description: "Please provide a reason for rejecting this deposit",
        variant: "destructive",
      });
      return;
    }

    setProcessingId(deposit.id);
    try {
      const { error } = await supabase
        .from("transactions")
        .update({ 
          status: "rejected",
          description: `${deposit.description} - Rejected: ${notes}`,
          updated_at: new Date().toISOString()
        })
        .eq("id", deposit.id);

      if (error) {
        console.error("Transaction rejection error:", error);
        throw new Error(`Failed to reject transaction: ${error.message}`);
      }

      toast({
        title: "Deposit Rejected",
        description: `Deposit from ${deposit.profiles.username} has been rejected`,
      });

      // Remove the rejected deposit from the list immediately
      setPendingDeposits(prev => prev.filter(d => d.id !== deposit.id));
      // Clear rejection notes
      setRejectionNotes(prev => ({ ...prev, [deposit.id]: "" }));
    } catch (error: any) {
      console.error("Rejection error:", error);
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject deposit",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-tacktix-blue"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Pending Deposit Verifications
            {pendingDeposits.length > 0 && (
              <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                {pendingDeposits.length}
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchPendingDeposits}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {pendingDeposits.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <CheckCircle className="h-12 w-12 mx-auto mb-4" />
            <p>No pending deposits to verify</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingDeposits.map((deposit) => (
              <div key={deposit.id} className="border border-white/10 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{deposit.profiles.username}</h3>
                    <p className="text-sm text-gray-400">Phone: {deposit.profiles.phone || "Not provided"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-tacktix-blue">₦{Number(deposit.amount).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(deposit.created_at).toLocaleDateString()} at{" "}
                      {new Date(deposit.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 p-3 rounded-lg">
                  <p className="text-sm"><strong>Transaction ID:</strong> {deposit.id}</p>
                  <p className="text-sm mt-1"><strong>Description:</strong> {deposit.description}</p>
                </div>

                <div className="space-y-2">
                  <Textarea
                    placeholder="Reason for rejection (only fill if rejecting)..."
                    value={rejectionNotes[deposit.id] || ""}
                    onChange={(e) => setRejectionNotes(prev => ({ ...prev, [deposit.id]: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApproveDeposit(deposit)}
                    disabled={processingId === deposit.id}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {processingId === deposit.id ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve & Credit
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="destructive"
                    onClick={() => handleRejectDeposit(deposit)}
                    disabled={processingId === deposit.id}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DepositVerification;
