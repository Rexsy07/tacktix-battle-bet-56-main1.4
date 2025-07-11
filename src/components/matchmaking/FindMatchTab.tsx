
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FindMatchTab: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card className="glass-card sticky top-24">
          <CardHeader>
            <CardTitle>Match Preferences</CardTitle>
            <CardDescription>Set your game preferences for matchmaking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-gray-400">
              Matchmaking feature coming soon!
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="md:col-span-2">
        <Card className="glass-card h-full">
          <CardHeader>
            <CardTitle>Available Players</CardTitle>
            <CardDescription>Players currently looking for matches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-400">
              No players are currently looking for matches.
              <div className="mt-4">
                <Button variant="default" size="sm">
                  Create a Match
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FindMatchTab;
