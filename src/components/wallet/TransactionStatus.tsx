
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface TransactionStatusProps {
  status: string;
}

const TransactionStatus = ({ status }: TransactionStatusProps) => {
  if (status === 'completed') {
    return (
      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
        <CheckCircle size={12} className="mr-1" />
        Completed
      </Badge>
    );
  }
  
  if (status === 'pending') {
    return (
      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
        <Clock size={12} className="mr-1" />
        Pending
      </Badge>
    );
  }
  
  if (status === 'failed') {
    return (
      <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
        <XCircle size={12} className="mr-1" />
        Failed
      </Badge>
    );
  }
  
  return null;
};

export default TransactionStatus;
