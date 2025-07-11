
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users, Plus, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Forum = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchMessages(selectedGroup.id);
      checkMembership(selectedGroup.id);
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from("forum_groups")
        .select(`
          *,
          creator:profiles!forum_groups_created_by_fkey(username),
          members:forum_group_members(count)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast({
        title: "Error",
        description: "Failed to fetch forum groups",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (groupId) => {
    try {
      const { data, error } = await supabase
        .from("forum_messages")
        .select(`
          *,
          user:profiles!forum_messages_user_id_fkey(username)
        `)
        .eq("group_id", groupId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const checkMembership = async (groupId) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("forum_group_members")
        .select("*")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .single();

      if (!data && !error) {
        await joinGroup(groupId);
      }
    } catch (error) {
      console.error("Error checking membership:", error);
    }
  };

  const joinGroup = async (groupId) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("forum_group_members")
        .insert({
          group_id: groupId,
          user_id: user.id
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const createGroup = async () => {
    if (!user || !newGroupName.trim()) return;

    try {
      const { data, error } = await supabase
        .from("forum_groups")
        .insert({
          name: newGroupName.trim(),
          description: newGroupDescription.trim() || null,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join the creator to the group
      await supabase
        .from("forum_group_members")
        .insert({
          group_id: data.id,
          user_id: user.id
        });

      toast({
        title: "Success",
        description: "Forum group created successfully!"
      });

      setNewGroupName("");
      setNewGroupDescription("");
      setIsCreateDialogOpen(false);
      fetchGroups();
    } catch (error) {
      console.error("Error creating group:", error);
      toast({
        title: "Error",
        description: "Failed to create forum group",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedGroup || !newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from("forum_messages")
        .insert({
          group_id: selectedGroup.id,
          user_id: user.id,
          message: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage("");
      fetchMessages(selectedGroup.id);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tacktix-blue"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-tacktix-blue">Community Forum</h1>
            <p className="text-gray-400">Join groups and chat with other players</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Forum Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Group Name</label>
                  <Input
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Enter group name..."
                    maxLength={50}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Textarea
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="Describe your group..."
                    rows={3}
                    maxLength={200}
                  />
                </div>
                <Button onClick={createGroup} className="w-full" disabled={!newGroupName.trim()}>
                  Create Group
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Groups List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Forum Groups ({groups.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedGroup?.id === group.id
                        ? "bg-tacktix-blue/20 border border-tacktix-blue"
                        : "bg-tacktix-dark-light hover:bg-tacktix-dark"
                    }`}
                    onClick={() => setSelectedGroup(group)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-white">{group.name}</h3>
                        <p className="text-xs text-gray-400">by {group.creator?.username || "Unknown"}</p>
                        {group.description && (
                          <p className="text-sm text-gray-300 mt-1 line-clamp-2">{group.description}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {group.members?.[0]?.count || 0}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {groups.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No forum groups yet</p>
                    <p className="text-sm">Create the first one!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedGroup ? (
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    {selectedGroup.name}
                  </CardTitle>
                  {selectedGroup.description && (
                    <p className="text-sm text-gray-400">{selectedGroup.description}</p>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                    {messages.map((message) => (
                      <div key={message.id} className="bg-tacktix-dark-light p-3 rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-tacktix-blue text-sm">
                            {message.user?.username || "Unknown"}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-white">{message.message}</p>
                      </div>
                    ))}
                    
                    {messages.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <p>No messages yet</p>
                        <p className="text-sm">Start the conversation!</p>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-[600px] flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-medium mb-2">Select a Group</h3>
                  <p>Choose a forum group to start chatting</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Forum;
