
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DisputeList from "@/components/moderator/DisputeList";
import UserList from "@/components/moderator/UserList";
import MatchList from "@/components/moderator/MatchList";
import DepositVerification from "@/components/admin/DepositVerification";
import ResultReviewList from "@/components/moderator/ResultReviewList";

const ModeratorPanel = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access the moderator panel",
        variant: "destructive",
      });
      navigate("/sign-in");
    } else {
      // Check if user has moderator access using is_moderator field
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_moderator')
        .eq('id', session.user.id)
        .single();

      if (error || !profile?.is_moderator) {
        toast({
          title: "Unauthorized",
          description: "You do not have permission to access this page",
          variant: "destructive",
        });
        navigate("/");
      }
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-tacktix-blue"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Moderator Panel</h1>
          <p className="text-gray-400">Manage disputes, users, matches, results, and deposits</p>
        </div>
        
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid grid-cols-5 w-full md:w-[700px]">
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="deposits">Deposits</TabsTrigger>
          </TabsList>
          
          <TabsContent value="results">
            <ResultReviewList />
          </TabsContent>
          
          <TabsContent value="disputes">
            <DisputeList />
          </TabsContent>
          
          <TabsContent value="users">
            <UserList />
          </TabsContent>
          
          <TabsContent value="matches">
            <MatchList />
          </TabsContent>
          
          <TabsContent value="deposits">
            <DepositVerification />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ModeratorPanel;
