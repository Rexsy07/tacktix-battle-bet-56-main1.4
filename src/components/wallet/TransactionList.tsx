
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import TransactionFilters from "./TransactionFilters";
import TransactionTable from "./TransactionTable";
import TransactionEmptyState from "./TransactionEmptyState";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  created_at: string;
  description: string | null;
}

const TransactionList = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    fetchTransactions();
  }, [filter]);
  
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;
      
      let query = supabase
        .from("transactions")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
        
      if (filter !== "all") {
        query = query.eq("type", filter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getFilteredTransactions = () => {
    if (!searchQuery) return transactions;
    
    return transactions.filter(tx => 
      tx.type.includes(searchQuery.toLowerCase()) ||
      tx.status.includes(searchQuery.toLowerCase()) ||
      (tx.description && tx.description.includes(searchQuery.toLowerCase()))
    );
  };
  
  const filteredTransactions = getFilteredTransactions();
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>View your recent transactions</CardDescription>
          </div>
          
          <TransactionFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filter={filter}
            onFilterChange={setFilter}
            onRefresh={fetchTransactions}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <RefreshCw size={24} className="text-gray-400 animate-spin" />
          </div>
        ) : filteredTransactions.length > 0 ? (
          <TransactionTable transactions={filteredTransactions} />
        ) : (
          <TransactionEmptyState />
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionList;
