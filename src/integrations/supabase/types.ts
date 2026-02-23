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
      activity_logs: {
        Row: {
          created_at: string
          description: string
          id: string
          points: number
          type: Database["public"]["Enums"]["activity_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          points: number
          type: Database["public"]["Enums"]["activity_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          points?: number
          type?: Database["public"]["Enums"]["activity_type"]
          user_id?: string
        }
        Relationships: []
      }
      agent_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          used: boolean
          used_by: string | null
          used_by_name: string | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          used?: boolean
          used_by?: string | null
          used_by_name?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          used?: boolean
          used_by?: string | null
          used_by_name?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          agent_code: string
          created_at: string
          id: string
          name: string
          phone: string
          points: number
          status: Database["public"]["Enums"]["user_status"]
          total_earned: number
          total_redeemed: number
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_code: string
          created_at?: string
          id?: string
          name: string
          phone: string
          points?: number
          status?: Database["public"]["Enums"]["user_status"]
          total_earned?: number
          total_redeemed?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_code?: string
          created_at?: string
          id?: string
          name?: string
          phone?: string
          points?: number
          status?: Database["public"]["Enums"]["user_status"]
          total_earned?: number
          total_redeemed?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      qr_batches: {
        Row: {
          created_at: string
          id: string
          points_per_code: number
          product_name: string
          redeemed_count: number
          total_codes: number
        }
        Insert: {
          created_at?: string
          id?: string
          points_per_code: number
          product_name: string
          redeemed_count?: number
          total_codes: number
        }
        Update: {
          created_at?: string
          id?: string
          points_per_code?: number
          product_name?: string
          redeemed_count?: number
          total_codes?: number
        }
        Relationships: []
      }
      qr_codes: {
        Row: {
          batch_id: string
          code: string
          created_at: string
          id: string
          points: number
          product_name: string
          redeemed_at: string | null
          redeemed_by: string | null
          redeemed_by_name: string | null
          status: Database["public"]["Enums"]["qr_status"]
        }
        Insert: {
          batch_id: string
          code: string
          created_at?: string
          id?: string
          points: number
          product_name: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          redeemed_by_name?: string | null
          status?: Database["public"]["Enums"]["qr_status"]
        }
        Update: {
          batch_id?: string
          code?: string
          created_at?: string
          id?: string
          points?: number
          product_name?: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          redeemed_by_name?: string | null
          status?: Database["public"]["Enums"]["qr_status"]
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "qr_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      redemptions: {
        Row: {
          created_at: string
          id: string
          points_used: number
          product_name: string
          status: Database["public"]["Enums"]["redemption_status"]
          store_address: string | null
          store_phone: string | null
          type: Database["public"]["Enums"]["redemption_type"]
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          points_used: number
          product_name: string
          status?: Database["public"]["Enums"]["redemption_status"]
          store_address?: string | null
          store_phone?: string | null
          type: Database["public"]["Enums"]["redemption_type"]
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string
          id?: string
          points_used?: number
          product_name?: string
          status?: Database["public"]["Enums"]["redemption_status"]
          store_address?: string | null
          store_phone?: string | null
          type?: Database["public"]["Enums"]["redemption_type"]
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      reward_products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image: string
          name: string
          points_cost: number
          stock: number
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image?: string
          name: string
          points_cost: number
          stock?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image?: string
          name?: string
          points_cost?: number
          stock?: number
        }
        Relationships: []
      }
      store_locations: {
        Row: {
          address: string
          created_at: string
          id: string
          lat: number | null
          lng: number | null
          name: string
          phone: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          phone: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          phone?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          account_number: string
          amount: number
          bank_name: string
          created_at: string
          id: string
          points_used: number
          status: Database["public"]["Enums"]["withdrawal_status"]
          user_id: string
          user_name: string
        }
        Insert: {
          account_number: string
          amount: number
          bank_name: string
          created_at?: string
          id?: string
          points_used: number
          status?: Database["public"]["Enums"]["withdrawal_status"]
          user_id: string
          user_name: string
        }
        Update: {
          account_number?: string
          amount?: number
          bank_name?: string
          created_at?: string
          id?: string
          points_used?: number
          status?: Database["public"]["Enums"]["withdrawal_status"]
          user_id?: string
          user_name?: string
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
    }
    Enums: {
      activity_type: "scan" | "redeem" | "withdraw" | "bonus" | "deduction"
      app_role: "admin" | "user"
      qr_status: "pending" | "redeemed" | "expired"
      redemption_status:
        | "pending"
        | "approved"
        | "dispatched"
        | "completed"
        | "rejected"
      redemption_type: "store_pickup" | "delivery" | "bank_withdrawal"
      user_status: "active" | "suspended"
      withdrawal_status: "pending" | "approved" | "rejected"
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
      activity_type: ["scan", "redeem", "withdraw", "bonus", "deduction"],
      app_role: ["admin", "user"],
      qr_status: ["pending", "redeemed", "expired"],
      redemption_status: [
        "pending",
        "approved",
        "dispatched",
        "completed",
        "rejected",
      ],
      redemption_type: ["store_pickup", "delivery", "bank_withdrawal"],
      user_status: ["active", "suspended"],
      withdrawal_status: ["pending", "approved", "rejected"],
    },
  },
} as const
