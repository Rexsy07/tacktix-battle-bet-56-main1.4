
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { User, Trophy, Target, TrendingUp, Edit3, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  favorite_game: string | null;
  country: string | null;
  date_of_birth: string | null;
  gaming_experience: string;
  preferred_game_modes: string[] | null;
  skill_level: string;
  total_matches: number;
  wins: number;
  total_earnings: number;
  rating: number;
  is_vip: boolean;
  created_at: string;
}

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    favorite_game: "",
    country: "",
    date_of_birth: "",
    gaming_experience: "beginner",
    preferred_game_modes: [] as string[],
    skill_level: "beginner"
  });

  const gameOptions = [
    "Call of Duty Mobile",
    "PUBG Mobile",
    "Free Fire",
    "Fortnite",
    "Apex Legends Mobile",
    "League of Legends Wild Rift"
  ];

  const experienceOptions = [
    { value: "beginner", label: "Beginner (0-6 months)" },
    { value: "intermediate", label: "Intermediate (6 months - 2 years)" },
    { value: "advanced", label: "Advanced (2-5 years)" },
    { value: "expert", label: "Expert (5+ years)" },
    { value: "professional", label: "Professional/Pro Player" }
  ];

  const gameModeOptions = [
    "Search & Destroy",
    "Hardpoint",
    "Domination",
    "Team Deathmatch",
    "Battle Royale",
    "Gunfight"
  ];

  useEffect(() => {
    checkAuthAndFetchProfile();
  }, []);

  const checkAuthAndFetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to view your profile",
        variant: "destructive",
      });
      navigate("/sign-in");
      return;
    }

    await fetchProfile(session.user.id);
  };

  const fetchProfile = async (userId: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setFormData({
          username: data.username || "",
          bio: data.bio || "",
          favorite_game: data.favorite_game || "",
          country: data.country || "",
          date_of_birth: data.date_of_birth || "",
          gaming_experience: data.gaming_experience || "beginner",
          preferred_game_modes: data.preferred_game_modes || [],
          skill_level: data.skill_level || "beginner"
        });
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: formData.username,
          bio: formData.bio,
          favorite_game: formData.favorite_game,
          country: formData.country,
          date_of_birth: formData.date_of_birth || null,
          gaming_experience: formData.gaming_experience,
          preferred_game_modes: formData.preferred_game_modes,
          skill_level: formData.skill_level,
          updated_at: new Date().toISOString()
        })
        .eq("id", profile.id);

      if (error) throw error;

      // Update local state
      setProfile({
        ...profile,
        ...formData
      });

      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!profile) return;
    
    setFormData({
      username: profile.username || "",
      bio: profile.bio || "",
      favorite_game: profile.favorite_game || "",
      country: profile.country || "",
      date_of_birth: profile.date_of_birth || "",
      gaming_experience: profile.gaming_experience || "beginner",
      preferred_game_modes: profile.preferred_game_modes || [],
      skill_level: profile.skill_level || "beginner"
    });
    setIsEditing(false);
  };

  const toggleGameMode = (mode: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_game_modes: prev.preferred_game_modes.includes(mode)
        ? prev.preferred_game_modes.filter(m => m !== mode)
        : [...prev.preferred_game_modes, mode]
    }));
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tacktix-blue"></div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-white mb-2">Profile not found</h3>
          <p className="text-gray-400">Unable to load profile data</p>
        </div>
      </Layout>
    );
  }

  const winRate = profile.total_matches > 0 ? (profile.wins / profile.total_matches) * 100 : 0;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-gray-400">Manage your gaming profile and preferences</p>
          </div>
          
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={profile.avatar_url || ""} />
                  <AvatarFallback className="text-2xl">
                    {profile.username?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{profile.username}</h3>
                  <div className="flex justify-center gap-2">
                    <Badge variant="outline">
                      {formData.skill_level?.charAt(0).toUpperCase() + formData.skill_level?.slice(1)}
                    </Badge>
                    {profile.is_vip && (
                      <Badge className="bg-yellow-500/10 text-yellow-500">VIP</Badge>
                    )}
                  </div>
                  {profile.country && (
                    <p className="text-gray-400">{profile.country}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Gaming Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Matches Played</span>
                  </div>
                  <span className="font-medium">{profile.total_matches}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Wins</span>
                  </div>
                  <span className="font-medium">{profile.wins}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Win Rate</span>
                  </div>
                  <span className="font-medium">{winRate.toFixed(1)}%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Rating</span>
                  </div>
                  <span className="font-medium">{profile.rating}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Total Earnings</span>
                  </div>
                  <span className="font-medium">₦{Number(profile.total_earnings).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      disabled={!isEditing}
                      className="bg-tacktix-dark-light"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="e.g., Nigeria"
                      className="bg-tacktix-dark-light"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                    className="bg-tacktix-dark-light"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="favorite_game">Favorite Game</Label>
                    <Select 
                      value={formData.favorite_game} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, favorite_game: value }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="bg-tacktix-dark-light">
                        <SelectValue placeholder="Select your favorite game" />
                      </SelectTrigger>
                      <SelectContent>
                        {gameOptions.map(game => (
                          <SelectItem key={game} value={game}>{game}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                      disabled={!isEditing}
                      className="bg-tacktix-dark-light"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gaming_experience">Gaming Experience</Label>
                    <Select 
                      value={formData.gaming_experience} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, gaming_experience: value }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="bg-tacktix-dark-light">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="skill_level">Skill Level</Label>
                    <Select 
                      value={formData.skill_level} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, skill_level: value }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="bg-tacktix-dark-light">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Preferred Game Modes</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {gameModeOptions.map(mode => (
                      <Button
                        key={mode}
                        type="button"
                        variant={formData.preferred_game_modes.includes(mode) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleGameMode(mode)}
                        disabled={!isEditing}
                        className="justify-start"
                      >
                        {mode}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
