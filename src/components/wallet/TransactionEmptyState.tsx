
import { Calendar } from "lucide-react";

const TransactionEmptyState = () => {
  return (
    <div className="text-center py-12">
      <div className="mx-auto h-12 w-12 rounded-full bg-tacktix-dark-light flex items-center justify-center mb-4">
        <Calendar size={24} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">No Transactions Found</h3>
      <p className="text-gray-400 max-w-md mx-auto">
        We couldn't find any transactions matching your search criteria. Try adjusting your filters.
      </p>
    </div>
  );
};

export default TransactionEmptyState;
