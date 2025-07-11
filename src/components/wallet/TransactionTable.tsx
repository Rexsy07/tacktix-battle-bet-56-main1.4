
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TransactionItem from "./TransactionItem";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  created_at: string;
  description: string | null;
}

interface TransactionTableProps {
  transactions: Transaction[];
}

const TransactionTable = ({ transactions }: TransactionTableProps) => {
  return (
    <div className="rounded-md overflow-hidden border border-white/10">
      <Table>
        <TableHeader className="bg-tacktix-dark-deeper">
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionTable;
