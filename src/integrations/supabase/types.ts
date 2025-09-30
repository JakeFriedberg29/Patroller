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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          tenant_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          tenant_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          tenant_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs_current_month: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          tenant_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          tenant_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          tenant_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      email_notification_logs: {
        Row: {
          error_message: string | null
          id: string
          notification_key: string
          provider: string | null
          provider_message_id: string | null
          recipient_email: string
          sent_at: string
          status: string
          tenant_id: string
          user_id: string | null
        }
        Insert: {
          error_message?: string | null
          id?: string
          notification_key: string
          provider?: string | null
          provider_message_id?: string | null
          recipient_email: string
          sent_at?: string
          status: string
          tenant_id: string
          user_id?: string | null
        }
        Update: {
          error_message?: string | null
          id?: string
          notification_key?: string
          provider?: string | null
          provider_message_id?: string | null
          recipient_email?: string
          sent_at?: string
          status?: string
          tenant_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_notification_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_notification_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_notification_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      email_notification_templates: {
        Row: {
          body_html: string | null
          body_text: string | null
          created_at: string
          id: string
          is_enabled: boolean
          last_sent_at: string | null
          last_sent_to: string | null
          notification_key: string
          subject: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          last_sent_at?: string | null
          last_sent_to?: string | null
          notification_key: string
          subject?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          last_sent_at?: string | null
          last_sent_to?: string | null
          notification_key?: string
          subject?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_notification_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_notification_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      enterprise_subtypes: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enterprise_subtypes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enterprise_subtypes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      enterprises: {
        Row: {
          created_at: string
          id: string
          max_organizations: number | null
          max_users: number | null
          name: string
          settings: Json | null
          slug: string
          subscription_expires_at: string | null
          subscription_status: string
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_organizations?: number | null
          max_users?: number | null
          name: string
          settings?: Json | null
          slug: string
          subscription_expires_at?: string | null
          subscription_status?: string
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          max_organizations?: number | null
          max_users?: number | null
          name?: string
          settings?: Json | null
          slug?: string
          subscription_expires_at?: string | null
          subscription_status?: string
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean
          tenant_id: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean
          tenant_id: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          tenant_id?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_subtypes: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_subtypes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_subtypes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: Json | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          organization_type: Database["public"]["Enums"]["organization_type"]
          settings: Json | null
          slug: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address?: Json | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          organization_type: Database["public"]["Enums"]["organization_type"]
          settings?: Json | null
          slug: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address?: Json | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          organization_type?: Database["public"]["Enums"]["organization_type"]
          settings?: Json | null
          slug?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      patroller_report_visibility: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          organization_id: string
          template_id: string
          tenant_id: string
          updated_at: string
          visible_to_patrollers: boolean
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id: string
          template_id: string
          tenant_id: string
          updated_at?: string
          visible_to_patrollers?: boolean
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id?: string
          template_id?: string
          tenant_id?: string
          updated_at?: string
          visible_to_patrollers?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "organization_report_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_report_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_report_settings_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_report_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_report_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admin_account_assignments: {
        Row: {
          account_id: string
          account_type: string
          assigned_at: string
          assigned_by: string | null
          created_at: string
          id: string
          is_active: boolean
          platform_admin_id: string
          updated_at: string
        }
        Insert: {
          account_id: string
          account_type: string
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          platform_admin_id: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          account_type?: string
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          platform_admin_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      report_templates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          organization_id: string | null
          status: Database["public"]["Enums"]["report_template_status"]
          template_schema: Json
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          organization_id?: string | null
          status?: Database["public"]["Enums"]["report_template_status"]
          template_schema: Json
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string | null
          status?: Database["public"]["Enums"]["report_template_status"]
          template_schema?: Json
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      reports_submissions: {
        Row: {
          account_id: string
          account_type: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          metadata: Json | null
          report_type: string
          submitted_at: string
          template_id: string | null
          template_version: number | null
          tenant_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          account_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          report_type: string
          submitted_at?: string
          template_id?: string | null
          template_version?: number | null
          tenant_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          account_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          report_type?: string
          submitted_at?: string
          template_id?: string | null
          template_version?: number | null
          tenant_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      repository_assignments: {
        Row: {
          created_at: string
          created_by: string | null
          element_id: string
          element_type: Database["public"]["Enums"]["platform_element_type"]
          id: string
          target_organization_id: string | null
          target_organization_type:
            | Database["public"]["Enums"]["organization_type"]
            | null
          target_type: Database["public"]["Enums"]["platform_assignment_target_type"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          element_id: string
          element_type: Database["public"]["Enums"]["platform_element_type"]
          id?: string
          target_organization_id?: string | null
          target_organization_type?:
            | Database["public"]["Enums"]["organization_type"]
            | null
          target_type: Database["public"]["Enums"]["platform_assignment_target_type"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          element_id?: string
          element_type?: Database["public"]["Enums"]["platform_element_type"]
          id?: string
          target_organization_id?: string | null
          target_organization_type?:
            | Database["public"]["Enums"]["organization_type"]
            | null
          target_type?: Database["public"]["Enums"]["platform_assignment_target_type"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_assignments_target_organization_id_fkey"
            columns: ["target_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events: {
        Row: {
          created_at: string
          description: string
          event_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          tenant_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description: string
          event_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          tenant_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          event_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          tenant_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_events_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          email: string | null
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          is_active: boolean
          organization_id: string | null
          permission: string | null
          role_type: Database["public"]["Enums"]["role_type"]
          user_id: string
        }
        Insert: {
          email?: string | null
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string | null
          permission?: string | null
          role_type: Database["public"]["Enums"]["role_type"]
          user_id: string
        }
        Update: {
          email?: string | null
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string | null
          permission?: string | null
          role_type?: Database["public"]["Enums"]["role_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: unknown | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: unknown | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_user_id: string | null
          created_at: string
          email: string
          email_verified: boolean
          employee_id: string | null
          first_name: string | null
          full_name: string
          id: string
          last_login_at: string | null
          last_name: string | null
          organization_id: string | null
          phone: string | null
          preferences: Json | null
          profile_data: Json | null
          status: Database["public"]["Enums"]["user_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          email: string
          email_verified?: boolean
          employee_id?: string | null
          first_name?: string | null
          full_name: string
          id?: string
          last_login_at?: string | null
          last_name?: string | null
          organization_id?: string | null
          phone?: string | null
          preferences?: Json | null
          profile_data?: Json | null
          status?: Database["public"]["Enums"]["user_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          email?: string
          email_verified?: boolean
          employee_id?: string | null
          first_name?: string | null
          full_name?: string
          id?: string
          last_login_at?: string | null
          last_name?: string | null
          organization_id?: string | null
          phone?: string | null
          preferences?: Json | null
          profile_data?: Json | null
          status?: Database["public"]["Enums"]["user_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      reports_flat: {
        Row: {
          account_id: string | null
          account_type: string | null
          created_by: string | null
          description: string | null
          id: string | null
          incident_type: string | null
          metadata: Json | null
          report_type: string | null
          severity: string | null
          status: string | null
          submitted_at: string | null
          template_id: string | null
          template_version: number | null
          tenant_id: string | null
          title: string | null
        }
        Insert: {
          account_id?: string | null
          account_type?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          incident_type?: never
          metadata?: Json | null
          report_type?: string | null
          severity?: never
          status?: never
          submitted_at?: string | null
          template_id?: string | null
          template_version?: number | null
          tenant_id?: string | null
          title?: string | null
        }
        Update: {
          account_id?: string | null
          account_type?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          incident_type?: never
          metadata?: Json | null
          report_type?: string | null
          severity?: never
          status?: never
          submitted_at?: string | null
          template_id?: string | null
          template_version?: number | null
          tenant_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string | null
          id: string | null
          max_organizations: number | null
          max_users: number | null
          name: string | null
          settings: Json | null
          slug: string | null
          subscription_expires_at: string | null
          subscription_status: string | null
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          max_organizations?: number | null
          max_users?: number | null
          name?: string | null
          settings?: Json | null
          slug?: string | null
          subscription_expires_at?: string | null
          subscription_status?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          max_organizations?: number | null
          max_users?: number | null
          name?: string | null
          settings?: Json | null
          slug?: string | null
          subscription_expires_at?: string | null
          subscription_status?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      activate_user_account: {
        Args: { p_activation_token: string }
        Returns: Json
      }
      activate_user_account_with_password: {
        Args: { p_activation_token: string; p_password: string }
        Returns: Json
      }
      add_organization_subtype: {
        Args: { p_name: string }
        Returns: undefined
      }
      assert_record_matches_org_tenant: {
        Args: { p_org_id: string; p_tenant_id: string }
        Returns: undefined
      }
      assert_same_tenant_for_user_and_org: {
        Args: { p_org_id: string; p_user_id: string }
        Returns: undefined
      }
      cleanup_dummy_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      create_audit_log_partition: {
        Args: { p_month: number; p_year: number }
        Returns: string
      }
      create_incident: {
        Args: {
          p_description: string
          p_incident_type: string
          p_location_id?: string
          p_occurred_at?: string
          p_priority: Database["public"]["Enums"]["incident_priority"]
          p_title: string
        }
        Returns: string
      }
      create_pending_user: {
        Args:
          | {
              p_department?: string
              p_email: string
              p_full_name: string
              p_location?: string
              p_organization_id?: string
              p_phone?: string
              p_role_type?: Database["public"]["Enums"]["role_type"]
              p_tenant_id: string
            }
          | {
              p_email: string
              p_full_name: string
              p_location?: string
              p_organization_id?: string
              p_phone?: string
              p_role_type?: Database["public"]["Enums"]["role_type"]
              p_tenant_id: string
            }
        Returns: Json
      }
      create_tenant_with_organization: {
        Args: {
          p_admin_email: string
          p_admin_name: string
          p_org_name: string
          p_org_slug: string
          p_org_type: Database["public"]["Enums"]["organization_type"]
          p_subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          p_tenant_name: string
          p_tenant_slug: string
        }
        Returns: Json
      }
      create_user: {
        Args: {
          p_email: string
          p_employee_id?: string
          p_full_name: string
          p_organization_id?: string
          p_phone?: string
          p_role_type?: Database["public"]["Enums"]["role_type"]
          p_tenant_id: string
        }
        Returns: string
      }
      create_user_with_activation: {
        Args:
          | {
              p_department?: string
              p_email: string
              p_full_name: string
              p_location?: string
              p_organization_id?: string
              p_phone?: string
              p_role_type?: Database["public"]["Enums"]["role_type"]
              p_tenant_id: string
            }
          | {
              p_email: string
              p_full_name: string
              p_location?: string
              p_organization_id?: string
              p_phone?: string
              p_role_type?: Database["public"]["Enums"]["role_type"]
              p_tenant_id: string
            }
        Returns: Json
      }
      delete_organization_subtype: {
        Args: { p_name: string }
        Returns: undefined
      }
      ensure_current_user_platform_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      generate_activation_token: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_current_user_organization_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      global_search: {
        Args: { p_limit?: number; p_query: string }
        Returns: Json
      }
      is_platform_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_user_action: {
        Args: {
          p_action: string
          p_metadata?: Json
          p_new_values?: Json
          p_old_values?: Json
          p_resource_id: string
          p_resource_type: string
        }
        Returns: undefined
      }
      rename_organization_subtype: {
        Args: { p_new_name: string; p_old_name: string }
        Returns: undefined
      }
      send_notification: {
        Args: {
          p_expires_at?: string
          p_message: string
          p_title: string
          p_type?: string
          p_user_ids: string[]
        }
        Returns: number
      }
      set_report_template_status: {
        Args: {
          p_status: Database["public"]["Enums"]["report_template_status"]
          p_template_id: string
        }
        Returns: Json
      }
      user_has_full_permission: {
        Args: { _role_type: Database["public"]["Enums"]["role_type"] }
        Returns: boolean
      }
      user_has_role: {
        Args: { _role_type: Database["public"]["Enums"]["role_type"] }
        Returns: boolean
      }
    }
    Enums: {
      equipment_status:
        | "available"
        | "in_use"
        | "maintenance"
        | "damaged"
        | "retired"
      incident_priority: "low" | "medium" | "high" | "critical" | "emergency"
      organization_type:
        | "search_and_rescue"
        | "lifeguard_service"
        | "park_service"
        | "event_medical"
        | "ski_patrol"
        | "harbor_master"
        | "volunteer_emergency_services"
      platform_assignment_target_type: "organization" | "organization_type"
      platform_element_type: "report_template"
      report_template_status:
        | "draft"
        | "ready"
        | "published"
        | "unpublished"
        | "archive"
      role_type:
        | "platform_admin"
        | "enterprise_admin"
        | "organization_admin"
        | "supervisor"
        | "member"
        | "observer"
        | "responder"
        | "team_leader"
        | "enterprise_user"
        | "organization_user"
        | "patroller"
      subscription_tier:
        | "free"
        | "basic"
        | "professional"
        | "enterprise"
        | "custom"
      user_status:
        | "pending"
        | "active"
        | "inactive"
        | "suspended"
        | "deactivated"
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
      equipment_status: [
        "available",
        "in_use",
        "maintenance",
        "damaged",
        "retired",
      ],
      incident_priority: ["low", "medium", "high", "critical", "emergency"],
      organization_type: [
        "search_and_rescue",
        "lifeguard_service",
        "park_service",
        "event_medical",
        "ski_patrol",
        "harbor_master",
        "volunteer_emergency_services",
      ],
      platform_assignment_target_type: ["organization", "organization_type"],
      platform_element_type: ["report_template"],
      report_template_status: [
        "draft",
        "ready",
        "published",
        "unpublished",
        "archive",
      ],
      role_type: [
        "platform_admin",
        "enterprise_admin",
        "organization_admin",
        "supervisor",
        "member",
        "observer",
        "responder",
        "team_leader",
        "enterprise_user",
        "organization_user",
        "patroller",
      ],
      subscription_tier: [
        "free",
        "basic",
        "professional",
        "enterprise",
        "custom",
      ],
      user_status: [
        "pending",
        "active",
        "inactive",
        "suspended",
        "deactivated",
      ],
    },
  },
} as const