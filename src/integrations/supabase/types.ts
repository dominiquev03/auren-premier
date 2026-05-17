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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          alt_contact: string | null
          avatar_url: string | null
          billing_address: string | null
          comm_method: string | null
          company_name: string | null
          created_at: string
          default_delivery_address: string | null
          email: string | null
          full_name: string | null
          id: string
          last_login: string | null
          loyalty_points: number
          mobile: string | null
          notes: string | null
          preferred_branch: string | null
          status: string
          updated_at: string
          vat_number: string | null
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          alt_contact?: string | null
          avatar_url?: string | null
          billing_address?: string | null
          comm_method?: string | null
          company_name?: string | null
          created_at?: string
          default_delivery_address?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          last_login?: string | null
          loyalty_points?: number
          mobile?: string | null
          notes?: string | null
          preferred_branch?: string | null
          status?: string
          updated_at?: string
          vat_number?: string | null
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          alt_contact?: string | null
          avatar_url?: string | null
          billing_address?: string | null
          comm_method?: string | null
          company_name?: string | null
          created_at?: string
          default_delivery_address?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_login?: string | null
          loyalty_points?: number
          mobile?: string | null
          notes?: string | null
          preferred_branch?: string | null
          status?: string
          updated_at?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      quote_attachments: {
        Row: {
          created_at: string
          duration_ms: number | null
          id: string
          kind: Database["public"]["Enums"]["attachment_kind"]
          name: string | null
          quote_id: string
          size: number | null
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          id?: string
          kind: Database["public"]["Enums"]["attachment_kind"]
          name?: string | null
          quote_id: string
          size?: number | null
          storage_path: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          id?: string
          kind?: Database["public"]["Enums"]["attachment_kind"]
          name?: string | null
          quote_id?: string
          size?: number | null
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_attachments_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          created_at: string
          gps_lat: number | null
          gps_lng: number | null
          id: string
          message: string | null
          processed_at: string | null
          site_address: string | null
          site_contact: string | null
          status: Database["public"]["Enums"]["quote_status"]
          urgency: Database["public"]["Enums"]["quote_urgency"]
          user_id: string
        }
        Insert: {
          created_at?: string
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          message?: string | null
          processed_at?: string | null
          site_address?: string | null
          site_contact?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          urgency?: Database["public"]["Enums"]["quote_urgency"]
          user_id: string
        }
        Update: {
          created_at?: string
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          message?: string | null
          processed_at?: string | null
          site_address?: string | null
          site_contact?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          urgency?: Database["public"]["Enums"]["quote_urgency"]
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      account_type: "customer" | "contractor" | "sales_rep"
      app_role: "super_admin" | "admin" | "sales" | "delivery" | "customer"
      attachment_kind: "image" | "video" | "audio"
      quote_status: "new" | "in_review" | "quoted" | "closed"
      quote_urgency: "standard" | "priority" | "urgent"
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
      account_type: ["customer", "contractor", "sales_rep"],
      app_role: ["super_admin", "admin", "sales", "delivery", "customer"],
      attachment_kind: ["image", "video", "audio"],
      quote_status: ["new", "in_review", "quoted", "closed"],
      quote_urgency: ["standard", "priority", "urgent"],
    },
  },
} as const
