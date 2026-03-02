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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      claim_batch_case_links: {
        Row: {
          batch_id: string
          claim_case_id: string
          id: string
          order_index: number
        }
        Insert: {
          batch_id: string
          claim_case_id: string
          id?: string
          order_index?: number
        }
        Update: {
          batch_id?: string
          claim_case_id?: string
          id?: string
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "claim_batch_case_links_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "claim_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_batch_case_links_claim_case_id_fkey"
            columns: ["claim_case_id"]
            isOneToOne: false
            referencedRelation: "claim_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_batches: {
        Row: {
          claim_program_id: string
          created_at: string
          exported_pdf_path: string | null
          finalized_at: string | null
          generated_by: string | null
          id: string
          period_end: string
          period_start: string
          pharmacy_abn: string | null
          pharmacy_address: string | null
          pharmacy_name: string
          status: Database["public"]["Enums"]["batch_status"]
          total_amount: number
          total_amount_ex_gst: number
          total_cases: number
          total_gst: number
        }
        Insert: {
          claim_program_id: string
          created_at?: string
          exported_pdf_path?: string | null
          finalized_at?: string | null
          generated_by?: string | null
          id?: string
          period_end: string
          period_start: string
          pharmacy_abn?: string | null
          pharmacy_address?: string | null
          pharmacy_name?: string
          status?: Database["public"]["Enums"]["batch_status"]
          total_amount?: number
          total_amount_ex_gst?: number
          total_cases?: number
          total_gst?: number
        }
        Update: {
          claim_program_id?: string
          created_at?: string
          exported_pdf_path?: string | null
          finalized_at?: string | null
          generated_by?: string | null
          id?: string
          period_end?: string
          period_start?: string
          pharmacy_abn?: string | null
          pharmacy_address?: string | null
          pharmacy_name?: string
          status?: Database["public"]["Enums"]["batch_status"]
          total_amount?: number
          total_amount_ex_gst?: number
          total_cases?: number
          total_gst?: number
        }
        Relationships: [
          {
            foreignKeyName: "claim_batches_claim_program_id_fkey"
            columns: ["claim_program_id"]
            isOneToOne: false
            referencedRelation: "claim_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_case_rule_results: {
        Row: {
          claim_case_id: string
          claim_rule_id: string
          details: string | null
          evaluated_at: string
          id: string
          result: Database["public"]["Enums"]["rule_result"]
        }
        Insert: {
          claim_case_id: string
          claim_rule_id: string
          details?: string | null
          evaluated_at?: string
          id?: string
          result?: Database["public"]["Enums"]["rule_result"]
        }
        Update: {
          claim_case_id?: string
          claim_rule_id?: string
          details?: string | null
          evaluated_at?: string
          id?: string
          result?: Database["public"]["Enums"]["rule_result"]
        }
        Relationships: [
          {
            foreignKeyName: "claim_case_rule_results_claim_case_id_fkey"
            columns: ["claim_case_id"]
            isOneToOne: false
            referencedRelation: "claim_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_case_rule_results_claim_rule_id_fkey"
            columns: ["claim_rule_id"]
            isOneToOne: false
            referencedRelation: "claim_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_cases: {
        Row: {
          claim_period_end: string | null
          claim_period_start: string | null
          claim_program_id: string
          claimed_at: string | null
          condition_name: string
          consult_date: string
          created_at: string
          eligibility_score: number | null
          encounter_reference: string
          fee_ex_gst: number
          gst_amount: number
          hard_fail_count: number
          id: string
          notes: string | null
          override_justification: string | null
          patient_age: number | null
          patient_initials: string | null
          patient_sex: string | null
          ppa_claim_id: string | null
          ppa_response: Json | null
          ppa_submitted_at: string | null
          protocol_completed: boolean
          red_flags_negative: boolean
          rule_set_id: string | null
          status: Database["public"]["Enums"]["claim_case_status"]
          submission_confirmed_by: string | null
          total_amount: number
          updated_at: string
          warn_count: number
          within_age_range: boolean
          within_onset_window: boolean | null
        }
        Insert: {
          claim_period_end?: string | null
          claim_period_start?: string | null
          claim_program_id: string
          claimed_at?: string | null
          condition_name: string
          consult_date?: string
          created_at?: string
          eligibility_score?: number | null
          encounter_reference: string
          fee_ex_gst?: number
          gst_amount?: number
          hard_fail_count?: number
          id?: string
          notes?: string | null
          override_justification?: string | null
          patient_age?: number | null
          patient_initials?: string | null
          patient_sex?: string | null
          ppa_claim_id?: string | null
          ppa_response?: Json | null
          ppa_submitted_at?: string | null
          protocol_completed?: boolean
          red_flags_negative?: boolean
          rule_set_id?: string | null
          status?: Database["public"]["Enums"]["claim_case_status"]
          submission_confirmed_by?: string | null
          total_amount?: number
          updated_at?: string
          warn_count?: number
          within_age_range?: boolean
          within_onset_window?: boolean | null
        }
        Update: {
          claim_period_end?: string | null
          claim_period_start?: string | null
          claim_program_id?: string
          claimed_at?: string | null
          condition_name?: string
          consult_date?: string
          created_at?: string
          eligibility_score?: number | null
          encounter_reference?: string
          fee_ex_gst?: number
          gst_amount?: number
          hard_fail_count?: number
          id?: string
          notes?: string | null
          override_justification?: string | null
          patient_age?: number | null
          patient_initials?: string | null
          patient_sex?: string | null
          ppa_claim_id?: string | null
          ppa_response?: Json | null
          ppa_submitted_at?: string | null
          protocol_completed?: boolean
          red_flags_negative?: boolean
          rule_set_id?: string | null
          status?: Database["public"]["Enums"]["claim_case_status"]
          submission_confirmed_by?: string | null
          total_amount?: number
          updated_at?: string
          warn_count?: number
          within_age_range?: boolean
          within_onset_window?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "claim_cases_claim_program_id_fkey"
            columns: ["claim_program_id"]
            isOneToOne: false
            referencedRelation: "claim_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_cases_rule_set_id_fkey"
            columns: ["rule_set_id"]
            isOneToOne: false
            referencedRelation: "claim_rule_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_programs: {
        Row: {
          category: string | null
          code: string
          created_at: string
          funding_body: string
          gst_rate: number
          id: string
          is_active: boolean
          is_api_supported: boolean
          jurisdiction: string
          name: string
          ppa_program_code: string | null
          program_rules_url: string | null
          standard_fee_ex_gst: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string
          funding_body: string
          gst_rate?: number
          id?: string
          is_active?: boolean
          is_api_supported?: boolean
          jurisdiction?: string
          name: string
          ppa_program_code?: string | null
          program_rules_url?: string | null
          standard_fee_ex_gst?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string
          funding_body?: string
          gst_rate?: number
          id?: string
          is_active?: boolean
          is_api_supported?: boolean
          jurisdiction?: string
          name?: string
          ppa_program_code?: string | null
          program_rules_url?: string | null
          standard_fee_ex_gst?: number
          updated_at?: string
        }
        Relationships: []
      }
      claim_rule_sets: {
        Row: {
          claim_program_id: string
          created_at: string
          effective_from: string
          effective_to: string | null
          id: string
          is_active: boolean
          name: string
          version: number
        }
        Insert: {
          claim_program_id: string
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean
          name: string
          version?: number
        }
        Update: {
          claim_program_id?: string
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean
          name?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "claim_rule_sets_claim_program_id_fkey"
            columns: ["claim_program_id"]
            isOneToOne: false
            referencedRelation: "claim_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_rules: {
        Row: {
          code: string
          created_at: string
          description: string
          expression: Json
          id: string
          order_index: number
          rule_set_id: string
          severity: Database["public"]["Enums"]["rule_severity"]
        }
        Insert: {
          code: string
          created_at?: string
          description: string
          expression?: Json
          id?: string
          order_index?: number
          rule_set_id: string
          severity?: Database["public"]["Enums"]["rule_severity"]
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          expression?: Json
          id?: string
          order_index?: number
          rule_set_id?: string
          severity?: Database["public"]["Enums"]["rule_severity"]
        }
        Relationships: [
          {
            foreignKeyName: "claim_rules_rule_set_id_fkey"
            columns: ["rule_set_id"]
            isOneToOne: false
            referencedRelation: "claim_rule_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      condition_claim_programs: {
        Row: {
          claim_program_id: string
          condition_code: string
          condition_name: string
          created_at: string
          episode_type: Database["public"]["Enums"]["episode_type"]
          id: string
          is_default_mapping: boolean
        }
        Insert: {
          claim_program_id: string
          condition_code: string
          condition_name: string
          created_at?: string
          episode_type?: Database["public"]["Enums"]["episode_type"]
          id?: string
          is_default_mapping?: boolean
        }
        Update: {
          claim_program_id?: string
          condition_code?: string
          condition_name?: string
          created_at?: string
          episode_type?: Database["public"]["Enums"]["episode_type"]
          id?: string
          is_default_mapping?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "condition_claim_programs_claim_program_id_fkey"
            columns: ["claim_program_id"]
            isOneToOne: false
            referencedRelation: "claim_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      eight_cpa_action_plan_items: {
        Row: {
          created_at: string
          follow_up_date: string | null
          follow_up_required: boolean | null
          goal_text: string | null
          id: string
          issue_description: string
          order_index: number | null
          outcome: string | null
          responsible_party:
            | Database["public"]["Enums"]["eight_cpa_responsible_party"]
            | null
          service_id: string
        }
        Insert: {
          created_at?: string
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          goal_text?: string | null
          id?: string
          issue_description: string
          order_index?: number | null
          outcome?: string | null
          responsible_party?:
            | Database["public"]["Enums"]["eight_cpa_responsible_party"]
            | null
          service_id: string
        }
        Update: {
          created_at?: string
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          goal_text?: string | null
          id?: string
          issue_description?: string
          order_index?: number | null
          outcome?: string | null
          responsible_party?:
            | Database["public"]["Enums"]["eight_cpa_responsible_party"]
            | null
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "eight_cpa_action_plan_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "eight_cpa_services"
            referencedColumns: ["id"]
          },
        ]
      }
      eight_cpa_attachments: {
        Row: {
          category:
            | Database["public"]["Enums"]["eight_cpa_attachment_category"]
            | null
          file_name: string
          file_type:
            | Database["public"]["Enums"]["eight_cpa_attachment_type"]
            | null
          filesize: number | null
          id: string
          is_deleted: boolean | null
          notes: string | null
          service_id: string
          storage_path: string
          uploaded_at: string
          uploaded_by_user_id: string | null
        }
        Insert: {
          category?:
            | Database["public"]["Enums"]["eight_cpa_attachment_category"]
            | null
          file_name: string
          file_type?:
            | Database["public"]["Enums"]["eight_cpa_attachment_type"]
            | null
          filesize?: number | null
          id?: string
          is_deleted?: boolean | null
          notes?: string | null
          service_id: string
          storage_path: string
          uploaded_at?: string
          uploaded_by_user_id?: string | null
        }
        Update: {
          category?:
            | Database["public"]["Enums"]["eight_cpa_attachment_category"]
            | null
          file_name?: string
          file_type?:
            | Database["public"]["Enums"]["eight_cpa_attachment_type"]
            | null
          filesize?: number | null
          id?: string
          is_deleted?: boolean | null
          notes?: string | null
          service_id?: string
          storage_path?: string
          uploaded_at?: string
          uploaded_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eight_cpa_attachments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "eight_cpa_services"
            referencedColumns: ["id"]
          },
        ]
      }
      eight_cpa_claim_tracking: {
        Row: {
          created_at: string
          fee_amount: number | null
          id: string
          notes: string | null
          ppa_claim_required: boolean | null
          ppa_claim_status:
            | Database["public"]["Enums"]["eight_cpa_claim_status"]
            | null
          ppa_rejection_reason: string | null
          ppa_submission_date: string | null
          service_id: string
        }
        Insert: {
          created_at?: string
          fee_amount?: number | null
          id?: string
          notes?: string | null
          ppa_claim_required?: boolean | null
          ppa_claim_status?:
            | Database["public"]["Enums"]["eight_cpa_claim_status"]
            | null
          ppa_rejection_reason?: string | null
          ppa_submission_date?: string | null
          service_id: string
        }
        Update: {
          created_at?: string
          fee_amount?: number | null
          id?: string
          notes?: string | null
          ppa_claim_required?: boolean | null
          ppa_claim_status?:
            | Database["public"]["Enums"]["eight_cpa_claim_status"]
            | null
          ppa_rejection_reason?: string | null
          ppa_submission_date?: string | null
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "eight_cpa_claim_tracking_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: true
            referencedRelation: "eight_cpa_services"
            referencedColumns: ["id"]
          },
        ]
      }
      eight_cpa_clinical_data: {
        Row: {
          allergies_adverse_reactions: Json | null
          clinical_bmi: number | null
          clinical_bp_date: string | null
          clinical_bp_diastolic: number | null
          clinical_bp_systolic: number | null
          clinical_height: number | null
          clinical_pulse: number | null
          clinical_weight: number | null
          conditions_comorbidities: Json | null
          created_at: string
          diabetes_bgl_readings_summary: string | null
          diabetes_hba1c_date: string | null
          diabetes_hba1c_value: number | null
          id: string
          lifestyle_activity_notes: string | null
          lifestyle_alcohol_use:
            | Database["public"]["Enums"]["eight_cpa_alcohol_use"]
            | null
          lifestyle_diet_notes: string | null
          lifestyle_smoking_status:
            | Database["public"]["Enums"]["eight_cpa_smoking_status"]
            | null
          monitoring_device_used: string | null
          service_id: string
          underlying_medical_conditions: Json | null
        }
        Insert: {
          allergies_adverse_reactions?: Json | null
          clinical_bmi?: number | null
          clinical_bp_date?: string | null
          clinical_bp_diastolic?: number | null
          clinical_bp_systolic?: number | null
          clinical_height?: number | null
          clinical_pulse?: number | null
          clinical_weight?: number | null
          conditions_comorbidities?: Json | null
          created_at?: string
          diabetes_bgl_readings_summary?: string | null
          diabetes_hba1c_date?: string | null
          diabetes_hba1c_value?: number | null
          id?: string
          lifestyle_activity_notes?: string | null
          lifestyle_alcohol_use?:
            | Database["public"]["Enums"]["eight_cpa_alcohol_use"]
            | null
          lifestyle_diet_notes?: string | null
          lifestyle_smoking_status?:
            | Database["public"]["Enums"]["eight_cpa_smoking_status"]
            | null
          monitoring_device_used?: string | null
          service_id: string
          underlying_medical_conditions?: Json | null
        }
        Update: {
          allergies_adverse_reactions?: Json | null
          clinical_bmi?: number | null
          clinical_bp_date?: string | null
          clinical_bp_diastolic?: number | null
          clinical_bp_systolic?: number | null
          clinical_height?: number | null
          clinical_pulse?: number | null
          clinical_weight?: number | null
          conditions_comorbidities?: Json | null
          created_at?: string
          diabetes_bgl_readings_summary?: string | null
          diabetes_hba1c_date?: string | null
          diabetes_hba1c_value?: number | null
          id?: string
          lifestyle_activity_notes?: string | null
          lifestyle_alcohol_use?:
            | Database["public"]["Enums"]["eight_cpa_alcohol_use"]
            | null
          lifestyle_diet_notes?: string | null
          lifestyle_smoking_status?:
            | Database["public"]["Enums"]["eight_cpa_smoking_status"]
            | null
          monitoring_device_used?: string | null
          service_id?: string
          underlying_medical_conditions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "eight_cpa_clinical_data_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: true
            referencedRelation: "eight_cpa_services"
            referencedColumns: ["id"]
          },
        ]
      }
      eight_cpa_communication_logs: {
        Row: {
          communication_date: string
          created_at: string
          documents_shared: string | null
          id: string
          method:
            | Database["public"]["Enums"]["eight_cpa_communication_method"]
            | null
          service_id: string
          summary: string | null
          to_role: string | null
          to_whom: string
        }
        Insert: {
          communication_date?: string
          created_at?: string
          documents_shared?: string | null
          id?: string
          method?:
            | Database["public"]["Enums"]["eight_cpa_communication_method"]
            | null
          service_id: string
          summary?: string | null
          to_role?: string | null
          to_whom: string
        }
        Update: {
          communication_date?: string
          created_at?: string
          documents_shared?: string | null
          id?: string
          method?:
            | Database["public"]["Enums"]["eight_cpa_communication_method"]
            | null
          service_id?: string
          summary?: string | null
          to_role?: string | null
          to_whom?: string
        }
        Relationships: [
          {
            foreignKeyName: "eight_cpa_communication_logs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "eight_cpa_services"
            referencedColumns: ["id"]
          },
        ]
      }
      eight_cpa_consent: {
        Row: {
          consent_comments: string | null
          consent_date: string | null
          consent_signed_by:
            | Database["public"]["Enums"]["eight_cpa_consent_signer"]
            | null
          created_at: string
          has_consent_pdf_attached: boolean | null
          id: string
          service_id: string
          written_consent_obtained: boolean | null
        }
        Insert: {
          consent_comments?: string | null
          consent_date?: string | null
          consent_signed_by?:
            | Database["public"]["Enums"]["eight_cpa_consent_signer"]
            | null
          created_at?: string
          has_consent_pdf_attached?: boolean | null
          id?: string
          service_id: string
          written_consent_obtained?: boolean | null
        }
        Update: {
          consent_comments?: string | null
          consent_date?: string | null
          consent_signed_by?:
            | Database["public"]["Enums"]["eight_cpa_consent_signer"]
            | null
          created_at?: string
          has_consent_pdf_attached?: boolean | null
          id?: string
          service_id?: string
          written_consent_obtained?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "eight_cpa_consent_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: true
            referencedRelation: "eight_cpa_services"
            referencedColumns: ["id"]
          },
        ]
      }
      eight_cpa_eligibility: {
        Row: {
          barriers_to_timely_access_diabetes_services: Json | null
          created_at: string
          has_received_medscheck_hmr_rmmr_last_12m: boolean | null
          high_risk_medicine_details: string | null
          high_risk_medicine_use: boolean | null
          id: string
          is_living_in_community_setting: boolean | null
          is_medicare_or_dva_eligible: boolean | null
          notes_on_residential_status: string | null
          pharmacist_declares_eligibility_met: boolean | null
          pharmacist_eligibility_notes: string | null
          poorly_controlled_type2: boolean | null
          program_eligibility_summary: string | null
          recent_significant_medical_event: boolean | null
          recent_significant_medical_event_details: string | null
          recent_type2_diagnosis_last_12m: boolean | null
          service_id: string
          taking_5_or_more_prescription_medicines: boolean | null
        }
        Insert: {
          barriers_to_timely_access_diabetes_services?: Json | null
          created_at?: string
          has_received_medscheck_hmr_rmmr_last_12m?: boolean | null
          high_risk_medicine_details?: string | null
          high_risk_medicine_use?: boolean | null
          id?: string
          is_living_in_community_setting?: boolean | null
          is_medicare_or_dva_eligible?: boolean | null
          notes_on_residential_status?: string | null
          pharmacist_declares_eligibility_met?: boolean | null
          pharmacist_eligibility_notes?: string | null
          poorly_controlled_type2?: boolean | null
          program_eligibility_summary?: string | null
          recent_significant_medical_event?: boolean | null
          recent_significant_medical_event_details?: string | null
          recent_type2_diagnosis_last_12m?: boolean | null
          service_id: string
          taking_5_or_more_prescription_medicines?: boolean | null
        }
        Update: {
          barriers_to_timely_access_diabetes_services?: Json | null
          created_at?: string
          has_received_medscheck_hmr_rmmr_last_12m?: boolean | null
          high_risk_medicine_details?: string | null
          high_risk_medicine_use?: boolean | null
          id?: string
          is_living_in_community_setting?: boolean | null
          is_medicare_or_dva_eligible?: boolean | null
          notes_on_residential_status?: string | null
          pharmacist_declares_eligibility_met?: boolean | null
          pharmacist_eligibility_notes?: string | null
          poorly_controlled_type2?: boolean | null
          program_eligibility_summary?: string | null
          recent_significant_medical_event?: boolean | null
          recent_significant_medical_event_details?: string | null
          recent_type2_diagnosis_last_12m?: boolean | null
          service_id?: string
          taking_5_or_more_prescription_medicines?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "eight_cpa_eligibility_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: true
            referencedRelation: "eight_cpa_services"
            referencedColumns: ["id"]
          },
        ]
      }
      eight_cpa_follow_ups: {
        Row: {
          created_at: string
          follow_up_date: string | null
          follow_up_notes: string | null
          follow_up_status:
            | Database["public"]["Enums"]["eight_cpa_follow_up_status"]
            | null
          id: string
          service_id: string
        }
        Insert: {
          created_at?: string
          follow_up_date?: string | null
          follow_up_notes?: string | null
          follow_up_status?:
            | Database["public"]["Enums"]["eight_cpa_follow_up_status"]
            | null
          id?: string
          service_id: string
        }
        Update: {
          created_at?: string
          follow_up_date?: string | null
          follow_up_notes?: string | null
          follow_up_status?:
            | Database["public"]["Enums"]["eight_cpa_follow_up_status"]
            | null
          id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "eight_cpa_follow_ups_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "eight_cpa_services"
            referencedColumns: ["id"]
          },
        ]
      }
      eight_cpa_medication_items: {
        Row: {
          brand_name: string | null
          created_at: string
          dose_and_regimen: string | null
          form: string | null
          generic_name: string | null
          id: string
          indication: string | null
          is_complementary: boolean | null
          is_non_prescription: boolean | null
          is_prescription: boolean | null
          order_index: number | null
          prescriber_name: string | null
          service_id: string
          special_instructions: string | null
          start_date: string | null
          strength: string | null
        }
        Insert: {
          brand_name?: string | null
          created_at?: string
          dose_and_regimen?: string | null
          form?: string | null
          generic_name?: string | null
          id?: string
          indication?: string | null
          is_complementary?: boolean | null
          is_non_prescription?: boolean | null
          is_prescription?: boolean | null
          order_index?: number | null
          prescriber_name?: string | null
          service_id: string
          special_instructions?: string | null
          start_date?: string | null
          strength?: string | null
        }
        Update: {
          brand_name?: string | null
          created_at?: string
          dose_and_regimen?: string | null
          form?: string | null
          generic_name?: string | null
          id?: string
          indication?: string | null
          is_complementary?: boolean | null
          is_non_prescription?: boolean | null
          is_prescription?: boolean | null
          order_index?: number | null
          prescriber_name?: string | null
          service_id?: string
          special_instructions?: string | null
          start_date?: string | null
          strength?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eight_cpa_medication_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "eight_cpa_services"
            referencedColumns: ["id"]
          },
        ]
      }
      eight_cpa_patient_snapshots: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          carer_details: string | null
          created_at: string
          date_of_birth: string | null
          dva_number: string | null
          email: string | null
          full_name: string
          gender: string | null
          has_carer: boolean | null
          id: string
          is_atsi: boolean | null
          medicare_number: string | null
          medicare_reference_number: string | null
          my_health_record_available: boolean | null
          phone: string | null
          postcode: string | null
          primary_language: string | null
          residential_status:
            | Database["public"]["Enums"]["eight_cpa_residential_status"]
            | null
          service_id: string
          state: string | null
          suburb: string | null
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          carer_details?: string | null
          created_at?: string
          date_of_birth?: string | null
          dva_number?: string | null
          email?: string | null
          full_name: string
          gender?: string | null
          has_carer?: boolean | null
          id?: string
          is_atsi?: boolean | null
          medicare_number?: string | null
          medicare_reference_number?: string | null
          my_health_record_available?: boolean | null
          phone?: string | null
          postcode?: string | null
          primary_language?: string | null
          residential_status?:
            | Database["public"]["Enums"]["eight_cpa_residential_status"]
            | null
          service_id: string
          state?: string | null
          suburb?: string | null
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          carer_details?: string | null
          created_at?: string
          date_of_birth?: string | null
          dva_number?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          has_carer?: boolean | null
          id?: string
          is_atsi?: boolean | null
          medicare_number?: string | null
          medicare_reference_number?: string | null
          my_health_record_available?: boolean | null
          phone?: string | null
          postcode?: string | null
          primary_language?: string | null
          residential_status?:
            | Database["public"]["Enums"]["eight_cpa_residential_status"]
            | null
          service_id?: string
          state?: string | null
          suburb?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eight_cpa_patient_snapshots_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "eight_cpa_services"
            referencedColumns: ["id"]
          },
        ]
      }
      eight_cpa_pharmacist_snapshots: {
        Row: {
          ahpra_registration_number: string | null
          created_at: string
          id: string
          is_responsible_pharmacist_for_service: boolean | null
          pharmacist_name: string
          role: Database["public"]["Enums"]["eight_cpa_pharmacist_role"] | null
          service_id: string
        }
        Insert: {
          ahpra_registration_number?: string | null
          created_at?: string
          id?: string
          is_responsible_pharmacist_for_service?: boolean | null
          pharmacist_name: string
          role?: Database["public"]["Enums"]["eight_cpa_pharmacist_role"] | null
          service_id: string
        }
        Update: {
          ahpra_registration_number?: string | null
          created_at?: string
          id?: string
          is_responsible_pharmacist_for_service?: boolean | null
          pharmacist_name?: string
          role?: Database["public"]["Enums"]["eight_cpa_pharmacist_role"] | null
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "eight_cpa_pharmacist_snapshots_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "eight_cpa_services"
            referencedColumns: ["id"]
          },
        ]
      }
      eight_cpa_prescribers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_primary: boolean | null
          phone: string | null
          practice_address: string | null
          practice_name: string | null
          prescriber_name: string
          prescriber_type:
            | Database["public"]["Enums"]["eight_cpa_prescriber_type"]
            | null
          provider_number: string | null
          service_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
          phone?: string | null
          practice_address?: string | null
          practice_name?: string | null
          prescriber_name: string
          prescriber_type?:
            | Database["public"]["Enums"]["eight_cpa_prescriber_type"]
            | null
          provider_number?: string | null
          service_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
          phone?: string | null
          practice_address?: string | null
          practice_name?: string | null
          prescriber_name?: string
          prescriber_type?:
            | Database["public"]["Enums"]["eight_cpa_prescriber_type"]
            | null
          provider_number?: string | null
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "eight_cpa_prescribers_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "eight_cpa_services"
            referencedColumns: ["id"]
          },
        ]
      }
      eight_cpa_services: {
        Row: {
          created_at: string
          id: string
          pharmacy_accreditation_id: string | null
          pharmacy_name: string
          section_90_number: string | null
          service_date: string
          service_time: string
          service_type: Database["public"]["Enums"]["eight_cpa_service_type"]
          status: Database["public"]["Enums"]["eight_cpa_service_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          pharmacy_accreditation_id?: string | null
          pharmacy_name?: string
          section_90_number?: string | null
          service_date?: string
          service_time?: string
          service_type: Database["public"]["Enums"]["eight_cpa_service_type"]
          status?: Database["public"]["Enums"]["eight_cpa_service_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          pharmacy_accreditation_id?: string | null
          pharmacy_name?: string
          section_90_number?: string | null
          service_date?: string
          service_time?: string
          service_type?: Database["public"]["Enums"]["eight_cpa_service_type"]
          status?: Database["public"]["Enums"]["eight_cpa_service_status"]
          updated_at?: string
        }
        Relationships: []
      }
      integration_audit_log: {
        Row: {
          claim_case_id: string | null
          created_at: string
          error_message: string | null
          event_source: string
          event_type: string
          id: string
          program_code: string | null
          request_summary: string | null
          response_status: number | null
          response_summary: string | null
          user_id: string | null
        }
        Insert: {
          claim_case_id?: string | null
          created_at?: string
          error_message?: string | null
          event_source?: string
          event_type: string
          id?: string
          program_code?: string | null
          request_summary?: string | null
          response_status?: number | null
          response_summary?: string | null
          user_id?: string | null
        }
        Update: {
          claim_case_id?: string | null
          created_at?: string
          error_message?: string | null
          event_source?: string
          event_type?: string
          id?: string
          program_code?: string | null
          request_summary?: string | null
          response_status?: number | null
          response_summary?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ppa_integration_settings: {
        Row: {
          created_at: string
          environment: string
          id: string
          is_connected: boolean
          last_connection_status: string | null
          last_connection_test_at: string | null
          pharmacy_name: string
          ppa_service_provider_id: string | null
          ppa_user_id: string | null
          registered_programs: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          environment?: string
          id?: string
          is_connected?: boolean
          last_connection_status?: string | null
          last_connection_test_at?: string | null
          pharmacy_name?: string
          ppa_service_provider_id?: string | null
          ppa_user_id?: string | null
          registered_programs?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          environment?: string
          id?: string
          is_connected?: boolean
          last_connection_status?: string | null
          last_connection_test_at?: string | null
          pharmacy_name?: string
          ppa_service_provider_id?: string | null
          ppa_user_id?: string | null
          registered_programs?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      waitlist_entries: {
        Row: {
          created_at: string
          email: string
          id: string
          pharmacy_name: string | null
          role: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          pharmacy_name?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          pharmacy_name?: string | null
          role?: string | null
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
      batch_status: "DRAFT" | "FINALIZED" | "EXPORTED"
      claim_case_status:
        | "NOT_ELIGIBLE"
        | "ELIGIBLE_PENDING_REVIEW"
        | "READY_FOR_CLAIM"
        | "CLAIMED"
        | "REJECTED"
      eight_cpa_alcohol_use: "NONE" | "LOW" | "MODERATE" | "HIGH" | "UNKNOWN"
      eight_cpa_attachment_category:
        | "CONSENT_FORM"
        | "GP_REPORT"
        | "PATIENT_REPORT"
        | "HANDWRITTEN_NOTES"
        | "OTHER"
      eight_cpa_attachment_type: "PDF" | "JPG" | "PNG" | "OTHER"
      eight_cpa_claim_status:
        | "NOT_SUBMITTED"
        | "SUBMITTED"
        | "ACCEPTED"
        | "REJECTED"
        | "MANUAL_ONLY"
      eight_cpa_communication_method:
        | "PHONE"
        | "FAX"
        | "EMAIL"
        | "SECURE_MESSAGING"
        | "LETTER"
        | "MYHR_UPLOAD"
        | "OTHER"
      eight_cpa_consent_signer: "PATIENT" | "CARER"
      eight_cpa_follow_up_status: "NOT_DUE" | "DUE" | "COMPLETED" | "MISSED"
      eight_cpa_pharmacist_role:
        | "REGISTERED_PHARMACIST"
        | "INTERN_UNDER_SUPERVISION"
      eight_cpa_prescriber_type: "USUAL" | "OTHER"
      eight_cpa_residential_status: "LIVING_AT_HOME" | "AGED_CARE" | "OTHER"
      eight_cpa_responsible_party:
        | "PATIENT"
        | "PHARMACIST"
        | "GP"
        | "SPECIALIST"
        | "OTHER"
      eight_cpa_service_status:
        | "DRAFT"
        | "COMPLETED"
        | "INELIGIBLE"
        | "CANCELLED"
      eight_cpa_service_type: "MEDSCHECK" | "DIABETES_MEDSCHECK"
      eight_cpa_smoking_status: "NEVER" | "FORMER" | "CURRENT" | "UNKNOWN"
      episode_type: "INITIAL" | "RESUPPLY" | "FOLLOW_UP"
      rule_result: "PASS" | "FAIL" | "WARN" | "NOT_APPLICABLE"
      rule_severity: "HARD_FAIL" | "WARN"
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
      batch_status: ["DRAFT", "FINALIZED", "EXPORTED"],
      claim_case_status: [
        "NOT_ELIGIBLE",
        "ELIGIBLE_PENDING_REVIEW",
        "READY_FOR_CLAIM",
        "CLAIMED",
        "REJECTED",
      ],
      eight_cpa_alcohol_use: ["NONE", "LOW", "MODERATE", "HIGH", "UNKNOWN"],
      eight_cpa_attachment_category: [
        "CONSENT_FORM",
        "GP_REPORT",
        "PATIENT_REPORT",
        "HANDWRITTEN_NOTES",
        "OTHER",
      ],
      eight_cpa_attachment_type: ["PDF", "JPG", "PNG", "OTHER"],
      eight_cpa_claim_status: [
        "NOT_SUBMITTED",
        "SUBMITTED",
        "ACCEPTED",
        "REJECTED",
        "MANUAL_ONLY",
      ],
      eight_cpa_communication_method: [
        "PHONE",
        "FAX",
        "EMAIL",
        "SECURE_MESSAGING",
        "LETTER",
        "MYHR_UPLOAD",
        "OTHER",
      ],
      eight_cpa_consent_signer: ["PATIENT", "CARER"],
      eight_cpa_follow_up_status: ["NOT_DUE", "DUE", "COMPLETED", "MISSED"],
      eight_cpa_pharmacist_role: [
        "REGISTERED_PHARMACIST",
        "INTERN_UNDER_SUPERVISION",
      ],
      eight_cpa_prescriber_type: ["USUAL", "OTHER"],
      eight_cpa_residential_status: ["LIVING_AT_HOME", "AGED_CARE", "OTHER"],
      eight_cpa_responsible_party: [
        "PATIENT",
        "PHARMACIST",
        "GP",
        "SPECIALIST",
        "OTHER",
      ],
      eight_cpa_service_status: [
        "DRAFT",
        "COMPLETED",
        "INELIGIBLE",
        "CANCELLED",
      ],
      eight_cpa_service_type: ["MEDSCHECK", "DIABETES_MEDSCHECK"],
      eight_cpa_smoking_status: ["NEVER", "FORMER", "CURRENT", "UNKNOWN"],
      episode_type: ["INITIAL", "RESUPPLY", "FOLLOW_UP"],
      rule_result: ["PASS", "FAIL", "WARN", "NOT_APPLICABLE"],
      rule_severity: ["HARD_FAIL", "WARN"],
    },
  },
} as const
