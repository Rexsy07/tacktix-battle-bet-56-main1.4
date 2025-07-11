
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Shield, Ban, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  username: string;
  avatar_url: string | null;
  is_vip: boolean;
  is_moderator: boolean;
  rating: number;
  total_matches: number;
  wins: number;
  losses: number;
  created_at: string;
}

const UserList = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleModerator = async (userId: string, isModerator: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_moderator: !isModerator })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User moderator status updated`,
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-tacktix-blue"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          User Management ({users.length})
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Search users..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-4" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="border border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{user.username}</h4>
                      {user.is_vip && <Badge variant="secondary">VIP</Badge>}
                      {user.is_moderator && <Badge>Moderator</Badge>}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                      <div>
                        <span className="block text-white">Rating</span>
                        {user.rating || 1000}
                      </div>
                      <div>
                        <span className="block text-white">Matches</span>
                        {user.total_matches || 0}
                      </div>
                      <div>
                        <span className="block text-white">W/L</span>
                        {user.wins || 0}/{user.losses || 0}
                      </div>
                      <div>
                        <span className="block text-white">Joined</span>
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={user.is_moderator ? "destructive" : "outline"}
                      onClick={() => handleToggleModerator(user.id, user.is_moderator || false)}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {user.is_moderator ? "Remove Mod" : "Make Mod"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserList;
