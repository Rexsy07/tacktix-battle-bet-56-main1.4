
import { Button } from "@/components/ui/button";
import { Clock, Users, Trophy, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GameCardProps {
  id?: string;
  mode: string;
  map: string;
  betAmount: string;
  teamSize: string;
  timeLeft?: string;
  isLive?: boolean;
  players?: { name: string; winRate: string }[];
}

const GameCard = ({
  id = "default-match",
  mode,
  map,
  betAmount,
  teamSize,
  timeLeft,
  isLive = false,
  players,
}: GameCardProps) => {
  const navigate = useNavigate();
  
  const handleViewDetails = () => {
    navigate(`/featured-match/${id}`);
  };
  
  const handleJoinOrSpectate = () => {
    if (isLive) {
      navigate(`/spectate/${id}`);
    } else {
      navigate(`/join-match/${id}`);
    }
  };
  
  return (
    <div className="glass-card rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] group">
      <div className="relative">
        <div 
          className="h-40 bg-gradient-to-b from-tacktix-dark-light to-tacktix-dark-deeper flex items-center justify-center overflow-hidden"
          style={{
            backgroundImage: `url('/placeholder.svg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          
          {isLive && (
            <div className="absolute top-3 left-3 flex items-center space-x-2 bg-tacktix-red/90 text-white text-xs px-3 py-1 rounded-full">
              <span className="h-2 w-2 bg-white rounded-full animate-pulse"></span>
              <span>LIVE</span>
            </div>
          )}
          
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="font-bold text-white text-lg">{mode}</h3>
                <div className="flex items-center text-gray-300 text-xs mt-1">
                  <Map size={12} className="mr-1" />
                  <span>{map}</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-tacktix-blue font-bold">{betAmount}</div>
                <div className="flex items-center text-gray-300 text-xs mt-1">
                  <Users size={12} className="mr-1" />
                  <span>{teamSize}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {players && players.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs uppercase text-gray-400 mb-2">Players</h4>
            <div className="space-y-1">
              {players.map((player, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-white">{player.name}</span>
                  <span className="text-tacktix-blue">
                    {player.winRate} <span className="text-gray-400">WR</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {timeLeft && (
          <div className="flex items-center text-gray-400 text-sm mb-4">
            <Clock size={14} className="mr-2" />
            <span>Starts in {timeLeft}</span>
          </div>
        )}
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="flex-1 text-xs"
            onClick={handleViewDetails}
          >
            View Details
          </Button>
          <Button 
            variant="gradient" 
            className="flex-1 text-xs"
            onClick={handleJoinOrSpectate}
          >
            {isLive ? "Spectate" : "Join Match"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
