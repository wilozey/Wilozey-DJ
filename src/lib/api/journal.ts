import { supabase } from '../supabase/client';
import type { ApiResult, InsertDto, Row, UpdateDto } from '../supabase/types';

const TABLE = 'journal' as const;
type Table = typeof TABLE;

type Model = Row<Table>;
type InsertModel = InsertDto<Table>;
type UpdateModel = UpdateDto<Table>;

function toErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'Unknown error';
}

export async function listjournal(): Promise<ApiResult<Model[]>> {
  try {
    const { data, error } = await supabase.from(TABLE).select('*');
    if (error) return { data: null, error: error.message };
    return { data: (data ?? []) as Model[], error: null };
  } catch (error) {
    return { data: null, error: toErrorMessage(error) };
  }
}

export async function getjournalById(id: string): Promise<ApiResult<Model>> {
  try {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) return { data: null, error: error.message };
    return { data: (data as Model | null), error: null };
  } catch (error) {
    return { data: null, error: toErrorMessage(error) };
  }
}

export async function createjournal(payload: InsertModel): Promise<ApiResult<Model>> {
  try {
    const { data, error } = await supabase.from(TABLE).insert(payload).select('*').single();
    if (error) return { data: null, error: error.message };
    return { data: data as Model, error: null };
  } catch (error) {
    return { data: null, error: toErrorMessage(error) };
  }
}

export async function updatejournal(id: string, patch: UpdateModel): Promise<ApiResult<Model>> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as Model, error: null };
  } catch (error) {
    return { data: null, error: toErrorMessage(error) };
  }
}

export async function deletejournal(id: string): Promise<ApiResult<{ id: string }>> {
  try {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) return { data: null, error: error.message };
    return { data: { id }, error: null };
  } catch (error) {
    return { data: null, error: toErrorMessage(error) };
  }
}
