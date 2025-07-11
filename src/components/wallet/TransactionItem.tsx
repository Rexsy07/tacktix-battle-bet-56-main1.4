
import { TableCell, TableRow } from "@/components/ui/table";
import TransactionIcon from "./TransactionIcon";
import TransactionStatus from "./TransactionStatus";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  created_at: string;
  description: string | null;
}

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem = ({ transaction }: TransactionItemProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatTransactionType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  return (
    <TableRow className="hover:bg-white/5">
      <TableCell>
        <div className="flex items-center gap-2">
          <TransactionIcon type={transaction.type} />
          <span>{formatTransactionType(transaction.type)}</span>
        </div>
      </TableCell>
      <TableCell>{formatDate(transaction.created_at)}</TableCell>
      <TableCell className="max-w-xs truncate">
        {transaction.description || "No description"}
      </TableCell>
      <TableCell className={`text-right font-medium ${
        transaction.type === 'deposit' || transaction.type === 'win' || transaction.type === 'refund'
          ? 'text-green-500' 
          : 'text-red-500'
      }`}>
        {transaction.type === 'deposit' || transaction.type === 'win' || transaction.type === 'refund'
          ? `+₦${transaction.amount.toLocaleString()}`
          : `-₦${transaction.amount.toLocaleString()}`}
      </TableCell>
      <TableCell>
        <TransactionStatus status={transaction.status} />
      </TableCell>
    </TableRow>
  );
};

export default TransactionItem;
