
import { supabase } from "@/integrations/supabase/client";

export interface MatchHistoryItem {
  id: string;
  title: string;
  game_mode: string;
  status: string;
  created_at: string;
  bet_amount: number;
  winner_id: string | null;
  host_id: string;
  opponent_id: string | null;
}

export interface UserStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  totalEarnings: number;
  averageBet: number;
}

export const fetchUserMatchHistory = async (userId: string, limit = 20): Promise<MatchHistoryItem[]> => {
  try {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .or(`host_id.eq.${userId},opponent_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching match history:", error);
    return [];
  }
};

export const calculateUserStats = async (userId: string): Promise<UserStats> => {
  try {
    // Fetch all user matches
    const { data: matches, error: matchError } = await supabase
      .from("matches")
      .select("*")
      .or(`host_id.eq.${userId},opponent_id.eq.${userId}`)
      .eq("status", "completed");

    if (matchError) throw matchError;

    const totalMatches = matches?.length || 0;
    const wins = matches?.filter(match => match.winner_id === userId).length || 0;
    const losses = totalMatches - wins;
    const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

    // Calculate total earnings from transactions
    const { data: transactions, error: transactionError } = await supabase
      .from("transactions")
      .select("amount, type")
      .eq("user_id", userId)
      .eq("status", "completed");

    if (transactionError) throw transactionError;

    let totalEarnings = 0;
    let totalBets = 0;
    let betCount = 0;

    transactions?.forEach(tx => {
      if (tx.type === 'win') {
        totalEarnings += tx.amount;
      } else if (tx.type === 'bet') {
        totalBets += tx.amount;
        betCount++;
      }
    });

    const averageBet = betCount > 0 ? totalBets / betCount : 0;

    return {
      totalMatches,
      wins,
      losses,
      winRate,
      totalEarnings,
      averageBet
    };
  } catch (error) {
    console.error("Error calculating user stats:", error);
    return {
      totalMatches: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      totalEarnings: 0,
      averageBet: 0
    };
  }
};

export const getMatchResult = (match: MatchHistoryItem, userId: string): 'win' | 'loss' | 'pending' => {
  if (match.status !== 'completed') return 'pending';
  if (match.winner_id === userId) return 'win';
  return 'loss';
};

export const formatMatchDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
