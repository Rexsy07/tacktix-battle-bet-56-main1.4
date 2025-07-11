import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Crown, Plus, Gamepad2, Target, Zap, Users, Shield, Map, Crosshair } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatTimeRemaining } from "@/utils/matchmaking-helpers";
import MatchCard from "@/components/matchmaking/MatchCard";

const Matchmaking = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("browse");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Create Match State
  const [activeMode, setActiveMode] = useState("search_destroy");
  const [selectedMap, setSelectedMap] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lobbyCode, setLobbyCode] = useState("");
  const [hostNotes, setHostNotes] = useState("");
  const [entryFee, setEntryFee] = useState("0");
  const [maxPlayers, setMaxPlayers] = useState("2");
  const [scheduledTime, setScheduledTime] = useState("");
  const [teamSize, setTeamSize] = useState("1v1");
  const [isVIPMatch, setIsVIPMatch] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const gameModes = [
    {
      id: "search_destroy",
      name: "Search & Destroy",
      icon: <Shield className="h-6 w-6" />,
      maps: ["Standoff", "Crash", "Crossfire", "Firing Range", "Summit"],
      teamSizes: ["1v1", "2v2", "3v3", "4v4", "5v5"]
    },
    {
      id: "hardpoint",
      name: "Hardpoint",
      icon: <Target className="h-6 w-6" />,
      maps: ["Nuketown", "Raid", "Hijacked", "Takeoff", "Scrapyard"],
      teamSizes: ["2v2", "3v3", "4v4", "5v5"]
    },
    {
      id: "domination",
      name: "Domination",
      icon: <Map className="h-6 w-6" />,
      maps: ["Terminal", "Hackney Yard", "Meltdown", "Tunisia", "Highrise"],
      teamSizes: ["3v3", "4v4", "5v5"]
    },
    {
      id: "team_deathmatch",
      name: "Team Deathmatch",
      icon: <Crosshair className="h-6 w-6" />,
      maps: ["Killhouse", "Shipment", "Rust", "Dome", "Coastal"],
      teamSizes: ["2v2", "3v3", "4v4", "5v5"]
    },
    {
      id: "gunfight",
      name: "Gunfight",
      icon: <Target className="h-6 w-6" />,
      maps: ["King", "Pine", "Gulag Showers", "Docks", "Saloon"],
      teamSizes: ["1v1", "2v2"]
    },
    {
      id: "battle_royale",
      name: "Battle Royale",
      icon: <Crown className="h-6 w-6" />,
      maps: ["Isolated", "Alcatraz"],
      teamSizes: ["Solo", "Duo", "Squad"]
    }
  ];

  const matchCategories = [
    { id: "all", name: "All Matches" },
    { id: "1v1", name: "1v1 Matches" },
    { id: "2v2", name: "2v2 Matches" },
    { id: "3v3", name: "3v3 Matches" },
    { id: "4v4", name: "4v4 Matches" },
    { id: "5v5", name: "5v5 Matches" },
    { id: "battle_royale", name: "Battle Royale" },
    { id: "vip", name: "VIP Matches" }
  ];

  useEffect(() => {
    if (activeTab === "browse") {
      fetchMatches();
    }
  }, [activeTab, selectedCategory]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("matches")
        .select(`
          *,
          host:profiles!matches_created_by_fkey(username)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      // Apply category filter
      if (selectedCategory !== "all") {
        if (selectedCategory === "vip") {
          query = query.eq("is_vip_match", true);
        } else if (selectedCategory === "battle_royale") {
          query = query.eq("game_mode", "battle_royale");
        } else {
          query = query.eq("team_size", selectedCategory);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setMatches(data || []);
    } catch (error: any) {
      console.error("Error fetching matches:", error);
      toast({
        title: "Error",
        description: "Failed to fetch matches",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMatch = async () => {
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a match title",
        variant: "destructive"
      });
      return;
    }

    if (!selectedMap) {
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

    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Calculate team players based on team size
      let teamPlayers = 1;
      if (activeMode === "battle_royale") {
        teamPlayers = teamSize === "Solo" ? 1 : teamSize === "Duo" ? 2 : 4;
      } else {
        const sizeMatch = teamSize.match(/(\d+)v\d+/);
        if (sizeMatch) {
          teamPlayers = parseInt(sizeMatch[1]);
        }
      }

      const { error } = await supabase
        .from("matches")
        .insert({
          created_by: user.id,
          host_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          game_mode: activeMode,
          map_name: selectedMap,
          lobby_code: lobbyCode.trim() || null,
          host_notes: hostNotes.trim() || null,
          entry_fee: fee,
          bet_amount: fee,
          prize_pool: fee * 2,
          max_players: parseInt(maxPlayers),
          team_size: teamSize,
          team_players: teamPlayers,
          scheduled_time: scheduledTime || null,
          is_vip_match: isVIPMatch,
          status: "pending"
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Match created successfully!",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setLobbyCode("");
      setHostNotes("");
      setEntryFee("0");
      setScheduledTime("");
      setSelectedMap("");
      setActiveTab("browse");
    } catch (error: any) {
      console.error("Error creating match:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create match",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const currentMode = gameModes.find(mode => mode.id === activeMode);
  const getMaxPlayersForMode = () => {
    if (!currentMode) return [];
    
    switch(activeMode) {
      case "gunfight":
        return teamSize === "1v1" ? ["2"] : ["4"];
      case "battle_royale":
        return teamSize === "Solo" ? ["1"] : teamSize === "Duo" ? ["4"] : ["8"];
      case "search_destroy":
        return teamSize === "1v1" ? ["2"] : teamSize === "2v2" ? ["4"] : teamSize === "3v3" ? ["6"] : teamSize === "4v4" ? ["8"] : ["10"];
      default:
        return teamSize === "2v2" ? ["4"] : teamSize === "3v3" ? ["6"] : teamSize === "4v4" ? ["8"] : ["10"];
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-tacktix-blue mb-2">Find Your Perfect Match</h1>
          <p className="text-gray-400">
            Challenge players in Call of Duty Mobile matches with real money prizes
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Matches</TabsTrigger>
            <TabsTrigger value="create">Create Match</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            {/* Category Filter */}
            <Card>
              <CardHeader>
                <CardTitle>Filter by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {matchCategories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {loading ? (
                  <Card className="glass-card p-8 text-center">
                    <div className="flex flex-col items-center justify-center py-6">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tacktix-blue mb-4"></div>
                      <h3 className="text-xl font-medium text-white mb-2">Loading Matches</h3>
                      <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        Fetching available COD Mobile matches...
                      </p>
                    </div>
                  </Card>
                ) : Array.isArray(matches) && matches.length > 0 ? (
                  matches.map(match => (
                    <MatchCard 
                      key={match.id} 
                      match={match} 
                      formatTimeRemaining={formatTimeRemaining}
                    />
                  ))
                ) : (
                  <Card className="glass-card p-8 text-center">
                    <div className="flex flex-col items-center justify-center py-6">
                      <Gamepad2 size={48} className="text-gray-500 mb-4" />
                      <h3 className="text-xl font-medium text-white mb-2">No Matches Found</h3>
                      <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        No COD Mobile matches available in this category. Create your own match to get started!
                      </p>
                      <Button variant="gradient" onClick={() => setActiveTab("create")}>
                        Create a Match
                        <Plus size={16} className="ml-2" />
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New COD Mobile Match
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
                      disabled={isCreating}
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
                      disabled={isCreating}
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
                    disabled={isCreating}
                    rows={3}
                  />
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
                        onClick={() => {
                          setActiveMode(mode.id);
                          setSelectedMap("");
                          setTeamSize(mode.teamSizes[0]);
                        }}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="flex justify-center mb-2">{mode.icon}</div>
                          <h3 className="font-medium text-sm">{mode.name}</h3>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {currentMode && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Team Size *</Label>
                        <Select value={teamSize} onValueChange={(value) => {
                          setTeamSize(value);
                          const maxPlayersOptions = getMaxPlayersForMode();
                          setMaxPlayers(maxPlayersOptions[0] || "2");
                        }} disabled={isCreating}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team size" />
                          </SelectTrigger>
                          <SelectContent>
                            {currentMode.teamSizes.map((size) => (
                              <SelectItem key={size} value={size}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Map *</Label>
                        <Select value={selectedMap} onValueChange={setSelectedMap} disabled={isCreating}>
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="lobby-code">Lobby Code</Label>
                        <Input
                          id="lobby-code"
                          placeholder="Enter lobby/room code..."
                          value={lobbyCode}
                          onChange={(e) => setLobbyCode(e.target.value)}
                          disabled={isCreating}
                        />
                      </div>

                      <div>
                        <Label htmlFor="scheduled-time">Scheduled Time (Optional)</Label>
                        <Input
                          id="scheduled-time"
                          type="datetime-local"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          disabled={isCreating}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="host-notes">Host Notes</Label>
                      <Textarea
                        id="host-notes"
                        placeholder="Additional notes for opponents (rules, requirements, etc.)..."
                        value={hostNotes}
                        onChange={(e) => setHostNotes(e.target.value)}
                        disabled={isCreating}
                        rows={2}
                      />
                    </div>
                  </>
                )}

                <Button
                  onClick={handleCreateMatch}
                  disabled={isCreating || !currentMode || !selectedMap}
                  className="w-full"
                  variant={isVIPMatch ? "gradient" : "default"}
                >
                  {isCreating ? "Creating..." : `Create ${isVIPMatch ? "VIP " : ""}Match`}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Matchmaking;
