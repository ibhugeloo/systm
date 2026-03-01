/**
 * Complete TypeScript types for all Supabase tables
 */

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'team_member' | 'client';
  avatar_url: string | null;
  password_hash: string | null;
  settings: Record<string, unknown> | null;
  created_at: string;
}

export type Client = {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  sector: string;
  problem_description: string;
  tech_stack: string[];
  budget_range: string;
  timeline: string;
  status: 'onboarding' | 'mvp_generated' | 'demo_scheduled' | 'demo_done' | 'handoff_sent' | 'in_production' | 'closed';
  assigned_to: string;
  onboarding_data: Record<string, unknown> | null;
  created_at: string;
}

export type Mvp = {
  id: string;
  client_id: string;
  version: number;
  canvas_data: Record<string, unknown> | null;
  generated_prompt: string | null;
  figma_url: string | null;
  status: 'draft' | 'presenting' | 'finalized';
  created_at: string;
  updated_at: string;
}

export type ConversationMessage = {
  id: string;
  sender_id: string;
  sender_role: 'admin' | 'team_member' | 'client' | 'ai';
  content: string;
  timestamp: string;
}

export type Conversation = {
  id: string;
  client_id: string;
  messages: Json;
  context_summary: string | null;
  demo_session_id: string | null;
  created_at: string;
}

export type Handoff = {
  id: string;
  client_id: string;
  mvp_id: string;
  markdown_content: string;
  sent_to: string[];
  sent_at: string | null;
  status: 'draft' | 'sent' | 'acknowledged';
}

export type ClientRequest = {
  id: string;
  client_id: string;
  type: 'feature' | 'bug' | 'meeting' | 'question';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_review' | 'done' | 'rejected';
  created_at: string;
}

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
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'> & { created_at?: string }
        Update: Partial<Profile>
        Relationships: []
      }
      clients: {
        Row: Client
        Insert: Omit<Client, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Client>
        Relationships: [
          {
            foreignKeyName: 'clients_assigned_to_fkey'
            columns: ['assigned_to']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      mvps: {
        Row: Mvp
        Insert: Omit<Mvp, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Mvp>
        Relationships: [
          {
            foreignKeyName: 'mvps_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          }
        ]
      }
      conversations: {
        Row: Conversation
        Insert: Omit<Conversation, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Conversation>
        Relationships: [
          {
            foreignKeyName: 'conversations_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          }
        ]
      }
      handoffs: {
        Row: Handoff
        Insert: Omit<Handoff, 'id'> & { id?: string }
        Update: Partial<Handoff>
        Relationships: [
          {
            foreignKeyName: 'handoffs_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'handoffs_mvp_id_fkey'
            columns: ['mvp_id']
            isOneToOne: false
            referencedRelation: 'mvps'
            referencedColumns: ['id']
          }
        ]
      }
      client_requests: {
        Row: ClientRequest
        Insert: Omit<ClientRequest, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<ClientRequest>
        Relationships: [
          {
            foreignKeyName: 'client_requests_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          }
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
      client_status: Client['status']
      mvp_status: Mvp['status']
      request_type: ClientRequest['type']
      request_priority: ClientRequest['priority']
      request_status: ClientRequest['status']
      user_role: Profile['role']
      handoff_status: Handoff['status']
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
