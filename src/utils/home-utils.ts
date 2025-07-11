
import { supabase } from "@/integrations/supabase/client";

export interface MatchData {
  id: string;
  title: string;
  game_mode: string;
  map_name?: string;
  bet_amount: number;
  status: string;
  created_at: string;
  current_players: number;
  max_players: number;
  is_vip_match: boolean;
  host?: {
    username: string;
    avatar_url?: string;
  };
  opponent?: {
    username: string;
    avatar_url?: string;
  };
  host_id?: string;
  opponent_id?: string;
}

export const fetchFeaturedMatches = async (): Promise<MatchData[]> => {
  try {
    const { data: matches, error } = await supabase
      .from("matches")
      .select(`
        id,
        title,
        game_mode,
        map_name,
        bet_amount,
        status,
        created_at,
        current_players,
        max_players,
        is_vip_match,
        host_id,
        opponent_id
      `)
      .eq("is_featured", true)
      .in("status", ["open", "active"])
      .order("created_at", { ascending: false })
      .limit(6);

    if (error) throw error;

    if (!matches || matches.length === 0) {
      return [];
    }

    // Get host and opponent profiles separately
    const hostIds = matches.filter(m => m.host_id).map(m => m.host_id);
    const opponentIds = matches.filter(m => m.opponent_id).map(m => m.opponent_id);
    const allUserIds = [...new Set([...hostIds, ...opponentIds])];

    let profilesData = [];
    if (allUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", allUserIds);
      
      profilesData = profiles || [];
    }

    // Transform the data
    const transformedMatches: MatchData[] = matches.map(match => {
      const host = match.host_id ? profilesData.find(p => p.id === match.host_id) : null;
      const opponent = match.opponent_id ? profilesData.find(p => p.id === match.opponent_id) : null;

      return {
        ...match,
        host: host ? { username: host.username, avatar_url: host.avatar_url } : undefined,
        opponent: opponent ? { username: opponent.username, avatar_url: opponent.avatar_url } : undefined,
      };
    });

    return transformedMatches;
  } catch (error) {
    console.error("Error fetching featured matches:", error);
    return [];
  }
};

export const fetchLiveMatches = async (): Promise<MatchData[]> => {
  try {
    const { data: matches, error } = await supabase
      .from("matches")
      .select(`
        id,
        title,
        game_mode,
        map_name,
        bet_amount,
        status,
        created_at,
        current_players,
        max_players,
        is_vip_match,
        host_id,
        opponent_id
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    if (!matches || matches.length === 0) {
      return [];
    }

    // Get host and opponent profiles separately
    const hostIds = matches.filter(m => m.host_id).map(m => m.host_id);
    const opponentIds = matches.filter(m => m.opponent_id).map(m => m.opponent_id);
    const allUserIds = [...new Set([...hostIds, ...opponentIds])];

    let profilesData = [];
    if (allUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", allUserIds);
      
      profilesData = profiles || [];
    }

    // Transform the data
    const transformedMatches: MatchData[] = matches.map(match => {
      const host = match.host_id ? profilesData.find(p => p.id === match.host_id) : null;
      const opponent = match.opponent_id ? profilesData.find(p => p.id === match.opponent_id) : null;

      return {
        ...match,
        host: host ? { username: host.username, avatar_url: host.avatar_url } : undefined,
        opponent: opponent ? { username: opponent.username, avatar_url: opponent.avatar_url } : undefined,
      };
    });

    return transformedMatches;
  } catch (error) {
    console.error("Error fetching live matches:", error);
    return [];
  }
};

export const fetchHighStakeMatches = async (): Promise<MatchData[]> => {
  try {
    const { data: matches, error } = await supabase
      .from("matches")
      .select(`
        id,
        title,
        game_mode,
        map_name,
        bet_amount,
        status,
        created_at,
        current_players,
        max_players,
        is_vip_match,
        host_id,
        opponent_id
      `)
      .eq("is_vip_match", true)
      .gte("bet_amount", 10000)
      .order("bet_amount", { ascending: false })
      .limit(10);

    if (error) throw error;

    if (!matches || matches.length === 0) {
      return [];
    }

    // Get host and opponent profiles separately
    const hostIds = matches.filter(m => m.host_id).map(m => m.host_id);
    const opponentIds = matches.filter(m => m.opponent_id).map(m => m.opponent_id);
    const allUserIds = [...new Set([...hostIds, ...opponentIds])];

    let profilesData = [];
    if (allUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", allUserIds);
      
      profilesData = profiles || [];
    }

    // Transform the data
    const transformedMatches: MatchData[] = matches.map(match => {
      const host = match.host_id ? profilesData.find(p => p.id === match.host_id) : null;
      const opponent = match.opponent_id ? profilesData.find(p => p.id === match.opponent_id) : null;

      return {
        ...match,
        host: host ? { username: host.username, avatar_url: host.avatar_url } : undefined,
        opponent: opponent ? { username: opponent.username, avatar_url: opponent.avatar_url } : undefined,
      };
    });

    return transformedMatches;
  } catch (error) {
    console.error("Error fetching high stake matches:", error);
    return [];
  }
};

export const fetchLeaderboard = async () => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, rating, total_matches, wins, losses, total_earnings")
      .order("rating", { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
};

// Export aliases for backward compatibility
export const getFeaturedMatches = async () => {
  const data = await fetchFeaturedMatches();
  return { success: true, data };
};

export const getLiveMatches = async () => {
  const data = await fetchLiveMatches();
  return { success: true, data };
};

export const getLeaderboardData = async () => {
  const data = await fetchLeaderboard();
  return { success: true, data };
};

export const getGameModes = async () => {
  // Mock game modes data for now
  const gameModes = [
    { id: "battle-royale", name: "Battle Royale", description: "Last player standing wins" },
    { id: "team-deathmatch", name: "Team Deathmatch", description: "Team vs team combat" },
    { id: "domination", name: "Domination", description: "Control key areas" },
    { id: "search-destroy", name: "Search & Destroy", description: "Plant or defuse the bomb" }
  ];
  
  return { success: true, data: gameModes };
};
