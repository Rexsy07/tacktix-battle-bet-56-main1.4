
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Sword, Target, Crosshair, Map, Clock, Shield, Gamepad2, User, Copy, Badge } from "lucide-react";

const DuelChallenge = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mode, setMode] = useState("snd");
  const [map, setMap] = useState("");
  const [betAmount, setBetAmount] = useState(1000);
  const [customBet, setCustomBet] = useState("");
  const [rules, setRules] = useState("standard");
  const [voiceChat, setVoiceChat] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [challengeCode, setChallengeCode] = useState("");
  
  const gameModes = [
    { id: "snd", name: "Search & Destroy", icon: <Shield size={20} />, maps: ["Standoff", "Crash", "Crossfire", "Firing Range", "Summit"] },
    { id: "gf", name: "Gunfight", icon: <Sword size={20} />, maps: ["King", "Pine", "Gulag Showers", "Docks", "Saloon"] },
    { id: "tdm", name: "Team Deathmatch", icon: <Crosshair size={20} />, maps: ["Killhouse", "Shipment", "Rust", "Nuketown"] },
    { id: "so", name: "Snipers Only", icon: <Target size={20} />, maps: ["Crossfire", "Highrise", "Tunisia", "Oasis"] },
  ];
  
  const activeGameMode = gameModes.find(m => m.id === mode);
  
  const rulesets = [
    { id: "standard", name: "Standard Rules", description: "Official competitive ruleset" },
    { id: "quickscope", name: "Quickscope Only", description: "No hardscoping, snipers only" },
    { id: "knives", name: "Knives Only", description: "Melee weapons only, no guns" },
    { id: "pistols", name: "Pistols Only", description: "Secondary weapons only" },
  ];
  
  const handleGenerateChallenge = () => {
    if (!map) {
      toast({
        title: "Map Required",
        description: "Please select a map for the duel",
        variant: "destructive",
      });
      return;
    }
    
    // Custom bet amount validation
    if (customBet && parseInt(customBet) < 1000) {
      toast({
        title: "Invalid Bet Amount",
        description: "Minimum bet amount is ₦1,000",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
      setChallengeCode("DUEL-" + Math.random().toString(36).substring(2, 8).toUpperCase());
      toast({
        title: "Duel Challenge Created!",
        description: "Your challenge is ready to be shared",
        variant: "default",
      });
    }, 1500);
  };
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(challengeCode);
    toast({
      title: "Copied!",
      description: "Challenge code copied to clipboard",
    });
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">1v1 Duel Challenge</h1>
        <p className="text-gray-400 mb-6">Create a custom 1v1 challenge and share it with any player</p>
        
        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="setup" className="flex-1">Setup Challenge</TabsTrigger>
            <TabsTrigger value="preview" className="flex-1">Preview</TabsTrigger>
            {challengeCode && <TabsTrigger value="share" className="flex-1">Share Challenge</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="setup">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle>Game Settings</CardTitle>
                  <CardDescription>Set up the parameters for your 1v1 challenge</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Game Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                      {gameModes.map(gameMode => (
                        <Button
                          key={gameMode.id}
                          type="button"
                          variant={mode === gameMode.id ? "gradient" : "outline"}
                          className={mode !== gameMode.id ? "bg-tacktix-dark-light border-white/10" : ""}
                          onClick={() => {
                            setMode(gameMode.id);
                            setMap("");
                          }}
                        >
                          <div className="flex items-center">
                            {gameMode.icon}
                            <span className="ml-2">{gameMode.name}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Map</label>
                    <Select value={map} onValueChange={setMap}>
                      <SelectTrigger className="bg-tacktix-dark-light text-white">
                        <SelectValue placeholder="Select a map" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeGameMode?.maps.map(mapName => (
                          <SelectItem key={mapName} value={mapName}>{mapName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ruleset</label>
                    <Select value={rules} onValueChange={setRules}>
                      <SelectTrigger className="bg-tacktix-dark-light text-white">
                        <SelectValue placeholder="Select rules" />
                      </SelectTrigger>
                      <SelectContent>
                        {rulesets.map(ruleset => (
                          <SelectItem key={ruleset.id} value={ruleset.id}>
                            {ruleset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Voice Chat Required</label>
                      <p className="text-xs text-gray-400">Enable in-game voice communication</p>
                    </div>
                    <Switch 
                      checked={voiceChat} 
                      onCheckedChange={setVoiceChat} 
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle>Bet Settings</CardTitle>
                  <CardDescription>Set your wager amount for this challenge</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bet Amount (₦)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[1000, 2000, 5000].map(amount => (
                        <Button
                          key={amount}
                          type="button"
                          variant={betAmount === amount && !customBet ? "gradient" : "outline"}
                          className={betAmount !== amount || customBet ? "bg-tacktix-dark-light border-white/10" : ""}
                          onClick={() => {
                            setBetAmount(amount);
                            setCustomBet("");
                          }}
                        >
                          ₦{amount.toLocaleString()}
                        </Button>
                      ))}
                    </div>
                    
                    <div className="mt-3">
                      <label className="text-sm font-medium mb-1 block">Custom Amount (min ₦1,000)</label>
                      <Input
                        type="number"
                        placeholder="Enter custom amount"
                        className="bg-tacktix-dark-light text-white"
                        value={customBet}
                        onChange={(e) => {
                          setCustomBet(e.target.value);
                          if (parseInt(e.target.value) >= 1000) {
                            setBetAmount(parseInt(e.target.value));
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Bet Summary</p>
                    <div className="bg-tacktix-blue/10 border border-tacktix-blue/20 rounded-md p-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Bet Amount:</span>
                        <span className="font-medium">₦{betAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Platform Fee (5%):</span>
                        <span className="font-medium">₦{(betAmount * 0.05).toLocaleString()}</span>
                      </div>
                      <div className="border-t border-tacktix-blue/20 my-2 pt-2 flex justify-between">
                        <span className="text-sm font-medium">Potential Winnings:</span>
                        <span className="font-bold text-tacktix-blue">₦{(betAmount * 1.9).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="gradient" 
                    className="w-full" 
                    onClick={handleGenerateChallenge}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        Generating Challenge...
                      </>
                    ) : (
                      <>
                        Generate Challenge
                        <Trophy className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="preview">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Challenge Preview</CardTitle>
                    <CardDescription>How your challenge will appear to other players</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2 bg-tacktix-blue/10 text-tacktix-blue text-sm px-3 py-1 rounded-full">
                    <Gamepad2 size={16} />
                    <span>1v1 Duel</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="glass-card rounded-lg p-4 border-white/5 mb-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar>
                          <AvatarFallback className="bg-tacktix-dark-light">
                            <User />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">You</div>
                          <div className="text-xs text-tacktix-blue">Host</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="flex items-center text-sm">
                          <Map size={14} className="text-gray-400 mr-1" />
                          <span>{map || "Select a map"}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock size={14} className="text-gray-400 mr-1" />
                          <span>~15 min</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Sword size={14} className="text-gray-400 mr-1" />
                          <span>{activeGameMode?.name || "Select mode"}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Badge size={14} className="text-gray-400 mr-1" />
                          <span>{rulesets.find(r => r.id === rules)?.name || "Standard Rules"}</span>
                        </div>
                      </div>
                      
                      <div className="text-center text-2xl font-bold text-tacktix-blue">
                        ₦{betAmount.toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Match Rules</h3>
                      <div className="bg-tacktix-dark-light/30 rounded-md p-3 text-sm space-y-1">
                        <p>• {rulesets.find(r => r.id === rules)?.description || "Standard competitive ruleset"}</p>
                        <p>• First to win 5 rounds (best of 9)</p>
                        <p>• 2 minute time limit per round</p>
                        <p>• Voice chat {voiceChat ? 'required' : 'optional'}</p>
                        <p>• Screenshots required for score verification</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <div className="glass-card rounded-lg p-4 border-white/5 flex-1 flex flex-col">
                      <div className="text-center py-4 flex-1 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-tacktix-dark-light/50 flex items-center justify-center mb-4">
                          <User size={32} className="text-gray-400" />
                        </div>
                        <p className="text-gray-400 mb-1">Waiting for opponent...</p>
                        <p className="text-xs text-gray-500">Share your challenge code to invite a player</p>
                      </div>
                      
                      <Button variant="outline" className="w-full" disabled>
                        Join Challenge
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {challengeCode && (
            <TabsContent value="share">
              <Card className="glass-card border-white/10 text-center">
                <CardHeader>
                  <CardTitle>Your Challenge is Ready!</CardTitle>
                  <CardDescription>Share this code with any player to challenge them</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-tacktix-blue/10 border border-tacktix-blue/20 rounded-lg p-6 mx-auto max-w-sm">
                    <p className="text-sm text-gray-400 mb-2">Challenge Code</p>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-2xl font-mono font-bold tracking-widest text-tacktix-blue">{challengeCode}</span>
                      <Button variant="ghost" size="icon" onClick={handleCopyCode}>
                        <Copy size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-gray-300">Challenge Details</p>
                    <div className="grid grid-cols-2 gap-y-2 max-w-sm mx-auto text-sm">
                      <div className="text-right pr-4 text-gray-400">Game Mode:</div>
                      <div className="text-left font-medium">{activeGameMode?.name}</div>
                      
                      <div className="text-right pr-4 text-gray-400">Map:</div>
                      <div className="text-left font-medium">{map}</div>
                      
                      <div className="text-right pr-4 text-gray-400">Rules:</div>
                      <div className="text-left font-medium">{rulesets.find(r => r.id === rules)?.name}</div>
                      
                      <div className="text-right pr-4 text-gray-400">Bet Amount:</div>
                      <div className="text-left font-medium text-tacktix-blue">₦{betAmount.toLocaleString()}</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-3">
                  <Button
                    variant="gradient"
                    onClick={() => navigate(`/match/${challengeCode}`)}
                  >
                    View Challenge
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setChallengeCode("");
                      // Fix: Use querySelector to get the element and then dispatch a click event instead of using .click()
                      const setupTab = document.querySelector('[data-value="setup"]');
                      if (setupTab) {
                        setupTab.dispatchEvent(new MouseEvent('click', {
                          bubbles: true,
                          cancelable: true,
                          view: window
                        }));
                      }
                    }}
                  >
                    Create Another Challenge
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default DuelChallenge;
