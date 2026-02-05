export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      brand_voice: {
        Row: {
          avoid_hooks: string[] | null
          created_at: string | null
          id: string
          preferred_hooks: string[] | null
          signature_phrases: string[] | null
          updated_at: string | null
          user_id: string
          words_to_avoid: string[] | null
          writing_traits: string[] | null
        }
        Insert: {
          avoid_hooks?: string[] | null
          created_at?: string | null
          id?: string
          preferred_hooks?: string[] | null
          signature_phrases?: string[] | null
          updated_at?: string | null
          user_id: string
          words_to_avoid?: string[] | null
          writing_traits?: string[] | null
        }
        Update: {
          avoid_hooks?: string[] | null
          created_at?: string | null
          id?: string
          preferred_hooks?: string[] | null
          signature_phrases?: string[] | null
          updated_at?: string | null
          user_id?: string
          words_to_avoid?: string[] | null
          writing_traits?: string[] | null
        }
        Relationships: []
      }
      idea_vault: {
        Row: {
          created_at: string | null
          emotion_trigger: string | null
          generated_from_analysis_id: string | null
          generated_from_pattern_id: string | null
          hook_type: string | null
          id: string
          idea_content: string | null
          idea_status: string | null
          idea_title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emotion_trigger?: string | null
          generated_from_analysis_id?: string | null
          generated_from_pattern_id?: string | null
          hook_type?: string | null
          id?: string
          idea_content?: string | null
          idea_status?: string | null
          idea_title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          emotion_trigger?: string | null
          generated_from_analysis_id?: string | null
          generated_from_pattern_id?: string | null
          hook_type?: string | null
          id?: string
          idea_content?: string | null
          idea_status?: string | null
          idea_title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_vault_generated_from_analysis_id_fkey"
            columns: ["generated_from_analysis_id"]
            isOneToOne: false
            referencedRelation: "viral_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_vault_generated_from_pattern_id_fkey"
            columns: ["generated_from_pattern_id"]
            isOneToOne: false
            referencedRelation: "viral_patterns"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          brand_tone: string | null
          created_at: string | null
          email: string | null
          growth_goal: string | null
          id: string
          primary_niche: string | null
          secondary_niches: string[] | null
          tier: string | null
          twitter_handle: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brand_tone?: string | null
          created_at?: string | null
          email?: string | null
          growth_goal?: string | null
          id?: string
          primary_niche?: string | null
          secondary_niches?: string[] | null
          tier?: string | null
          twitter_handle?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brand_tone?: string | null
          created_at?: string | null
          email?: string | null
          growth_goal?: string | null
          id?: string
          primary_niche?: string | null
          secondary_niches?: string[] | null
          tier?: string | null
          twitter_handle?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      viral_analyses: {
        Row: {
          analysis_result: string
          bookmark_potential: number | null
          created_at: string | null
          dwell_time_score: string | null
          id: string
          identified_hook: string | null
          is_pinned: boolean | null
          mode_used: number
          original_post: string
          post_source: string
          psychology_triggers: string[] | null
          reply_potential: number | null
          user_id: string
          viral_pattern: string | null
        }
        Insert: {
          analysis_result: string
          bookmark_potential?: number | null
          created_at?: string | null
          dwell_time_score?: string | null
          id?: string
          identified_hook?: string | null
          is_pinned?: boolean | null
          mode_used: number
          original_post: string
          post_source: string
          psychology_triggers?: string[] | null
          reply_potential?: number | null
          user_id: string
          viral_pattern?: string | null
        }
        Update: {
          analysis_result?: string
          bookmark_potential?: number | null
          created_at?: string | null
          dwell_time_score?: string | null
          id?: string
          identified_hook?: string | null
          is_pinned?: boolean | null
          mode_used?: number
          original_post?: string
          post_source?: string
          psychology_triggers?: string[] | null
          reply_potential?: number | null
          user_id?: string
          viral_pattern?: string | null
        }
        Relationships: []
      }
      viral_patterns: {
        Row: {
          best_for_niches: string[] | null
          created_at: string | null
          hook_framework: string | null
          id: string
          pattern_name: string
          pattern_template: string
          source_analysis_id: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          best_for_niches?: string[] | null
          created_at?: string | null
          hook_framework?: string | null
          id?: string
          pattern_name: string
          pattern_template: string
          source_analysis_id?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          best_for_niches?: string[] | null
          created_at?: string | null
          hook_framework?: string | null
          id?: string
          pattern_name?: string
          pattern_template?: string
          source_analysis_id?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "viral_patterns_source_analysis_id_fkey"
            columns: ["source_analysis_id"]
            isOneToOne: false
            referencedRelation: "viral_analyses"
            referencedColumns: ["id"]
          },
        ]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
