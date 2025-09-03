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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          category: string
          contact_email: string | null
          created_at: string
          created_by: string | null
          id: string
          location: string | null
          name: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          category: string
          contact_email?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          location?: string | null
          name: string
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          category?: string
          contact_email?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          location?: string | null
          name?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          account_id: string | null
          account_type: string | null
          action_type: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          performed_by_email: string | null
          performed_by_user_id: string | null
          target_user_email: string
          target_user_id: string | null
          target_user_name: string
          target_user_role: string
          user_agent: string | null
        }
        Insert: {
          account_id?: string | null
          account_type?: string | null
          action_type: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          performed_by_email?: string | null
          performed_by_user_id?: string | null
          target_user_email: string
          target_user_id?: string | null
          target_user_name: string
          target_user_role: string
          user_agent?: string | null
        }
        Update: {
          account_id?: string | null
          account_type?: string | null
          action_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          performed_by_email?: string | null
          performed_by_user_id?: string | null
          target_user_email?: string
          target_user_id?: string | null
          target_user_name?: string
          target_user_role?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      password_history: {
        Row: {
          created_at: string
          id: string
          password_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          password_hash: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          password_hash?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_id: string | null
          account_type: string | null
          activated_at: string | null
          activation_sent_at: string | null
          activation_status: string | null
          activation_token: string | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          department: string | null
          email: string
          full_name: string | null
          id: string
          location: string | null
          must_change_password: boolean | null
          password_changed_at: string | null
          password_expires_at: string | null
          permissions: string[] | null
          phone: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          account_type?: string | null
          activated_at?: string | null
          activation_sent_at?: string | null
          activation_status?: string | null
          activation_token?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          department?: string | null
          email: string
          full_name?: string | null
          id?: string
          location?: string | null
          must_change_password?: boolean | null
          password_changed_at?: string | null
          password_expires_at?: string | null
          permissions?: string[] | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          account_type?: string | null
          activated_at?: string | null
          activation_sent_at?: string | null
          activation_status?: string | null
          activation_token?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          department?: string | null
          email?: string
          full_name?: string | null
          id?: string
          location?: string | null
          must_change_password?: boolean | null
          password_changed_at?: string | null
          password_expires_at?: string | null
          permissions?: string[] | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_user_account: {
        Args: { activation_token_param: string }
        Returns: boolean
      }
      add_password_to_history: {
        Args: { password_hash_param: string; user_id_param: string }
        Returns: undefined
      }
      check_password_common_leaks: {
        Args: { password_text: string }
        Returns: boolean
      }
      check_password_history: {
        Args: { new_password_hash: string; user_id_param: string }
        Returns: boolean
      }
      create_pending_user: {
        Args:
          | {
              user_account_id?: string
              user_account_type?: string
              user_department?: string
              user_email: string
              user_full_name: string
              user_location?: string
              user_phone?: string
              user_role?: string
            }
          | {
              user_account_id?: string
              user_account_type?: string
              user_email: string
              user_full_name: string
              user_role?: string
            }
        Returns: string
      }
      delete_admin_with_audit: {
        Args: {
          p_admin_id: string
          p_deletion_reason?: string
          p_hard_delete?: boolean
        }
        Returns: Json
      }
      generate_activation_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_password_expired: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_account_id?: string
          p_account_type?: string
          p_action_type: string
          p_deletion_reason?: string
          p_details?: Json
          p_target_user_email: string
          p_target_user_id: string
          p_target_user_name: string
          p_target_user_role: string
        }
        Returns: string
      }
      update_password_expiration: {
        Args: { user_id_param: string }
        Returns: undefined
      }
      validate_password_strength: {
        Args: { password_text: string; user_email?: string; user_name?: string }
        Returns: boolean
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
