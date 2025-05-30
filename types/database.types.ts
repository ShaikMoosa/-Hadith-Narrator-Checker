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
      bookmark: {
        Row: {
          created_at: string | null
          id: number
          narrator_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          narrator_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          narrator_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmark_narrator_id_fkey"
            columns: ["narrator_id"]
            isOneToOne: false
            referencedRelation: "narrator"
            referencedColumns: ["id"]
          },
        ]
      }
      narrator: {
        Row: {
          biography: string | null
          birth_year: number | null
          created_at: string | null
          credibility: string
          death_year: number | null
          id: number
          name_arabic: string
          name_transliteration: string | null
          region: string | null
          search_vector: unknown | null
          updated_at: string | null
        }
        Insert: {
          biography?: string | null
          birth_year?: number | null
          created_at?: string | null
          credibility: string
          death_year?: number | null
          id?: number
          name_arabic: string
          name_transliteration?: string | null
          region?: string | null
          search_vector?: unknown | null
          updated_at?: string | null
        }
        Update: {
          biography?: string | null
          birth_year?: number | null
          created_at?: string | null
          credibility?: string
          death_year?: number | null
          id?: number
          name_arabic?: string
          name_transliteration?: string | null
          region?: string | null
          search_vector?: unknown | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string
          id: number
          title: string
          user_id: string
        }
        Insert: {
          content: string
          id?: number
          title: string
          user_id?: string
        }
        Update: {
          content?: string
          id?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      opinion: {
        Row: {
          created_at: string | null
          id: number
          narrator_id: number
          reason: string | null
          scholar: string
          source_ref: string | null
          updated_at: string | null
          verdict: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          narrator_id: number
          reason?: string | null
          scholar: string
          source_ref?: string | null
          updated_at?: string | null
          verdict: string
        }
        Update: {
          created_at?: string | null
          id?: number
          narrator_id?: number
          reason?: string | null
          scholar?: string
          source_ref?: string | null
          updated_at?: string | null
          verdict?: string
        }
        Relationships: [
          {
            foreignKeyName: "opinion_narrator_id_fkey"
            columns: ["narrator_id"]
            isOneToOne: false
            referencedRelation: "narrator"
            referencedColumns: ["id"]
          },
        ]
      }
      search: {
        Row: {
          id: number
          query: string
          result_found: boolean
          searched_at: string | null
          user_id: string
        }
        Insert: {
          id?: number
          query: string
          result_found?: boolean
          searched_at?: string | null
          user_id: string
        }
        Update: {
          id?: number
          query?: string
          result_found?: boolean
          searched_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      stripe_customers: {
        Row: {
          id: string
          plan_active: boolean
          plan_expires: number | null
          stripe_customer_id: string
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          id?: string
          plan_active?: boolean
          plan_expires?: number | null
          stripe_customer_id: string
          subscription_id?: string | null
          user_id?: string
        }
        Update: {
          id?: string
          plan_active?: boolean
          plan_expires?: number | null
          stripe_customer_id?: string
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          email: string | null
          id: string
          image: string | null
          name: string | null
        }
        Insert: {
          email?: string | null
          id: string
          image?: string | null
          name?: string | null
        }
        Update: {
          email?: string | null
          id?: string
          image?: string | null
          name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      narrator_search_suggestions: {
        Row: {
          credibility: string | null
          suggestion: string | null
          type: string | null
          usage_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_search_suggestions: {
        Args: { partial_term: string; suggestion_limit?: number }
        Returns: {
          suggestion: string
          type: string
          credibility: string
        }[]
      }
      search_narrators_advanced: {
        Args: {
          search_term?: string
          credibility_filter?: string
          region_filter?: string
          min_birth_year?: number
          max_birth_year?: number
          limit_count?: number
        }
        Returns: {
          id: number
          name_arabic: string
          name_transliteration: string
          credibility: string
          biography: string
          birth_year: number
          death_year: number
          region: string
          created_at: string
          updated_at: string
          search_rank: number
        }[]
      }
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
