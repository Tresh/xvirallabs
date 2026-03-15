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
      brand_pillars: {
        Row: {
          audience_need: string | null
          calendar_id: string
          created_at: string
          example_formats: string[] | null
          id: string
          pillar_name: string
          pillar_order: number
          psychology_trigger: string | null
          purpose: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          audience_need?: string | null
          calendar_id: string
          created_at?: string
          example_formats?: string[] | null
          id?: string
          pillar_name: string
          pillar_order?: number
          psychology_trigger?: string | null
          purpose?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          audience_need?: string | null
          calendar_id?: string
          created_at?: string
          example_formats?: string[] | null
          id?: string
          pillar_name?: string
          pillar_order?: number
          psychology_trigger?: string | null
          purpose?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_pillars_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "content_calendars"
            referencedColumns: ["id"]
          },
        ]
      }
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
      content_calendar_days: {
        Row: {
          calendar_id: string
          content_goal: string
          content_type: string
          created_at: string
          date: string | null
          day_number: number
          draft_action_driven: string | null
          draft_content: string | null
          draft_why_it_works: string | null
          id: string
          is_posted: boolean | null
          post_brief: string
          post_category: string | null
          post_number: number | null
          posted_at: string | null
          psychological_trigger: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          calendar_id: string
          content_goal: string
          content_type: string
          created_at?: string
          date?: string | null
          day_number: number
          draft_action_driven?: string | null
          draft_content?: string | null
          draft_why_it_works?: string | null
          id?: string
          is_posted?: boolean | null
          post_brief: string
          post_category?: string | null
          post_number?: number | null
          posted_at?: string | null
          psychological_trigger?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          calendar_id?: string
          content_goal?: string
          content_type?: string
          created_at?: string
          date?: string | null
          day_number?: number
          draft_action_driven?: string | null
          draft_content?: string | null
          draft_why_it_works?: string | null
          id?: string
          is_posted?: boolean | null
          post_brief?: string
          post_category?: string | null
          post_number?: number | null
          posted_at?: string | null
          psychological_trigger?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_calendar_days_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "content_calendars"
            referencedColumns: ["id"]
          },
        ]
      }
      content_calendars: {
        Row: {
          audience_level: string | null
          audience_size: string | null
          calendar_length: number
          created_at: string
          id: string
          main_goal: string
          mind_map_generated: boolean | null
          monetization_type: string | null
          name: string
          pillars_generated: boolean | null
          posting_capacity: string
          primary_niche: string
          status: string
          sub_niches: string[] | null
          unhinged_mode: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          audience_level?: string | null
          audience_size?: string | null
          calendar_length?: number
          created_at?: string
          id?: string
          main_goal: string
          mind_map_generated?: boolean | null
          monetization_type?: string | null
          name?: string
          pillars_generated?: boolean | null
          posting_capacity?: string
          primary_niche: string
          status?: string
          sub_niches?: string[] | null
          unhinged_mode?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          audience_level?: string | null
          audience_size?: string | null
          calendar_length?: number
          created_at?: string
          id?: string
          main_goal?: string
          mind_map_generated?: boolean | null
          monetization_type?: string | null
          name?: string
          pillars_generated?: boolean | null
          posting_capacity?: string
          primary_niche?: string
          status?: string
          sub_niches?: string[] | null
          unhinged_mode?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_coaching: {
        Row: {
          best_posting_time: string | null
          calendar_day_id: string
          created_at: string
          follow_up_suggestions: string[] | null
          id: string
          intent_explanation: string | null
          reply_strategy: string | null
          user_id: string
        }
        Insert: {
          best_posting_time?: string | null
          calendar_day_id: string
          created_at?: string
          follow_up_suggestions?: string[] | null
          id?: string
          intent_explanation?: string | null
          reply_strategy?: string | null
          user_id: string
        }
        Update: {
          best_posting_time?: string | null
          calendar_day_id?: string
          created_at?: string
          follow_up_suggestions?: string[] | null
          id?: string
          intent_explanation?: string | null
          reply_strategy?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_coaching_calendar_day_id_fkey"
            columns: ["calendar_day_id"]
            isOneToOne: false
            referencedRelation: "content_calendar_days"
            referencedColumns: ["id"]
          },
        ]
      }
      content_flags: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          flagged_by: string | null
          id: string
          notes: string | null
          reason: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          flagged_by?: string | null
          id?: string
          notes?: string | null
          reason: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          flagged_by?: string | null
          id?: string
          notes?: string | null
          reason?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      content_ideas: {
        Row: {
          calendar_id: string
          created_at: string
          day_number: number
          generated_content: string | null
          id: string
          idea_order: number
          idea_title: string
          idea_type: string
          intent: string | null
          is_saved_to_vault: boolean | null
          pillar_id: string | null
          psychology_hint: string | null
          status: string | null
          updated_at: string
          user_id: string
          why_it_works: string | null
        }
        Insert: {
          calendar_id: string
          created_at?: string
          day_number: number
          generated_content?: string | null
          id?: string
          idea_order?: number
          idea_title: string
          idea_type?: string
          intent?: string | null
          is_saved_to_vault?: boolean | null
          pillar_id?: string | null
          psychology_hint?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          why_it_works?: string | null
        }
        Update: {
          calendar_id?: string
          created_at?: string
          day_number?: number
          generated_content?: string | null
          id?: string
          idea_order?: number
          idea_title?: string
          idea_type?: string
          intent?: string | null
          is_saved_to_vault?: boolean | null
          pillar_id?: string | null
          psychology_hint?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          why_it_works?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_ideas_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "content_calendars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_ideas_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "brand_pillars"
            referencedColumns: ["id"]
          },
        ]
      }
      content_inspirations: {
        Row: {
          analysis_result: Json | null
          calendar_id: string
          content_formats: string[] | null
          created_at: string
          hook_styles: string[] | null
          id: string
          monetization_signals: string[] | null
          psychological_angles: string[] | null
          twitter_handle: string
          user_id: string
        }
        Insert: {
          analysis_result?: Json | null
          calendar_id: string
          content_formats?: string[] | null
          created_at?: string
          hook_styles?: string[] | null
          id?: string
          monetization_signals?: string[] | null
          psychological_angles?: string[] | null
          twitter_handle: string
          user_id: string
        }
        Update: {
          analysis_result?: Json | null
          calendar_id?: string
          content_formats?: string[] | null
          created_at?: string
          hook_styles?: string[] | null
          id?: string
          monetization_signals?: string[] | null
          psychological_angles?: string[] | null
          twitter_handle?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_inspirations_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "content_calendars"
            referencedColumns: ["id"]
          },
        ]
      }
      content_os_items: {
        Row: {
          content: string
          created_at: string
          format: string
          generated_date: string
          id: string
          pillar_id: string | null
          pillar_name: string | null
          posted_at: string | null
          psychology_trigger: string | null
          status: string
          thread_tweets: Json | null
          title: string | null
          updated_at: string
          user_id: string
          video_prompt: string | null
          viral_score: number | null
          word_count: number | null
        }
        Insert: {
          content: string
          created_at?: string
          format: string
          generated_date?: string
          id?: string
          pillar_id?: string | null
          pillar_name?: string | null
          posted_at?: string | null
          psychology_trigger?: string | null
          status?: string
          thread_tweets?: Json | null
          title?: string | null
          updated_at?: string
          user_id: string
          video_prompt?: string | null
          viral_score?: number | null
          word_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          format?: string
          generated_date?: string
          id?: string
          pillar_id?: string | null
          pillar_name?: string | null
          posted_at?: string | null
          psychology_trigger?: string | null
          status?: string
          thread_tweets?: Json | null
          title?: string | null
          updated_at?: string
          user_id?: string
          video_prompt?: string | null
          viral_score?: number | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_os_items_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "content_pillars"
            referencedColumns: ["id"]
          },
        ]
      }
      content_pillars: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_active: boolean
          pillar_description: string | null
          pillar_name: string
          pillar_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          pillar_description?: string | null
          pillar_name: string
          pillar_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          pillar_description?: string | null
          pillar_name?: string
          pillar_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_posts: {
        Row: {
          content: string
          created_at: string
          format: string
          generated_date: string
          id: string
          posted_at: string | null
          psychology_trigger: string | null
          status: string
          updated_at: string
          user_id: string
          viral_score: number | null
          why_it_works: string | null
        }
        Insert: {
          content: string
          created_at?: string
          format?: string
          generated_date?: string
          id?: string
          posted_at?: string | null
          psychology_trigger?: string | null
          status?: string
          updated_at?: string
          user_id: string
          viral_score?: number | null
          why_it_works?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          format?: string
          generated_date?: string
          id?: string
          posted_at?: string | null
          psychology_trigger?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          viral_score?: number | null
          why_it_works?: string | null
        }
        Relationships: []
      }
      daily_usage: {
        Row: {
          analysis_count: number
          created_at: string
          date: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_count?: number
          created_at?: string
          date?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_count?: number
          created_at?: string
          date?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      growth_snapshots: {
        Row: {
          created_at: string
          follower_count: number | null
          following_count: number | null
          id: string
          notes: string | null
          posts_published: number | null
          snapshot_date: string
          total_impressions: number | null
          total_likes: number | null
          total_replies: number | null
          user_id: string
          weekly_gain: number | null
        }
        Insert: {
          created_at?: string
          follower_count?: number | null
          following_count?: number | null
          id?: string
          notes?: string | null
          posts_published?: number | null
          snapshot_date?: string
          total_impressions?: number | null
          total_likes?: number | null
          total_replies?: number | null
          user_id: string
          weekly_gain?: number | null
        }
        Update: {
          created_at?: string
          follower_count?: number | null
          following_count?: number | null
          id?: string
          notes?: string | null
          posts_published?: number | null
          snapshot_date?: string
          total_impressions?: number | null
          total_likes?: number | null
          total_replies?: number | null
          user_id?: string
          weekly_gain?: number | null
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
      post_performance: {
        Row: {
          ai_analysis: string | null
          ai_suggestions: string[] | null
          audience_reached: number | null
          bookmarks: number | null
          calendar_day_id: string | null
          created_at: string
          engagement_rate: number | null
          follows_gained: number | null
          id: string
          impressions: number | null
          likes: number | null
          link_clicks: number | null
          performance_score: number | null
          posted_time: string | null
          profile_visits: number | null
          replies: number | null
          retweets: number | null
          screenshot_url: string | null
          tweet_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_analysis?: string | null
          ai_suggestions?: string[] | null
          audience_reached?: number | null
          bookmarks?: number | null
          calendar_day_id?: string | null
          created_at?: string
          engagement_rate?: number | null
          follows_gained?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          link_clicks?: number | null
          performance_score?: number | null
          posted_time?: string | null
          profile_visits?: number | null
          replies?: number | null
          retweets?: number | null
          screenshot_url?: string | null
          tweet_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_analysis?: string | null
          ai_suggestions?: string[] | null
          audience_reached?: number | null
          bookmarks?: number | null
          calendar_day_id?: string | null
          created_at?: string
          engagement_rate?: number | null
          follows_gained?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          link_clicks?: number | null
          performance_score?: number | null
          posted_time?: string | null
          profile_visits?: number | null
          replies?: number | null
          retweets?: number | null
          screenshot_url?: string | null
          tweet_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_performance_calendar_day_id_fkey"
            columns: ["calendar_day_id"]
            isOneToOne: false
            referencedRelation: "content_calendar_days"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          brand_tone: string | null
          content_strategy: string | null
          created_at: string | null
          custom_system_prompt: string | null
          display_name: string | null
          email: string | null
          growth_goal: string | null
          id: string
          primary_niche: string | null
          secondary_niches: string[] | null
          skills: string[] | null
          tier: string | null
          twitter_handle: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brand_tone?: string | null
          content_strategy?: string | null
          created_at?: string | null
          custom_system_prompt?: string | null
          display_name?: string | null
          email?: string | null
          growth_goal?: string | null
          id?: string
          primary_niche?: string | null
          secondary_niches?: string[] | null
          skills?: string[] | null
          tier?: string | null
          twitter_handle?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brand_tone?: string | null
          content_strategy?: string | null
          created_at?: string | null
          custom_system_prompt?: string | null
          display_name?: string | null
          email?: string | null
          growth_goal?: string | null
          id?: string
          primary_niche?: string | null
          secondary_niches?: string[] | null
          skills?: string[] | null
          tier?: string | null
          twitter_handle?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      admin_platform_stats: {
        Row: {
          analyses_last_30_days: number | null
          analyses_last_7_days: number | null
          elite_users: number | null
          pro_users: number | null
          total_analyses: number | null
          total_ideas: number | null
          total_patterns: number | null
          total_users: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_and_increment_usage: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_remaining_usage: { Args: { p_user_id: string }; Returns: number }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
