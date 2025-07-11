
import { 
  ArrowDownRight, ArrowUpRight, Award, XCircle, RefreshCw, 
  Star as StarIcon, Circle as CircleIcon 
} from "lucide-react";

interface TransactionIconProps {
  type: string;
}

const TransactionIcon = ({ type }: TransactionIconProps) => {
  switch (type) {
    case 'deposit':
      return <ArrowDownRight size={16} className="text-green-500" />;
    case 'withdrawal':
      return <ArrowUpRight size={16} className="text-red-500" />;
    case 'win':
      return <Award size={16} className="text-yellow-500" />;
    case 'loss':
      return <XCircle size={16} className="text-gray-500" />;
    case 'refund':
      return <RefreshCw size={16} className="text-blue-500" />;
    case 'vip_subscription':
      return <StarIcon size={16} className="text-purple-500" />;
    default:
      return <CircleIcon size={16} className="text-gray-500" />;
  }
};

export default TransactionIcon;
