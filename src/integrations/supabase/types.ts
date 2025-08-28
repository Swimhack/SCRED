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
      ai_analysis: {
        Row: {
          analysis_type: string
          confidence_score: number | null
          created_at: string
          developer_approved: boolean | null
          developer_notes: string | null
          generated_prompt: string | null
          id: string
          message_id: string
          processed_at: string
          sources: string[] | null
          suggested_response: string | null
          updated_at: string
        }
        Insert: {
          analysis_type: string
          confidence_score?: number | null
          created_at?: string
          developer_approved?: boolean | null
          developer_notes?: string | null
          generated_prompt?: string | null
          id?: string
          message_id: string
          processed_at?: string
          sources?: string[] | null
          suggested_response?: string | null
          updated_at?: string
        }
        Update: {
          analysis_type?: string
          confidence_score?: number | null
          created_at?: string
          developer_approved?: boolean | null
          developer_notes?: string | null
          generated_prompt?: string | null
          id?: string
          message_id?: string
          processed_at?: string
          sources?: string[] | null
          suggested_response?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_analysis_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "developer_messages"
            referencedColumns: ["id"]
          },
        ]
      }
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
      notification_analytics: {
        Row: {
          avg_delivery_time_seconds: number | null
          category: string | null
          channel: string
          created_at: string
          date: string
          hour: number | null
          id: string
          priority: string | null
          total_cost_cents: number | null
          total_delivered: number | null
          total_failed: number | null
          total_read: number | null
          total_sent: number | null
          user_role: string | null
        }
        Insert: {
          avg_delivery_time_seconds?: number | null
          category?: string | null
          channel: string
          created_at?: string
          date: string
          hour?: number | null
          id?: string
          priority?: string | null
          total_cost_cents?: number | null
          total_delivered?: number | null
          total_failed?: number | null
          total_read?: number | null
          total_sent?: number | null
          user_role?: string | null
        }
        Update: {
          avg_delivery_time_seconds?: number | null
          category?: string | null
          channel?: string
          created_at?: string
          date?: string
          hour?: number | null
          id?: string
          priority?: string | null
          total_cost_cents?: number | null
          total_delivered?: number | null
          total_failed?: number | null
          total_read?: number | null
          total_sent?: number | null
          user_role?: string | null
        }
        Relationships: []
      }
      notification_channels: {
        Row: {
          channel: string
          channel_data: Json | null
          cost_cents: number | null
          created_at: string
          delivered_at: string | null
          error_message: string | null
          failed_at: string | null
          id: string
          max_retries: number | null
          next_retry_at: string | null
          notification_id: string
          provider_id: string | null
          provider_response: Json | null
          read_at: string | null
          retry_count: number | null
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          channel: string
          channel_data?: Json | null
          cost_cents?: number | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          notification_id: string
          provider_id?: string | null
          provider_response?: Json | null
          read_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          channel?: string
          channel_data?: Json | null
          cost_cents?: number | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          notification_id?: string
          provider_id?: string | null
          provider_response?: Json | null
          read_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_channels_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notification_logs"
            referencedColumns: ["id"]
          },
        ]
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
          application_updates_email: boolean
          browser_notifications: boolean
          created_at: string
          critical_channels: string[] | null
          developer_messages_email: boolean
          email_frequency: string
          email_notifications: boolean
          escalation_delay_minutes: number | null
          escalation_enabled: boolean
          escalation_recipient_id: string | null
          haptic_enabled: boolean
          high_channels: string[] | null
          id: string
          low_channels: string[] | null
          normal_channels: string[] | null
          notification_sound: string | null
          phone_number: string | null
          phone_verified: boolean
          push_subscription: Json | null
          quiet_hours_enabled: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          sms_critical_only: boolean
          sms_enabled: boolean
          sound_enabled: boolean
          system_alerts_email: boolean
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          application_updates_email?: boolean
          browser_notifications?: boolean
          created_at?: string
          critical_channels?: string[] | null
          developer_messages_email?: boolean
          email_frequency?: string
          email_notifications?: boolean
          escalation_delay_minutes?: number | null
          escalation_enabled?: boolean
          escalation_recipient_id?: string | null
          haptic_enabled?: boolean
          high_channels?: string[] | null
          id?: string
          low_channels?: string[] | null
          normal_channels?: string[] | null
          notification_sound?: string | null
          phone_number?: string | null
          phone_verified?: boolean
          push_subscription?: Json | null
          quiet_hours_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_critical_only?: boolean
          sms_enabled?: boolean
          sound_enabled?: boolean
          system_alerts_email?: boolean
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          application_updates_email?: boolean
          browser_notifications?: boolean
          created_at?: string
          critical_channels?: string[] | null
          developer_messages_email?: boolean
          email_frequency?: string
          email_notifications?: boolean
          escalation_delay_minutes?: number | null
          escalation_enabled?: boolean
          escalation_recipient_id?: string | null
          haptic_enabled?: boolean
          high_channels?: string[] | null
          id?: string
          low_channels?: string[] | null
          normal_channels?: string[] | null
          notification_sound?: string | null
          phone_number?: string | null
          phone_verified?: boolean
          push_subscription?: Json | null
          quiet_hours_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_critical_only?: boolean
          sms_enabled?: boolean
          sound_enabled?: boolean
          system_alerts_email?: boolean
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          channels_to_process: string[]
          created_at: string
          error_message: string | null
          id: string
          max_attempts: number | null
          notification_id: string
          priority: number
          processed_at: string | null
          processing_attempts: number | null
          processing_started_at: string | null
          scheduled_for: string
          status: string
          updated_at: string
        }
        Insert: {
          channels_to_process: string[]
          created_at?: string
          error_message?: string | null
          id?: string
          max_attempts?: number | null
          notification_id: string
          priority?: number
          processed_at?: string | null
          processing_attempts?: number | null
          processing_started_at?: string | null
          scheduled_for?: string
          status?: string
          updated_at?: string
        }
        Update: {
          channels_to_process?: string[]
          created_at?: string
          error_message?: string | null
          id?: string
          max_attempts?: number | null
          notification_id?: string
          priority?: number
          processed_at?: string | null
          processing_attempts?: number | null
          processing_started_at?: string | null
          scheduled_for?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_queue_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notification_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          body_template: string
          category: string
          channel: string
          created_at: string
          id: string
          is_active: boolean
          is_system_template: boolean
          name: string
          organization_id: string | null
          priority: string
          subject_template: string | null
          updated_at: string
          variables: Json | null
        }
        Insert: {
          body_template: string
          category: string
          channel: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_system_template?: boolean
          name: string
          organization_id?: string | null
          priority?: string
          subject_template?: string | null
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          body_template?: string
          category?: string
          channel?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_system_template?: boolean
          name?: string
          organization_id?: string | null
          priority?: string
          subject_template?: string | null
          updated_at?: string
          variables?: Json | null
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
      facility_questionnaires: {
        Row: {
          accepts_medicaid: boolean
          accepts_medicare: boolean
          additional_notes: string | null
          annual_prescription_volume: number | null
          automated_dispensing: boolean
          backup_power_system: boolean
          buying_group_membership: string | null
          chain_affiliation: string | null
          city: string
          compounding_services: boolean
          created_at: string
          dea_expiration: string | null
          dea_registration: string | null
          delivery_available: boolean
          disaster_recovery_plan: boolean
          e_prescribing_enabled: boolean
          electronic_health_records: boolean
          email: string
          emergency_plan: boolean
          facility_name: string
          facility_npi: string | null
          facility_type: string | null
          fax: string | null
          hipaa_compliant: boolean
          id: string
          immunization_services: boolean
          inspection_results: string | null
          last_board_inspection: string | null
          liability_coverage_amount: string
          liability_expiration: string
          liability_insurance_carrier: string
          liability_policy_number: string
          license_expiration: string
          medication_therapy_management: boolean
          number_of_locations: number
          organization_id: string | null
          ownership_type: string | null
          pharmacy_management_system: string | null
          phone: string
          preferred_wholesaler: string | null
          primary_address: string
          quality_assurance_program: boolean
          quality_program_description: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          state: string
          state_pharmacy_license: string
          status: string
          submitted_at: string | null
          submitted_by: string | null
          tax_id: string | null
          total_pharmacists: number
          total_support_staff: number
          total_technicians: number
          updated_at: string
          website: string | null
          years_in_operation: number
          zip_code: string
        }
        Insert: {
          accepts_medicaid?: boolean
          accepts_medicare?: boolean
          additional_notes?: string | null
          annual_prescription_volume?: number | null
          automated_dispensing?: boolean
          backup_power_system?: boolean
          buying_group_membership?: string | null
          chain_affiliation?: string | null
          city: string
          compounding_services?: boolean
          created_at?: string
          dea_expiration?: string | null
          dea_registration?: string | null
          delivery_available?: boolean
          disaster_recovery_plan?: boolean
          e_prescribing_enabled?: boolean
          electronic_health_records?: boolean
          email: string
          emergency_plan?: boolean
          facility_name: string
          facility_npi?: string | null
          facility_type?: string | null
          fax?: string | null
          hipaa_compliant?: boolean
          id?: string
          immunization_services?: boolean
          inspection_results?: string | null
          last_board_inspection?: string | null
          liability_coverage_amount: string
          liability_expiration: string
          liability_insurance_carrier: string
          liability_policy_number: string
          license_expiration: string
          medication_therapy_management?: boolean
          number_of_locations: number
          organization_id?: string | null
          ownership_type?: string | null
          pharmacy_management_system?: string | null
          phone: string
          preferred_wholesaler?: string | null
          primary_address: string
          quality_assurance_program?: boolean
          quality_program_description?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          state: string
          state_pharmacy_license: string
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          tax_id?: string | null
          total_pharmacists: number
          total_support_staff: number
          total_technicians: number
          updated_at?: string
          website?: string | null
          years_in_operation: number
          zip_code: string
        }
        Update: {
          accepts_medicaid?: boolean
          accepts_medicare?: boolean
          additional_notes?: string | null
          annual_prescription_volume?: number | null
          automated_dispensing?: boolean
          backup_power_system?: boolean
          buying_group_membership?: string | null
          chain_affiliation?: string | null
          city?: string
          compounding_services?: boolean
          created_at?: string
          dea_expiration?: string | null
          dea_registration?: string | null
          delivery_available?: boolean
          disaster_recovery_plan?: boolean
          e_prescribing_enabled?: boolean
          electronic_health_records?: boolean
          email?: string
          emergency_plan?: boolean
          facility_name?: string
          facility_npi?: string | null
          facility_type?: string | null
          fax?: string | null
          hipaa_compliant?: boolean
          id?: string
          immunization_services?: boolean
          inspection_results?: string | null
          last_board_inspection?: string | null
          liability_coverage_amount?: string
          liability_expiration?: string
          liability_insurance_carrier?: string
          liability_policy_number?: string
          license_expiration?: string
          medication_therapy_management?: boolean
          number_of_locations?: number
          organization_id?: string | null
          ownership_type?: string | null
          pharmacy_management_system?: string | null
          phone?: string
          preferred_wholesaler?: string | null
          primary_address?: string
          quality_assurance_program?: boolean
          quality_program_description?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          state?: string
          state_pharmacy_license?: string
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          tax_id?: string | null
          total_pharmacists?: number
          total_support_staff?: number
          total_technicians?: number
          updated_at?: string
          website?: string | null
          years_in_operation?: number
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_questionnaires_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_questionnaires_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_questionnaires_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacist_questionnaires: {
        Row: {
          additional_notes: string | null
          application_id: string | null
          available_start_date: string | null
          city: string
          coverage_amount: string
          cpr_certified: boolean
          created_at: string
          criminal_history: boolean
          criminal_history_explanation: string | null
          current_employer: string
          date_of_birth: string | null
          dea_number: string | null
          disciplinary_action: boolean
          disciplinary_action_explanation: string | null
          email: string
          employer_address: string
          employment_start_date: string
          full_name: string
          graduation_year: number
          home_address: string
          id: string
          immunization_certified: boolean
          languages_spoken: string[] | null
          license_expiration: string
          license_number: string
          license_state: string
          malpractice_insurance_carrier: string
          npi_number: string
          pharmacy_school: string
          phone_number: string
          policy_expiration: string
          policy_number: string
          position_title: string
          preferred_work_schedule: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          ssn_last_four: string | null
          state: string
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string | null
          willing_to_travel: boolean
          years_of_experience: number
          zip_code: string
        }
        Insert: {
          additional_notes?: string | null
          application_id?: string | null
          available_start_date?: string | null
          city: string
          coverage_amount: string
          cpr_certified?: boolean
          created_at?: string
          criminal_history?: boolean
          criminal_history_explanation?: string | null
          current_employer: string
          date_of_birth?: string | null
          dea_number?: string | null
          disciplinary_action?: boolean
          disciplinary_action_explanation?: string | null
          email: string
          employer_address: string
          employment_start_date: string
          full_name: string
          graduation_year: number
          home_address: string
          id?: string
          immunization_certified?: boolean
          languages_spoken?: string[] | null
          license_expiration: string
          license_number: string
          license_state: string
          malpractice_insurance_carrier: string
          npi_number: string
          pharmacy_school: string
          phone_number: string
          policy_expiration: string
          policy_number: string
          position_title: string
          preferred_work_schedule?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          ssn_last_four?: string | null
          state: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string | null
          willing_to_travel?: boolean
          years_of_experience: number
          zip_code: string
        }
        Update: {
          additional_notes?: string | null
          application_id?: string | null
          available_start_date?: string | null
          city?: string
          coverage_amount?: string
          cpr_certified?: boolean
          created_at?: string
          criminal_history?: boolean
          criminal_history_explanation?: string | null
          current_employer?: string
          date_of_birth?: string | null
          dea_number?: string | null
          disciplinary_action?: boolean
          disciplinary_action_explanation?: string | null
          email?: string
          employer_address?: string
          employment_start_date?: string
          full_name?: string
          graduation_year?: number
          home_address?: string
          id?: string
          immunization_certified?: boolean
          languages_spoken?: string[] | null
          license_expiration?: string
          license_number?: string
          license_state?: string
          malpractice_insurance_carrier?: string
          npi_number?: string
          pharmacy_school?: string
          phone_number?: string
          policy_expiration?: string
          policy_number?: string
          position_title?: string
          preferred_work_schedule?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          ssn_last_four?: string | null
          state?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string | null
          willing_to_travel?: boolean
          years_of_experience?: number
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "pharmacist_questionnaires_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "pharmacist_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacist_questionnaires_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacist_questionnaires_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_documents: {
        Row: {
          created_at: string
          document_name: string
          document_type: string
          facility_questionnaire_id: string | null
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          pharmacist_questionnaire_id: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          document_name: string
          document_type: string
          facility_questionnaire_id?: string | null
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          pharmacist_questionnaire_id?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          document_name?: string
          document_type?: string
          facility_questionnaire_id?: string | null
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          pharmacist_questionnaire_id?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_documents_facility_questionnaire_id_fkey"
            columns: ["facility_questionnaire_id"]
            isOneToOne: false
            referencedRelation: "facility_questionnaires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionnaire_documents_pharmacist_questionnaire_id_fkey"
            columns: ["pharmacist_questionnaire_id"]
            isOneToOne: false
            referencedRelation: "pharmacist_questionnaires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionnaire_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
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
      get_notification_channels: {
        Args: { user_id_param: string; priority_param: string }
        Returns: string[]
      }
      is_user_in_quiet_hours: {
        Args: { user_id_param: string }
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
