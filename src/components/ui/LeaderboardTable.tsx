
import { Trophy } from "lucide-react";

interface Player {
  position: number;
  name: string;
  matches: number;
  winRate: string;
  earnings: string;
}

interface LeaderboardTableProps {
  players: Player[];
  title?: string;
}

const LeaderboardTable = ({ players, title = "Top Players" }: LeaderboardTableProps) => {
  return (
    <div className="glass-card rounded-lg p-5">
      <h3 className="text-lg font-semibold text-white flex items-center mb-4">
        <Trophy size={18} className="text-tacktix-blue mr-2" />
        {title}
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="py-3 px-2 text-left text-xs uppercase tracking-wider text-gray-400 font-medium">#</th>
              <th className="py-3 px-2 text-left text-xs uppercase tracking-wider text-gray-400 font-medium">Player</th>
              <th className="py-3 px-2 text-right text-xs uppercase tracking-wider text-gray-400 font-medium">Matches</th>
              <th className="py-3 px-2 text-right text-xs uppercase tracking-wider text-gray-400 font-medium">Win Rate</th>
              <th className="py-3 px-2 text-right text-xs uppercase tracking-wider text-gray-400 font-medium">Earnings</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr 
                key={player.position} 
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-3 px-2">
                  {player.position <= 3 ? (
                    <div className={`
                      h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${player.position === 1 ? 'bg-yellow-500/20 text-yellow-500' : 
                        player.position === 2 ? 'bg-gray-400/20 text-gray-400' : 
                        'bg-amber-700/20 text-amber-700'}
                    `}>
                      {player.position}
                    </div>
                  ) : (
                    <span className="text-gray-500 font-medium">{player.position}</span>
                  )}
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-tacktix-dark-light rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {player.name.charAt(0)}
                    </div>
                    <span className="font-medium text-white">{player.name}</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-right text-gray-400">
                  {player.matches}
                </td>
                <td className="py-3 px-2 text-right text-tacktix-blue font-medium">
                  {player.winRate}
                </td>
                <td className="py-3 px-2 text-right font-medium text-white">
                  {player.earnings}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardTable;
