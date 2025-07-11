
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Timer } from "lucide-react";

interface MatchCardProps {
  match: any;
  formatTimeRemaining: (createdAt: string) => string;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, formatTimeRemaining }) => {
  // Don't allow joining if match already has an opponent
  const canJoin = !match.opponent_id && match.status === 'pending';
  
  return (
    <Card key={match.id} className="glass-card overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4 p-5 border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-center">
          <div className="flex items-center">
            <Badge variant="outline" className="bg-tacktix-blue/10 text-tacktix-blue">
              {match.game_mode}
            </Badge>
          </div>
          <h3 className="text-white font-medium mt-2">{match.map_name}</h3>
          <div className="flex items-center text-gray-400 text-sm mt-1">
            <Users size={14} className="mr-1 text-tacktix-blue" />
            <span>{match.team_size || "1v1"}</span>
          </div>
          <div className="text-tacktix-blue font-bold mt-2">₦{match.bet_amount?.toLocaleString() || '0'}</div>
        </div>
        
        <div className="md:w-2/4 p-5 border-b md:border-b-0 md:border-r border-white/5">
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-tacktix-dark-light rounded-full flex items-center justify-center text-sm font-medium mr-2">
                    {match.host?.username?.charAt(0) || "?"}
                  </div>
                  <div>
                    <div className="font-medium text-white">{match.host?.username || "Unknown"}</div>
                    <div className="text-xs text-gray-400">Host</div>
                  </div>
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <Timer size={14} className="mr-1" />
                  <span>Open for {formatTimeRemaining(match.created_at)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="w-full bg-tacktix-dark h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-tacktix-blue to-tacktix-blue-light h-2 rounded-full"
                  style={{ width: `${match.opponent_id ? '100%' : '50%'}` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1 joined</span>
                <span>{match.opponent_id ? 'Full' : '1 slot left'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:w-1/4 p-5 flex flex-col justify-center items-center">
          {canJoin ? (
            <Link to={`/join-match/${match.id}`} className="w-full mb-2">
              <Button variant="gradient" className="w-full">
                Join Match
              </Button>
            </Link>
          ) : (
            <Button variant="gradient" className="w-full mb-2" disabled>
              {match.opponent_id ? "Match Full" : "Not Available"}
            </Button>
          )}
          <Link to={`/featured-match/${match.id}`} className="w-full">
            <Button variant="outline" className="w-full text-xs">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default MatchCard;
