
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Crown, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateMatchTabProps {
  gameModes: Array<{
    id: string;
    name: string;
    icon: React.ReactElement;
    maps: string[];
  }>;
  activeMode: string;
  setActiveMode: (mode: string) => void;
  selectedMap: string;
  setSelectedMap: (map: string) => void;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  lobbyCode: string;
  setLobbyCode: (code: string) => void;
  hostNotes: string;
  setHostNotes: (notes: string) => void;
  entryFee: string;
  setEntryFee: (fee: string) => void;
  maxPlayers: string;
  setMaxPlayers: (players: string) => void;
  scheduledTime: string;
  setScheduledTime: (time: string) => void;
  teamSize: string;
  setTeamSize: (size: string) => void;
  isVIPMatch: boolean;
  setIsVIPMatch: (vip: boolean) => void;
  onCreateMatch: () => void;
  isLoading: boolean;
}

const CreateMatchTab = ({
  gameModes,
  activeMode,
  setActiveMode,
  selectedMap,
  setSelectedMap,
  title,
  setTitle,
  description,
  setDescription,
  lobbyCode,
  setLobbyCode,
  hostNotes,
  setHostNotes,
  entryFee,
  setEntryFee,
  maxPlayers,
  setMaxPlayers,
  scheduledTime,
  setScheduledTime,
  teamSize,
  setTeamSize,
  isVIPMatch,
  setIsVIPMatch,
  onCreateMatch,
  isLoading
}: CreateMatchTabProps) => {
  const { toast } = useToast();

  const currentMode = gameModes.find(mode => mode.id === activeMode);

  const handleCreateMatch = () => {
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a match title",
        variant: "destructive"
      });
      return;
    }

    if (!activeMode) {
      toast({
        title: "Validation Error", 
        description: "Please select a game mode",
        variant: "destructive"
      });
      return;
    }

    if (!selectedMap && currentMode?.maps.length) {
      toast({
        title: "Validation Error",
        description: "Please select a map",
        variant: "destructive"
      });
      return;
    }

    const fee = parseFloat(entryFee);
    if (isNaN(fee) || fee < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid entry fee",
        variant: "destructive"
      });
      return;
    }

    if (isVIPMatch && fee < 10000) {
      toast({
        title: "VIP Match Error",
        description: "VIP matches require a minimum entry fee of ₦10,000",
        variant: "destructive"
      });
      return;
    }

    onCreateMatch();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Match
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">VIP Match</Label>
              <p className="text-xs text-gray-400">Higher stakes, exclusive features</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="vip-match"
                checked={isVIPMatch}
                onCheckedChange={setIsVIPMatch}
              />
              {isVIPMatch && (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                  <Crown className="h-3 w-3 mr-1" />
                  VIP
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Match Title *</Label>
              <Input
                id="title"
                placeholder="Enter match title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="entry-fee">Entry Fee (₦) *</Label>
              <Input
                id="entry-fee"
                type="number"
                placeholder={isVIPMatch ? "10000" : "0"}
                min={isVIPMatch ? "10000" : "0"}
                value={entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
                disabled={isLoading}
              />
              {isVIPMatch && (
                <p className="text-xs text-yellow-500 mt-1">Minimum ₦10,000 for VIP matches</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your match rules and requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lobby-code">Lobby Code</Label>
              <Input
                id="lobby-code"
                placeholder="Enter lobby/room code..."
                value={lobbyCode}
                onChange={(e) => setLobbyCode(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-400 mt-1">Code for players to join your game lobby</p>
            </div>

            <div>
              <Label htmlFor="max-players">Max Players</Label>
              <Select value={maxPlayers} onValueChange={setMaxPlayers} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select max players" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Players</SelectItem>
                  <SelectItem value="4">4 Players</SelectItem>
                  <SelectItem value="6">6 Players</SelectItem>
                  <SelectItem value="8">8 Players</SelectItem>
                  <SelectItem value="10">10 Players</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="host-notes">Host Notes</Label>
            <Textarea
              id="host-notes"
              placeholder="Additional notes for opponents (rules, requirements, etc.)..."
              value={hostNotes}
              onChange={(e) => setHostNotes(e.target.value)}
              disabled={isLoading}
              rows={2}
            />
            <p className="text-xs text-gray-400 mt-1">Share any special rules or clarifications with opponents</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="team-size">Team Size</Label>
              <Select value={teamSize} onValueChange={setTeamSize} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1v1">1v1</SelectItem>
                  <SelectItem value="2v2">2v2</SelectItem>
                  <SelectItem value="3v3">3v3</SelectItem>
                  <SelectItem value="4v4">4v4</SelectItem>
                  <SelectItem value="5v5">5v5</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="scheduled-time">Scheduled Time (Optional)</Label>
              <Input
                id="scheduled-time"
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label>Game Mode *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {gameModes.map((mode) => (
                <Card
                  key={mode.id}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    activeMode === mode.id
                      ? "border-tacktix-blue bg-tacktix-blue/10"
                      : "border-white/10 hover:border-white/20"
                  }`}
                  onClick={() => setActiveMode(mode.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="flex justify-center mb-2">{mode.icon}</div>
                    <h3 className="font-medium text-sm">{mode.name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {currentMode?.maps.length > 0 && (
            <div>
              <Label>Map</Label>
              <Select value={selectedMap} onValueChange={setSelectedMap} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a map" />
                </SelectTrigger>
                <SelectContent>
                  {currentMode.maps.map((map) => (
                    <SelectItem key={map} value={map}>
                      {map}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            onClick={handleCreateMatch}
            disabled={isLoading}
            className="w-full"
            variant={isVIPMatch ? "gradient" : "default"}
          >
            {isLoading ? "Creating..." : `Create ${isVIPMatch ? "VIP " : ""}Match`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateMatchTab;
