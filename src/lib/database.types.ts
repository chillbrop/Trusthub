export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string
          repository_url: string
          owner_id: string
          status: string
          risk_level: string
          last_scan_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          repository_url?: string
          owner_id: string
          status?: string
          risk_level?: string
          last_scan_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          repository_url?: string
          owner_id?: string
          status?: string
          risk_level?: string
          last_scan_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      scanners: {
        Row: {
          id: string
          name: string
          type: string
          vendor: string
          api_url: string
          api_key: string
          status: string
          owner_id: string
          last_connected_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          vendor: string
          api_url?: string
          api_key?: string
          status?: string
          owner_id: string
          last_connected_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          vendor?: string
          api_url?: string
          api_key?: string
          status?: string
          owner_id?: string
          last_connected_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      scans: {
        Row: {
          id: string
          project_id: string
          scanner_id: string
          scan_type: string
          status: string
          started_at: string
          completed_at: string | null
          duration: number
          findings_count: number
          critical_count: number
          high_count: number
          medium_count: number
          low_count: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          scanner_id: string
          scan_type: string
          status?: string
          started_at?: string
          completed_at?: string | null
          duration?: number
          findings_count?: number
          critical_count?: number
          high_count?: number
          medium_count?: number
          low_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          scanner_id?: string
          scan_type?: string
          status?: string
          started_at?: string
          completed_at?: string | null
          duration?: number
          findings_count?: number
          critical_count?: number
          high_count?: number
          medium_count?: number
          low_count?: number
          created_at?: string
        }
      }
      vulnerabilities: {
        Row: {
          id: string
          scan_id: string
          project_id: string
          title: string
          description: string
          severity: string
          cve_id: string
          cwe_id: string
          file_path: string
          line_number: number | null
          status: string
          resolution_notes: string
          resolved_at: string | null
          resolved_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          scan_id: string
          project_id: string
          title: string
          description?: string
          severity: string
          cve_id?: string
          cwe_id?: string
          file_path?: string
          line_number?: number | null
          status?: string
          resolution_notes?: string
          resolved_at?: string | null
          resolved_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          scan_id?: string
          project_id?: string
          title?: string
          description?: string
          severity?: string
          cve_id?: string
          cwe_id?: string
          file_path?: string
          line_number?: number | null
          status?: string
          resolution_notes?: string
          resolved_at?: string | null
          resolved_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
