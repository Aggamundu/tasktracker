export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      todos: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      post_it_notes: {
        Row: {
          id: string;
          sprint_id: string;
          row_index: number;
          column_key: string;
          position: number;
          title: string;
          description: string;
          variant: string;
          appearance: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sprint_id: string;
          row_index: number;
          column_key: string;
          position: number;
          title?: string;
          description?: string;
          variant: string;
          appearance?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sprint_id?: string;
          row_index?: number;
          column_key?: string;
          position?: number;
          title?: string;
          description?: string;
          variant?: string;
          appearance?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      post_it_note_insert: {
        Args: {
          p_sprint_id: string;
          p_row_index: number;
          p_column_key: string;
          p_position: number;
          p_title: string;
          p_description: string;
          p_variant: string;
          p_appearance?: string | null;
        };
        Returns: string;
      };
      post_it_note_delete: {
        Args: {
          p_id: string;
        };
        Returns: undefined;
      };
      post_it_note_move: {
        Args: {
          p_id: string;
          p_row_index: number;
          p_column_key: string;
          p_position: number;
        };
        Returns: undefined;
      };
      post_it_sprint_row_delete: {
        Args: {
          p_sprint_id: string;
          p_row_index: number;
        };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
