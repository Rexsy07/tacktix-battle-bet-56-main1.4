
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Clock, AlertCircle, Info, AlertTriangle, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Announcements = () => {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select(`
          *,
          creator:profiles!announcements_created_by_fkey(username)
        `)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast({
        title: "Error",
        description: "Failed to fetch announcements",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <Zap className="w-4 h-4" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'normal':
        return <Info className="w-4 h-4" />;
      case 'low':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'normal':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'low':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <div className="text-center">
          <h1 className="text-3xl font-bold text-tacktix-blue mb-2">Announcements</h1>
          <p className="text-gray-400">Stay updated with the latest news and updates</p>
        </div>

        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="glass-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-tacktix-blue/10">
                      <Megaphone className="w-5 h-5 text-tacktix-blue" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{announcement.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getPriorityColor(announcement.priority)}>
                          {getPriorityIcon(announcement.priority)}
                          <span className="ml-1 capitalize">{announcement.priority}</span>
                        </Badge>
                        <div className="flex items-center text-sm text-gray-400">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDate(announcement.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 whitespace-pre-wrap">{announcement.content}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-gray-400">
                    Posted by {announcement.creator?.username || "TacktixEdge Team"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}

          {announcements.length === 0 && (
            <Card className="glass-card p-8 text-center">
              <div className="flex flex-col items-center justify-center py-6">
                <Megaphone size={48} className="text-gray-500 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No Announcements</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  There are no announcements at the moment. Check back later for updates!
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Announcements;
