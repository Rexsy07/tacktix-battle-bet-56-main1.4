
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Smartphone, Building } from "lucide-react";

const QuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="space-y-2">
            <div className="flex items-center p-2 bg-tacktix-dark-light rounded-md">
              <CreditCard className="h-4 w-4 text-tacktix-blue mr-2" />
              <div className="text-sm">
                <div className="font-medium">Cards</div>
                <div className="text-xs text-gray-400">Instant • 1.5% fee</div>
              </div>
            </div>
            
            <div className="flex items-center p-2 bg-tacktix-dark-light rounded-md">
              <Building className="h-4 w-4 text-tacktix-blue mr-2" />
              <div className="text-sm">
                <div className="font-medium">Bank Transfer</div>
                <div className="text-xs text-gray-400">1-2 hours • 1% fee</div>
              </div>
            </div>
            
            <div className="flex items-center p-2 bg-tacktix-dark-light rounded-md">
              <Smartphone className="h-4 w-4 text-tacktix-blue mr-2" />
              <div className="text-sm">
                <div className="font-medium">Mobile Money</div>
                <div className="text-xs text-gray-400">Instant • 1.2% fee</div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-white/10">
          <div className="text-xs text-gray-400 space-y-1">
            <p>• Minimum deposit: ₦100</p>
            <p>• Maximum daily deposit: ₦1,000,000</p>
            <p>• All transactions are secured</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
