export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type GenericRow = { id: string; created_at?: string | null; updated_at?: string | null; [key: string]: Json | string | number | boolean | null | undefined };

type GenericTable = {
  Row: GenericRow;
  Insert: Partial<GenericRow> & { id?: string };
  Update: Partial<GenericRow>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      // TODO(schema): Replace generic table contracts with exact SQL-derived definitions.
      plants: GenericTable;
      remedies: GenericTable;
      cards: GenericTable;
      collections: GenericTable;
      journal: GenericTable;
      community: GenericTable;
      marketplace: GenericTable;
      ai_runs: GenericTable;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
