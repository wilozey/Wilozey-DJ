// TODO(schema): After adding real tables in database.types.ts, these helpers become fully typed.
import { supabase } from './client';
import type { Database } from './database.types';

type PublicSchema = Database['public'];
export type TableName = keyof PublicSchema['Tables'];
export type Row<T extends TableName> = PublicSchema['Tables'][T] extends { Row: infer R } ? R : never;
export type InsertDto<T extends TableName> = PublicSchema['Tables'][T] extends { Insert: infer I } ? I : never;
export type UpdateDto<T extends TableName> = PublicSchema['Tables'][T] extends { Update: infer U } ? U : never;

export async function list<T extends TableName>(table: T): Promise<Row<T>[]> {
  const { data, error } = await supabase.from(table).select('*');
  if (error) throw error;
  return (data ?? []) as Row<T>[];
}

export async function getById<T extends TableName>(
  table: T,
  idColumn: keyof Row<T> & string,
  id: string | number,
): Promise<Row<T> | null> {
  const { data, error } = await supabase.from(table).select('*').eq(idColumn, id).maybeSingle();
  if (error) throw error;
  return (data as Row<T> | null) ?? null;
}

export async function createRow<T extends TableName>(table: T, payload: InsertDto<T>): Promise<Row<T>> {
  const { data, error } = await supabase.from(table).insert(payload).select('*').single();
  if (error) throw error;
  return data as Row<T>;
}

export async function updateRow<T extends TableName>(
  table: T,
  idColumn: keyof Row<T> & string,
  id: string | number,
  patch: UpdateDto<T>,
): Promise<Row<T>> {
  const { data, error } = await supabase
    .from(table)
    .update(patch)
    .eq(idColumn, id)
    .select('*')
    .single();

  if (error) throw error;
  return data as Row<T>;
}

export async function deleteRow<T extends TableName>(
  table: T,
  idColumn: keyof Row<T> & string,
  id: string | number,
): Promise<void> {
  const { error } = await supabase.from(table).delete().eq(idColumn, id);
  if (error) throw error;
}
