export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      announcements: {
        Row: {
          content: string
          created_at: string | null
          created_by: string
          id: string
          is_published: boolean | null
          priority: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by: string
          id?: string
          is_published?: boolean | null
          priority?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string
          id?: string
          is_published?: boolean | null
          priority?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_details: {
        Row: {
          account_name: string
          account_number: string
          bank_name: string
          created_at: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          account_name?: string
          account_number?: string
          bank_name?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string
          bank_name?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      disputes: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          description: string | null
          evidence_url: string | null
          id: string
          match_id: string
          reason: string
          reported_by: string
          resolution: string | null
          resolved_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          evidence_url?: string | null
          id?: string
          match_id: string
          reason: string
          reported_by: string
          resolution?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          evidence_url?: string | null
          id?: string
          match_id?: string
          reason?: string
          reported_by?: string
          resolution?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disputes_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "forum_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_groups: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_messages: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          message: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          message: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          message?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "forum_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_evidence: {
        Row: {
          created_at: string | null
          description: string | null
          evidence_type: string
          evidence_url: string
          id: string
          match_id: string
          submitted_by: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          evidence_type: string
          evidence_url: string
          id?: string
          match_id: string
          submitted_by: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          evidence_type?: string
          evidence_url?: string
          id?: string
          match_id?: string
          submitted_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_evidence_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_evidence_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_participants: {
        Row: {
          id: string
          joined_at: string | null
          match_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          match_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          match_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_participants_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_result_submissions: {
        Row: {
          created_at: string | null
          id: string
          match_id: string
          notes: string | null
          proof_urls: string[] | null
          result_type: string
          submitted_by: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_id: string
          notes?: string | null
          proof_urls?: string[] | null
          result_type: string
          submitted_by: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          match_id?: string
          notes?: string | null
          proof_urls?: string[] | null
          result_type?: string
          submitted_by?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_result_submissions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_results: {
        Row: {
          deaths: number | null
          evidence_url: string | null
          id: string
          kills: number | null
          match_id: string
          participant_id: string
          placement: number | null
          score: number | null
          submitted_at: string | null
        }
        Insert: {
          deaths?: number | null
          evidence_url?: string | null
          id?: string
          kills?: number | null
          match_id: string
          participant_id: string
          placement?: number | null
          score?: number | null
          submitted_at?: string | null
        }
        Update: {
          deaths?: number | null
          evidence_url?: string | null
          id?: string
          kills?: number | null
          match_id?: string
          participant_id?: string
          placement?: number | null
          score?: number | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_results_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_results_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "match_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          bet_amount: number | null
          created_at: string | null
          created_by: string
          current_players: number | null
          description: string | null
          end_time: string | null
          entry_fee: number
          game_mode: string
          host_id: string | null
          host_notes: string | null
          id: string
          is_featured: boolean | null
          is_vip_match: boolean | null
          lobby_code: string | null
          map_name: string | null
          match_started: boolean | null
          match_started_at: string | null
          max_players: number
          opponent_id: string | null
          platform_fee: number | null
          prize_pool: number
          scheduled_time: string | null
          start_time: string | null
          status: string | null
          team_players: number | null
          team_size: string | null
          title: string
          updated_at: string | null
          winner_id: string | null
        }
        Insert: {
          bet_amount?: number | null
          created_at?: string | null
          created_by: string
          current_players?: number | null
          description?: string | null
          end_time?: string | null
          entry_fee?: number
          game_mode: string
          host_id?: string | null
          host_notes?: string | null
          id?: string
          is_featured?: boolean | null
          is_vip_match?: boolean | null
          lobby_code?: string | null
          map_name?: string | null
          match_started?: boolean | null
          match_started_at?: string | null
          max_players?: number
          opponent_id?: string | null
          platform_fee?: number | null
          prize_pool?: number
          scheduled_time?: string | null
          start_time?: string | null
          status?: string | null
          team_players?: number | null
          team_size?: string | null
          title: string
          updated_at?: string | null
          winner_id?: string | null
        }
        Update: {
          bet_amount?: number | null
          created_at?: string | null
          created_by?: string
          current_players?: number | null
          description?: string | null
          end_time?: string | null
          entry_fee?: number
          game_mode?: string
          host_id?: string | null
          host_notes?: string | null
          id?: string
          is_featured?: boolean | null
          is_vip_match?: boolean | null
          lobby_code?: string | null
          map_name?: string | null
          match_started?: boolean | null
          match_started_at?: string | null
          max_players?: number
          opponent_id?: string | null
          platform_fee?: number | null
          prize_pool?: number
          scheduled_time?: string | null
          start_time?: string | null
          status?: string | null
          team_players?: number | null
          team_size?: string | null
          title?: string
          updated_at?: string | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_earnings: {
        Row: {
          amount: number
          created_at: string
          id: string
          match_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          match_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          match_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_earnings_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      player_ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          match_id: string
          rated_id: string
          rater_id: string
          rating: number
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          match_id: string
          rated_id: string
          rater_id: string
          rating: number
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          match_id?: string
          rated_id?: string
          rater_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_ratings_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_ratings_rated_id_fkey"
            columns: ["rated_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_ratings_rater_id_fkey"
            columns: ["rater_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          favorite_game: string | null
          gaming_experience: string | null
          id: string
          is_moderator: boolean | null
          is_vip: boolean | null
          losses: number | null
          phone: string | null
          preferred_game_modes: string[] | null
          rating: number | null
          skill_level: string | null
          total_earnings: number | null
          total_matches: number | null
          updated_at: string | null
          username: string
          wins: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          favorite_game?: string | null
          gaming_experience?: string | null
          id: string
          is_moderator?: boolean | null
          is_vip?: boolean | null
          losses?: number | null
          phone?: string | null
          preferred_game_modes?: string[] | null
          rating?: number | null
          skill_level?: string | null
          total_earnings?: number | null
          total_matches?: number | null
          updated_at?: string | null
          username: string
          wins?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          favorite_game?: string | null
          gaming_experience?: string | null
          id?: string
          is_moderator?: boolean | null
          is_vip?: boolean | null
          losses?: number | null
          phone?: string | null
          preferred_game_modes?: string[] | null
          rating?: number | null
          skill_level?: string | null
          total_earnings?: number | null
          total_matches?: number | null
          updated_at?: string | null
          username?: string
          wins?: number | null
        }
        Relationships: []
      }
      tournament_participants: {
        Row: {
          id: string
          registered_at: string | null
          status: string | null
          tournament_id: string
          user_id: string
        }
        Insert: {
          id?: string
          registered_at?: string | null
          status?: string | null
          tournament_id: string
          user_id: string
        }
        Update: {
          id?: string
          registered_at?: string | null
          status?: string | null
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string | null
          created_by: string
          current_participants: number | null
          description: string | null
          end_date: string | null
          entry_fee: number | null
          game_mode: string
          id: string
          max_participants: number
          name: string
          prize_pool: number | null
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          current_participants?: number | null
          description?: string | null
          end_date?: string | null
          entry_fee?: number | null
          game_mode: string
          id?: string
          max_participants: number
          name: string
          prize_pool?: number | null
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          current_participants?: number | null
          description?: string | null
          end_date?: string | null
          entry_fee?: number | null
          game_mode?: string
          id?: string
          max_participants?: number
          name?: string
          prize_pool?: number | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          match_id: string | null
          status: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          match_id?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          match_id?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
