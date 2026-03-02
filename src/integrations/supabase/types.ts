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
          protocol_completed: boolean
          red_flags_negative: boolean
          rule_set_id: string | null
          status: Database["public"]["Enums"]["claim_case_status"]
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
          protocol_completed?: boolean
          red_flags_negative?: boolean
          rule_set_id?: string | null
          status?: Database["public"]["Enums"]["claim_case_status"]
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
          protocol_completed?: boolean
          red_flags_negative?: boolean
          rule_set_id?: string | null
          status?: Database["public"]["Enums"]["claim_case_status"]
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
          code: string
          created_at: string
          funding_body: string
          gst_rate: number
          id: string
          is_active: boolean
          jurisdiction: string
          name: string
          standard_fee_ex_gst: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          funding_body: string
          gst_rate?: number
          id?: string
          is_active?: boolean
          jurisdiction?: string
          name: string
          standard_fee_ex_gst?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          funding_body?: string
          gst_rate?: number
          id?: string
          is_active?: boolean
          jurisdiction?: string
          name?: string
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
      episode_type: ["INITIAL", "RESUPPLY", "FOLLOW_UP"],
      rule_result: ["PASS", "FAIL", "WARN", "NOT_APPLICABLE"],
      rule_severity: ["HARD_FAIL", "WARN"],
    },
  },
} as const
