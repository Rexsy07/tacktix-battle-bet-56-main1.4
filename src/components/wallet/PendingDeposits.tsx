
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PendingDeposit {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  description: string;
}

const PendingDeposits = () => {
  const { toast } = useToast();
  const [pendingDeposits, setPendingDeposits] = useState<PendingDeposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPendingDeposits();
  }, []);

  const fetchPendingDeposits = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("type", "deposit")
        .in("status", ["pending", "pending_verification"])
        .order("created_at", { ascending: false });

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "pending_verification":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500";
      case "pending_verification":
        return "bg-orange-500/10 text-orange-500";
      case "completed":
        return "bg-green-500/10 text-green-500";
      case "rejected":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
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

  if (pendingDeposits.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Deposits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingDeposits.map((deposit) => (
            <div key={deposit.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(deposit.status)}
                <div>
                  <p className="font-medium">₦{Number(deposit.amount).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(deposit.created_at).toLocaleDateString()} at{" "}
                    {new Date(deposit.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={getStatusColor(deposit.status)}>
                {deposit.status === "pending_verification" ? "Awaiting Verification" : deposit.status}
              </Badge>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-400">
            <AlertCircle className="h-4 w-4 inline mr-1" />
            Deposits are verified within 1-24 hours during business days
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingDeposits;
