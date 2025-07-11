
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw } from "lucide-react";

interface TransactionFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter: string;
  onFilterChange: (filter: string) => void;
  onRefresh: () => void;
}

const TransactionFilters = ({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  onRefresh
}: TransactionFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
      <div className="relative md:w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <Input
          placeholder="Search transactions..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <Select value={filter} onValueChange={onFilterChange}>
        <SelectTrigger className="w-full md:w-[160px]">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Transactions</SelectItem>
          <SelectItem value="deposit">Deposits</SelectItem>
          <SelectItem value="withdrawal">Withdrawals</SelectItem>
          <SelectItem value="win">Winnings</SelectItem>
          <SelectItem value="loss">Losses</SelectItem>
          <SelectItem value="vip_subscription">VIP Subscriptions</SelectItem>
        </SelectContent>
      </Select>
      
      <Button variant="outline" size="icon" onClick={onRefresh}>
        <RefreshCw size={16} />
      </Button>
    </div>
  );
};

export default TransactionFilters;
