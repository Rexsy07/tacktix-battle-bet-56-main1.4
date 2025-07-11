
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Trophy, Medal, Crown, Star } from "lucide-react";

interface LeaderboardProps {
  leaderboardData?: any[];
  isLoading?: boolean;
}

const Leaderboard = ({ leaderboardData = [], isLoading = false }: LeaderboardProps) => {
  const placeholderRows = Array(10).fill(null);

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[800px] h-[600px] bg-tacktix-purple rounded-full filter blur-[220px] opacity-5"></div>
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              <span className="text-gradient">Leaderboard</span>
            </h2>
            <p className="text-gray-400 max-w-md">
              Top players ranked by earnings. Compete to reach the top of the leaderboard!
            </p>
          </div>
          <Link to="/leaderboards">
            <Button variant="outline" className="mt-4 md:mt-0">
              View Full Leaderboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Card className="bg-tacktix-dark-lighter">
          <CardHeader className="pb-0">
            <CardTitle>Top Players</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead>Matches</TableHead>
                  <TableHead>Win Rate</TableHead>
                  <TableHead className="text-right">Total Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  placeholderRows.map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-5 w-24 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : leaderboardData.length > 0 ? (
                  leaderboardData.map((player, index) => (
                    <TableRow key={player.id}>
                      <TableCell>
                        {index === 0 ? (
                          <div className="h-8 w-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                          </div>
                        ) : index === 1 ? (
                          <div className="h-8 w-8 rounded-full bg-gray-400/20 flex items-center justify-center">
                            <Medal className="h-4 w-4 text-gray-400" />
                          </div>
                        ) : index === 2 ? (
                          <div className="h-8 w-8 rounded-full bg-amber-700/20 flex items-center justify-center">
                            <Medal className="h-4 w-4 text-amber-700" />
                          </div>
                        ) : (
                          <span className="font-medium text-gray-400">{index + 1}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link to={`/profile?id=${player.id}`} className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={player.profile?.avatar_url || ""} />
                            <AvatarFallback>{player.profile?.username?.substring(0, 2) || "?"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium">{player.profile?.username || "Unknown"}</span>
                            {player.profile?.is_vip && (
                              <Badge variant="outline" className="ml-2 bg-gradient-to-r from-amber-500 to-yellow-300 text-black border-0">
                                <Crown className="h-3 w-3 mr-1" /> VIP
                              </Badge>
                            )}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span>{player.matches_played}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-[60px] h-2 bg-tacktix-dark rounded-full overflow-hidden mr-2">
                            <div 
                              className="h-full bg-gradient-to-r from-tacktix-blue to-tacktix-purple"
                              style={{ width: `${player.win_rate || 0}%` }}
                            ></div>
                          </div>
                          <span>{player.win_rate || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        ₦{player.total_earnings.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="text-center py-8">
                        <Star className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                        <h3 className="text-xl font-medium mb-2">No Players Yet</h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                          Be the first to climb to the top of the leaderboard by playing and winning matches!
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Leaderboard;
