
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, PlusCircle } from "lucide-react";
import MatchCard from "./MatchCard";

interface BrowseMatchesTabProps {
  loading: boolean;
  filteredMatches: any[];
  formatTimeRemaining: (createdAt: string) => string;
  onCreateMatchClick: () => void;
}

const BrowseMatchesTab: React.FC<BrowseMatchesTabProps> = ({
  loading,
  filteredMatches,
  formatTimeRemaining,
  onCreateMatchClick
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <Card className="glass-card p-8 text-center">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tacktix-blue mb-4"></div>
              <h3 className="text-xl font-medium text-white mb-2">Loading Matches</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Fetching available matches. This won't take long.
              </p>
            </div>
          </Card>
        ) : filteredMatches.length > 0 ? (
          filteredMatches.map(match => (
            <MatchCard 
              key={match.id} 
              match={match} 
              formatTimeRemaining={formatTimeRemaining}
            />
          ))
        ) : (
          <Card className="glass-card p-8 text-center">
            <div className="flex flex-col items-center justify-center py-6">
              <AlertCircle size={48} className="text-gray-500 mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No Matches Found</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                We couldn't find any matches matching your search criteria. Try adjusting your filters or create your own match.
              </p>
              <Button variant="gradient" onClick={onCreateMatchClick}>
                Create a Match
                <PlusCircle size={16} className="ml-2" />
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BrowseMatchesTab;
