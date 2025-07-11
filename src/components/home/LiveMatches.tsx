
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatTimeRemaining } from "@/utils/matchmaking-helpers";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Activity, CircleDollarSign } from "lucide-react";

interface LiveMatchesProps {
  matches?: any[];
  isLoading?: boolean;
}

const LiveMatches = ({ matches = [], isLoading = false }: LiveMatchesProps) => {
  const placeholderMatches = Array(6).fill(null);

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-tacktix-blue rounded-full filter blur-[220px] opacity-10"></div>
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Live <span className="text-tacktix-blue">Matches</span>
            </h2>
            <p className="text-gray-400 max-w-md">
              Watch live matches happening right now. Join as a spectator or wait for your turn.
            </p>
          </div>
          <Button variant="outline" className="mt-4 md:mt-0">
            View All Matches <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            placeholderMatches.map((_, index) => (
              <Card key={index} className="bg-tacktix-dark-lighter">
                <CardContent className="p-0">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="ml-3">
                          <Skeleton className="h-4 w-24 mb-2" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold">
                        <Skeleton className="h-6 w-10" />
                      </div>
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : matches.length > 0 ? (
            matches.map((match) => (
              <Card key={match.id} className="bg-tacktix-dark-lighter overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="outline" className="bg-tacktix-blue/10 text-tacktix-blue border-tacktix-blue/20 flex items-center">
                        <Activity className="mr-1 h-3 w-3" />
                        Live Match
                      </Badge>
                      <div className="flex items-center text-sm text-gray-400">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span>{formatTimeRemaining(match.created_at)}</span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <h3 className="font-medium text-lg">{match.game_mode}</h3>
                      <p className="text-sm text-gray-400">Map: {match.map_name}</p>
                    </div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={match.host?.avatar_url || ""} />
                          <AvatarFallback>{match.host?.username.substring(0, 2) || "?"}</AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <p className="font-medium">{match.host?.username || "Unknown"}</p>
                          <p className="text-xs text-gray-400">Host</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <CircleDollarSign className="h-4 w-4 text-green-500 mr-1" />
                        <span className="font-bold">₦{match.bet_amount.toLocaleString()}</span>
                      </div>
                    </div>
                    <Link to={`/match/${match.id}`}>
                      <Button variant="outline" className="w-full">
                        Watch Match
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <Activity className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-xl font-medium mb-2">No Live Matches</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                There are no matches currently live. Check back soon or create a match yourself!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LiveMatches;
