
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, Star, CircleDollarSign, Users } from "lucide-react";
import { formatTimeRemaining } from "@/utils/matchmaking-helpers";

interface FeaturedMatchesProps {
  matches?: any[];
  isLoading?: boolean;
}

const FeaturedMatches = ({ matches = [], isLoading = false }: FeaturedMatchesProps) => {
  const placeholderMatches = Array(5).fill(null);

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[600px] h-[500px] bg-tacktix-red rounded-full filter blur-[220px] opacity-10"></div>
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Featured <span className="text-tacktix-red">Matches</span>
            </h2>
            <p className="text-gray-400 max-w-md">
              High-stakes matches with the biggest rewards. Join now and get in on the action!
            </p>
          </div>
          <Link to="/matchmaking">
            <Button variant="outline" className="mt-4 md:mt-0">
              Browse All Matches <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {isLoading ? (
            placeholderMatches.map((_, index) => (
              <Card key={index} className={`bg-tacktix-dark-lighter ${index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <div className="mb-4">
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-24" />
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
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))
          ) : matches.length > 0 ? (
            matches.map((match, index) => (
              <Card 
                key={match.id} 
                className={`bg-tacktix-dark-lighter overflow-hidden group ${index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`}
              >
                <CardContent className={`p-5 ${index === 0 ? 'lg:p-6' : ''}`}>
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className="bg-tacktix-red/10 text-tacktix-red border-tacktix-red/20 flex items-center">
                      <Star className="mr-1 h-3 w-3" />
                      Featured Match
                    </Badge>
                    <div className="text-sm text-gray-400">
                      {formatTimeRemaining(match.created_at)}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className={`font-medium ${index === 0 ? 'text-xl' : 'text-lg'}`}>
                      {match.game_mode}
                    </h3>
                    <p className="text-sm text-gray-400">Map: {match.map_name}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <Avatar className={index === 0 ? 'h-12 w-12' : 'h-10 w-10'}>
                        <AvatarImage src={match.host?.avatar_url || ""} />
                        <AvatarFallback>{match.host?.username.substring(0, 2) || "?"}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <p className="font-medium">{match.host?.username || "Unknown"}</p>
                        <div className="flex items-center text-xs text-gray-400">
                          <Users className="h-3 w-3 mr-1" />
                          <span>{match.opponent ? "2/2" : "1/2"} Players</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <CircleDollarSign className={`text-green-500 mr-1 ${index === 0 ? 'h-5 w-5' : 'h-4 w-4'}`} />
                      <span className={`font-bold ${index === 0 ? 'text-2xl' : 'text-xl'}`}>
                        ₦{match.bet_amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  {match.opponent ? (
                    <Link to={`/match/${match.id}`}>
                      <Button variant="outline" className="w-full">
                        Spectate Match
                      </Button>
                    </Link>
                  ) : (
                    <Link to={`/join-match/${match.id}`}>
                      <Button variant="gradient" className="w-full">
                        Join Match
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-5 text-center py-12">
              <Star className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-xl font-medium mb-2">No Featured Matches</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                There are no featured matches available at the moment. Check back soon or create a high-stakes match!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedMatches;
