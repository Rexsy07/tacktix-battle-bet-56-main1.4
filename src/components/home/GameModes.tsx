
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { ArrowRight, Gamepad2 } from "lucide-react";

interface GameModesProps {
  modes?: { name: string; count: number }[];
  isLoading?: boolean;
}

const GameModes = ({ modes = [], isLoading = false }: GameModesProps) => {
  const defaultModes = [
    { name: "Search & Destroy", count: 0 },
    { name: "Team Deathmatch", count: 0 },
    { name: "Domination", count: 0 },
    { name: "Hardpoint", count: 0 },
    { name: "Gun Game", count: 0 },
    { name: "Free-For-All", count: 0 }
  ];
  
  const displayModes = modes.length > 0 ? modes : defaultModes;
  const placeholderModes = Array(6).fill(null);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Popular <span className="text-gradient">Game Modes</span>
            </h2>
            <p className="text-gray-400 max-w-md">
              Choose from a variety of game modes to test your skills and compete with other players.
            </p>
          </div>
          <Link to="/matchmaking">
            <Button variant="outline" className="mt-4 md:mt-0">
              Create a Match <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {isLoading ? (
            placeholderModes.map((_, index) => (
              <Card key={index} className="bg-tacktix-dark-lighter">
                <CardContent className="p-5">
                  <Skeleton className="h-12 w-12 rounded-full mb-4" />
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))
          ) : (
            displayModes.map((mode, index) => (
              <Card 
                key={index} 
                className="bg-tacktix-dark-lighter hover:bg-tacktix-dark-light transition-colors overflow-hidden"
              >
                <CardContent className="p-5">
                  <div className="mb-4">
                    <Gamepad2 className="h-12 w-12 text-tacktix-blue" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">{mode.name}</h3>
                  <p className="text-gray-400 mb-4">
                    {mode.count > 0 
                      ? `${mode.count} active matches`
                      : "Create or join a match in this mode"}
                  </p>
                  <Link to={`/matchmaking?mode=${encodeURIComponent(mode.name)}`}>
                    <Button variant="outline" className="w-full">
                      Find Matches
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default GameModes;
