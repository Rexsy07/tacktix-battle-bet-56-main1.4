
import { supabase } from "@/integrations/supabase/client";

export interface DisputeDetails {
  id: string;
  match_id: string;
  reported_by: string;
  reason: string;
  description: string;
  status: string;
  evidence_url: string | null;
  resolution: string | null;
  resolved_by: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  is_vip: boolean;
  rating: number;
  total_matches: number;
  wins: number;
  losses: number;
}

export interface ReportedUser {
  id: string;
  user: UserProfile;
  reportCount: number;
  status: string;
  latestReport: {
    created_at: string;
  };
}

export const fetchDisputes = async (status?: string): Promise<DisputeDetails[]> => {
  try {
    let query = supabase
      .from("disputes")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching disputes:", error);
    return [];
  }
};

export const getDisputes = async (status?: string, searchQuery?: string): Promise<{ success: boolean; data: DisputeDetails[] }> => {
  try {
    const disputes = await fetchDisputes(status);
    let filteredDisputes = disputes;
    
    if (searchQuery) {
      filteredDisputes = disputes.filter(dispute => 
        dispute.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dispute.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return { success: true, data: filteredDisputes };
  } catch (error) {
    console.error("Error getting disputes:", error);
    return { success: false, data: [] };
  }
};

export const getReportedUsers = async (status?: string, searchQuery?: string): Promise<{ success: boolean; data: ReportedUser[] }> => {
  try {
    // Get users who have been involved in disputes (as a proxy for reported users)
    const { data: disputes, error: disputesError } = await supabase
      .from("disputes")
      .select(`
        *,
        reported_user:profiles!disputes_reported_by_fkey(*)
      `)
      .order("created_at", { ascending: false });

    if (disputesError) throw disputesError;

    // Group disputes by reported user and count them
    const userReportCounts: { [key: string]: any } = {};
    disputes?.forEach(dispute => {
      if (dispute.reported_user) {
        const userId = dispute.reported_user.id;
        if (!userReportCounts[userId]) {
          userReportCounts[userId] = {
            user: dispute.reported_user,
            reportCount: 0,
            latestReport: { created_at: dispute.created_at },
            status: "active"
          };
        }
        userReportCounts[userId].reportCount++;
        if (new Date(dispute.created_at) > new Date(userReportCounts[userId].latestReport.created_at)) {
          userReportCounts[userId].latestReport = { created_at: dispute.created_at };
        }
      }
    });

    let reportedUsers = Object.values(userReportCounts) as ReportedUser[];
    
    if (status && status !== "all") {
      reportedUsers = reportedUsers.filter(user => user.status === status);
    }
    
    if (searchQuery) {
      reportedUsers = reportedUsers.filter(user => 
        user.user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return { success: true, data: reportedUsers };
  } catch (error) {
    console.error("Error getting reported users:", error);
    return { success: false, data: [] };
  }
};

export const updateDisputeStatus = async (
  disputeId: string,
  status: string,
  resolution?: string,
  adminNotes?: string,
  moderatorId?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (resolution) updateData.resolution = resolution;
    if (adminNotes) updateData.admin_notes = adminNotes;
    if (moderatorId) updateData.resolved_by = moderatorId;

    const { error } = await supabase
      .from("disputes")
      .update(updateData)
      .eq("id", disputeId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error updating dispute:", error);
    return { success: false, error: error.message };
  }
};

export const updateUserStatus = async (
  userId: string,
  action: "warn" | "suspend" | "ban" | "unban",
  moderatorId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Create a transaction record for the moderation action
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        type: 'moderation_action',
        amount: 0,
        description: `User ${action}ed by moderator`,
        status: 'completed'
      });

    if (transactionError) throw transactionError;

    // Update user profile to reflect the action
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);

    if (profileError) throw profileError;

    return { success: true };
  } catch (error: any) {
    console.error("Error updating user status:", error);
    return { success: false, error: error.message };
  }
};

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const suspendUser = async (
  userId: string,
  reason: string,
  duration: number,
  moderatorId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Create a suspension record
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        type: 'suspension',
        amount: 0,
        description: `Suspended for ${duration} days: ${reason}`,
        status: 'completed'
      });

    if (transactionError) throw transactionError;

    // Update user profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);

    if (profileError) throw profileError;

    return { success: true };
  } catch (error: any) {
    console.error("Error suspending user:", error);
    return { success: false, error: error.message };
  }
};

export const getModeratorStats = async (moderatorId?: string): Promise<{ success: boolean; data: any }> => {
  try {
    // Get disputes resolved by this moderator
    let query = supabase
      .from("disputes")
      .select("*");
    
    if (moderatorId) {
      query = query.eq("resolved_by", moderatorId);
    }
    
    const { data: resolvedDisputes, error: disputeError } = await query
      .eq("status", "resolved");

    if (disputeError) throw disputeError;

    // Get active disputes
    const { data: activeDisputes, error: activeError } = await supabase
      .from("disputes")
      .select("*")
      .eq("status", "pending");

    if (activeError) throw activeError;

    // Get flagged accounts (users with multiple disputes)
    const { data: allDisputes, error: allDisputesError } = await supabase
      .from("disputes")
      .select("reported_by");

    if (allDisputesError) throw allDisputesError;

    const reportCounts: { [key: string]: number } = {};
    allDisputes?.forEach(dispute => {
      reportCounts[dispute.reported_by] = (reportCounts[dispute.reported_by] || 0) + 1;
    });

    const flaggedAccounts = Object.values(reportCounts).filter(count => count >= 3).length;

    const totalResolved = resolvedDisputes?.length || 0;
    const activeDisputesCount = activeDisputes?.length || 0;
    
    // Calculate average resolution time from resolved disputes
    let avgResolutionTime = "0";
    if (resolvedDisputes && resolvedDisputes.length > 0) {
      const totalTime = resolvedDisputes.reduce((sum, dispute) => {
        const created = new Date(dispute.created_at);
        const updated = new Date(dispute.updated_at);
        return sum + (updated.getTime() - created.getTime());
      }, 0);
      
      const avgTimeMs = totalTime / resolvedDisputes.length;
      const avgTimeHours = avgTimeMs / (1000 * 60 * 60);
      avgResolutionTime = avgTimeHours.toFixed(1);
    }

    const data = {
      activeDisputes: activeDisputesCount,
      resolvedToday: totalResolved,
      avgResolutionTime: `${avgResolutionTime}h`,
      flaggedAccounts
    };

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching moderator stats:", error);
    return {
      success: false,
      data: {
        activeDisputes: 0,
        resolvedToday: 0,
        avgResolutionTime: "0h",
        flaggedAccounts: 0
      }
    };
  }
};

export const fetchRecentActivity = async (): Promise<any[]> => {
  try {
    // Fetch recent disputes and matches for activity feed
    const [disputesResult, matchesResult] = await Promise.all([
      supabase
        .from("disputes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("matches")
        .select("*")
        .in("status", ["completed", "active"])
        .order("created_at", { ascending: false })
        .limit(5)
    ]);

    const activities = [];

    // Add disputes to activity feed
    if (disputesResult.data) {
      disputesResult.data.forEach(dispute => {
        activities.push({
          id: dispute.id,
          type: 'dispute',
          description: `New dispute: ${dispute.reason}`,
          timestamp: dispute.created_at,
          status: dispute.status
        });
      });
    }

    // Add matches to activity feed
    if (matchesResult.data) {
      matchesResult.data.forEach(match => {
        activities.push({
          id: match.id,
          type: 'match',
          description: `Match ${match.status}: ${match.title}`,
          timestamp: match.created_at,
          status: match.status
        });
      });
    }

    // Sort by timestamp and return most recent
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return activities.slice(0, 10);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return [];
  }
};
