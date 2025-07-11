
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const ProfileSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    username: "",
    bio: "",
    country: "",
    skill_level: "beginner",
    gaming_experience: "beginner",
    favorite_game: "Call of Duty Mobile",
    preferred_game_modes: []
  });

  const countries = [
    "Nigeria", "Ghana", "Kenya", "South Africa", "Egypt", "Morocco", "Tunisia", 
    "Uganda", "Tanzania", "Ethiopia", "Other"
  ];

  const skillLevels = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
    { value: "expert", label: "Expert" },
    { value: "professional", label: "Professional" }
  ];

  const gameModes = [
    "Battle Royale", "Team Deathmatch", "Search & Destroy", "Hardpoint", 
    "Domination", "Gunfight", "Ranked", "Zombies"
  ];

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (data && !error) {
        setProfile({
          username: data.username || "",
          bio: data.bio || "",
          country: data.country || "",
          skill_level: data.skill_level || "beginner",
          gaming_experience: data.gaming_experience || "beginner",
          favorite_game: data.favorite_game || "Call of Duty Mobile",
          preferred_game_modes: data.preferred_game_modes || []
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleGameModeToggle = (mode) => {
    setProfile(prev => ({
      ...prev,
      preferred_game_modes: prev.preferred_game_modes.includes(mode)
        ? prev.preferred_game_modes.filter(m => m !== mode)
        : [...prev.preferred_game_modes, mode]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!profile.username.trim()) {
      toast({
        title: "Validation Error",
        description: "Username is required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: profile.username.trim(),
          bio: profile.bio.trim() || null,
          country: profile.country || null,
          skill_level: profile.skill_level,
          gaming_experience: profile.gaming_experience,
          favorite_game: profile.favorite_game,
          preferred_game_modes: profile.preferred_game_modes
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your profile has been updated successfully"
      });

      navigate("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-tacktix-blue mb-2">Complete Your Profile</h1>
          <p className="text-gray-400">
            Set up your gaming profile to connect with other players
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gaming Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={profile.username}
                    onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter your gaming username"
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select 
                    value={profile.country} 
                    onValueChange={(value) => setProfile(prev => ({ ...prev, country: value }))}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself and your gaming style..."
                  rows={4}
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="skill-level">Skill Level</Label>
                  <Select 
                    value={profile.skill_level} 
                    onValueChange={(value) => setProfile(prev => ({ ...prev, skill_level: value }))}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {skillLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="gaming-experience">Gaming Experience</Label>
                  <Select 
                    value={profile.gaming_experience} 
                    onValueChange={(value) => setProfile(prev => ({ ...prev, gaming_experience: value }))}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {skillLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Preferred Game Modes</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {gameModes.map((mode) => (
                    <Button
                      key={mode}
                      type="button"
                      variant={profile.preferred_game_modes.includes(mode) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleGameModeToggle(mode)}
                      disabled={loading}
                      className="text-xs"
                    >
                      {mode}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={loading}
                variant="gradient"
              >
                {loading ? "Saving..." : "Complete Setup"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProfileSetup;
