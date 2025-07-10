export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      application_documents: {
        Row: {
          application_id: string
          application_type: string
          document_category: string | null
          document_number: string | null
          document_type: string
          expiration_date: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          is_required: boolean | null
          is_verified: boolean | null
          issuing_authority: string | null
          mime_type: string | null
          uploaded_at: string
          uploaded_by: string | null
          verification_notes: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          application_id: string
          application_type: string
          document_category?: string | null
          document_number?: string | null
          document_type: string
          expiration_date?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          is_required?: boolean | null
          is_verified?: boolean | null
          issuing_authority?: string | null
          mime_type?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          application_id?: string
          application_type?: string
          document_category?: string | null
          document_number?: string | null
          document_type?: string
          expiration_date?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_required?: boolean | null
          is_verified?: boolean | null
          issuing_authority?: string | null
          mime_type?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      application_logs: {
        Row: {
          component: string | null
          created_at: string
          error_stack: string | null
          id: string
          ip_address: unknown | null
          level: string
          message: string
          metadata: Json | null
          request_id: string | null
          route: string | null
          session_id: string | null
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          component?: string | null
          created_at?: string
          error_stack?: string | null
          id?: string
          ip_address?: unknown | null
          level: string
          message: string
          metadata?: Json | null
          request_id?: string | null
          route?: string | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          component?: string | null
          created_at?: string
          error_stack?: string | null
          id?: string
          ip_address?: unknown | null
          level?: string
          message?: string
          metadata?: Json | null
          request_id?: string | null
          route?: string | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      application_notes: {
        Row: {
          application_id: string
          application_type: string
          category: string | null
          created_at: string
          created_by: string
          id: string
          is_resolved: boolean | null
          is_urgent: boolean | null
          note_content: string
          note_type: string
          priority: string | null
          resolved_at: string | null
          resolved_by: string | null
          updated_at: string
        }
        Insert: {
          application_id: string
          application_type: string
          category?: string | null
          created_at?: string
          created_by: string
          id?: string
          is_resolved?: boolean | null
          is_urgent?: boolean | null
          note_content: string
          note_type?: string
          priority?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string
        }
        Update: {
          application_id?: string
          application_type?: string
          category?: string | null
          created_at?: string
          created_by?: string
          id?: string
          is_resolved?: boolean | null
          is_urgent?: boolean | null
          note_content?: string
          note_type?: string
          priority?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      application_updates: {
        Row: {
          action_deadline: string | null
          application_id: string
          application_type: string
          created_at: string
          created_by: string
          id: string
          is_read: boolean | null
          is_visible_to_applicant: boolean | null
          message: string
          priority: string | null
          read_at: string | null
          requires_action: boolean | null
          status_change_from: string | null
          status_change_to: string | null
          title: string
          update_type: string
        }
        Insert: {
          action_deadline?: string | null
          application_id: string
          application_type: string
          created_at?: string
          created_by: string
          id?: string
          is_read?: boolean | null
          is_visible_to_applicant?: boolean | null
          message: string
          priority?: string | null
          read_at?: string | null
          requires_action?: boolean | null
          status_change_from?: string | null
          status_change_to?: string | null
          title: string
          update_type?: string
        }
        Update: {
          action_deadline?: string | null
          application_id?: string
          application_type?: string
          created_at?: string
          created_by?: string
          id?: string
          is_read?: boolean | null
          is_visible_to_applicant?: boolean | null
          message?: string
          priority?: string | null
          read_at?: string | null
          requires_action?: boolean | null
          status_change_from?: string | null
          status_change_to?: string | null
          title?: string
          update_type?: string
        }
        Relationships: []
      }
      developer_messages: {
        Row: {
          category: string
          created_at: string
          id: string
          message: string
          metadata: Json | null
          priority: string
          recipient_type: string
          sender_id: string | null
          sender_type: string
          status: string
          thread_id: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          priority?: string
          recipient_type: string
          sender_id?: string | null
          sender_type: string
          status?: string
          thread_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          priority?: string
          recipient_type?: string
          sender_id?: string | null
          sender_type?: string
          status?: string
          thread_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          message_id: string
          metadata: Json | null
          notification_type: string
          read_at: string | null
          sent_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_id: string
          metadata?: Json | null
          notification_type: string
          read_at?: string | null
          sent_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_id?: string
          metadata?: Json | null
          notification_type?: string
          read_at?: string | null
          sent_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "developer_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          browser_notifications: boolean
          created_at: string
          developer_messages_email: boolean
          email_frequency: string
          email_notifications: boolean
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          browser_notifications?: boolean
          created_at?: string
          developer_messages_email?: boolean
          email_frequency?: string
          email_notifications?: boolean
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          browser_notifications?: boolean
          created_at?: string
          developer_messages_email?: boolean
          email_frequency?: string
          email_notifications?: boolean
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pharmacist_applications: {
        Row: {
          aliases_nicknames: string | null
          caqh_profile_id: string | null
          created_at: string
          dea_certificate_number: string | null
          driver_license_state: string | null
          email: string | null
          external_form_id: string | null
          first_name: string | null
          graduation_date: string | null
          has_work_gaps: boolean | null
          id: string
          languages_spoken: string[] | null
          last_name: string | null
          license_date_issued: string | null
          license_expiration_date: string | null
          mailing_address: string | null
          medicaid_number: string | null
          medicare_cert_level: string | null
          medicare_certification_number: string | null
          medicare_certified: boolean | null
          medicare_details: string | null
          middle_name: string | null
          notes_internal: string | null
          npi_number: string | null
          other_languages: string | null
          overall_completion_percentage: number | null
          pharmacy_degree: string | null
          pharmacy_school_name: string | null
          phone: string | null
          registrar_phone: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          school_mailing_address: string | null
          school_website: string | null
          section_documents_complete: boolean | null
          section_education_complete: boolean | null
          section_personal_complete: boolean | null
          section_professional_complete: boolean | null
          ssn_encrypted: string | null
          state_license_number: string | null
          state_license_state: string | null
          status: string
          submission_source: string | null
          submitted_at: string | null
          updated_at: string
          user_id: string
          work_gap_explanation: string | null
        }
        Insert: {
          aliases_nicknames?: string | null
          caqh_profile_id?: string | null
          created_at?: string
          dea_certificate_number?: string | null
          driver_license_state?: string | null
          email?: string | null
          external_form_id?: string | null
          first_name?: string | null
          graduation_date?: string | null
          has_work_gaps?: boolean | null
          id?: string
          languages_spoken?: string[] | null
          last_name?: string | null
          license_date_issued?: string | null
          license_expiration_date?: string | null
          mailing_address?: string | null
          medicaid_number?: string | null
          medicare_cert_level?: string | null
          medicare_certification_number?: string | null
          medicare_certified?: boolean | null
          medicare_details?: string | null
          middle_name?: string | null
          notes_internal?: string | null
          npi_number?: string | null
          other_languages?: string | null
          overall_completion_percentage?: number | null
          pharmacy_degree?: string | null
          pharmacy_school_name?: string | null
          phone?: string | null
          registrar_phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_mailing_address?: string | null
          school_website?: string | null
          section_documents_complete?: boolean | null
          section_education_complete?: boolean | null
          section_personal_complete?: boolean | null
          section_professional_complete?: boolean | null
          ssn_encrypted?: string | null
          state_license_number?: string | null
          state_license_state?: string | null
          status?: string
          submission_source?: string | null
          submitted_at?: string | null
          updated_at?: string
          user_id: string
          work_gap_explanation?: string | null
        }
        Update: {
          aliases_nicknames?: string | null
          caqh_profile_id?: string | null
          created_at?: string
          dea_certificate_number?: string | null
          driver_license_state?: string | null
          email?: string | null
          external_form_id?: string | null
          first_name?: string | null
          graduation_date?: string | null
          has_work_gaps?: boolean | null
          id?: string
          languages_spoken?: string[] | null
          last_name?: string | null
          license_date_issued?: string | null
          license_expiration_date?: string | null
          mailing_address?: string | null
          medicaid_number?: string | null
          medicare_cert_level?: string | null
          medicare_certification_number?: string | null
          medicare_certified?: boolean | null
          medicare_details?: string | null
          middle_name?: string | null
          notes_internal?: string | null
          npi_number?: string | null
          other_languages?: string | null
          overall_completion_percentage?: number | null
          pharmacy_degree?: string | null
          pharmacy_school_name?: string | null
          phone?: string | null
          registrar_phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_mailing_address?: string | null
          school_website?: string | null
          section_documents_complete?: boolean | null
          section_education_complete?: boolean | null
          section_personal_complete?: boolean | null
          section_professional_complete?: boolean | null
          ssn_encrypted?: string | null
          state_license_number?: string | null
          state_license_state?: string | null
          status?: string
          submission_source?: string | null
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
          work_gap_explanation?: string | null
        }
        Relationships: []
      }
      pharmacist_pharmacy_associations: {
        Row: {
          association_type: string
          created_at: string
          employment_status: string | null
          end_date: string | null
          id: string
          is_primary_location: boolean | null
          pharmacist_application_id: string
          pharmacy_application_id: string
          start_date: string | null
          updated_at: string
        }
        Insert: {
          association_type: string
          created_at?: string
          employment_status?: string | null
          end_date?: string | null
          id?: string
          is_primary_location?: boolean | null
          pharmacist_application_id: string
          pharmacy_application_id: string
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          association_type?: string
          created_at?: string
          employment_status?: string | null
          end_date?: string | null
          id?: string
          is_primary_location?: boolean | null
          pharmacist_application_id?: string
          pharmacy_application_id?: string
          start_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pharmacy_applications: {
        Row: {
          business_license_number: string | null
          chain_name: string | null
          created_at: string
          dea_registration: string | null
          external_form_id: string | null
          facility_address: string | null
          facility_name: string | null
          facility_type: string | null
          head_pharmacist_license: string | null
          head_pharmacist_name: string | null
          id: string
          mailing_address: string | null
          medicaid_provider_number: string | null
          medicare_provider_number: string | null
          notes_internal: string | null
          npi_number: string | null
          number_of_locations: number | null
          overall_completion_percentage: number | null
          ownership_structure: string | null
          parent_company: string | null
          pharmacist_count: number | null
          primary_contact_email: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          state_pharmacy_license: string | null
          status: string
          submission_source: string | null
          submitted_at: string | null
          tax_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_license_number?: string | null
          chain_name?: string | null
          created_at?: string
          dea_registration?: string | null
          external_form_id?: string | null
          facility_address?: string | null
          facility_name?: string | null
          facility_type?: string | null
          head_pharmacist_license?: string | null
          head_pharmacist_name?: string | null
          id?: string
          mailing_address?: string | null
          medicaid_provider_number?: string | null
          medicare_provider_number?: string | null
          notes_internal?: string | null
          npi_number?: string | null
          number_of_locations?: number | null
          overall_completion_percentage?: number | null
          ownership_structure?: string | null
          parent_company?: string | null
          pharmacist_count?: number | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          state_pharmacy_license?: string | null
          status?: string
          submission_source?: string | null
          submitted_at?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_license_number?: string | null
          chain_name?: string | null
          created_at?: string
          dea_registration?: string | null
          external_form_id?: string | null
          facility_address?: string | null
          facility_name?: string | null
          facility_type?: string | null
          head_pharmacist_license?: string | null
          head_pharmacist_name?: string | null
          id?: string
          mailing_address?: string | null
          medicaid_provider_number?: string | null
          medicare_provider_number?: string | null
          notes_internal?: string | null
          npi_number?: string | null
          number_of_locations?: number | null
          overall_completion_percentage?: number | null
          ownership_structure?: string | null
          parent_company?: string | null
          pharmacist_count?: number | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          state_pharmacy_license?: string | null
          status?: string
          submission_source?: string | null
          submitted_at?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          role_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          performed_by: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          performed_by: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          performed_by?: string
          user_id?: string
        }
        Relationships: []
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role_id: number
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role_id: number
          token: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role_id?: number
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_detect_message_category: {
        Args: { message_text: string }
        Returns: string
      }
      auto_detect_message_priority: {
        Args: { message_text: string }
        Returns: string
      }
      cleanup_old_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_message_notifications: {
        Args: { message_id_param: string }
        Returns: undefined
      }
      get_admin_notification_recipients: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          first_name: string
          role_name: string
        }[]
      }
      get_current_user_role_id: {
        Args: Record<PropertyKey, never>
        Returns: number
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
