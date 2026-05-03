import { supabase } from '../supabase/client';
import type { ApiResult, InsertDto, Row, UpdateDto } from '../supabase/types';

const TABLE = 'plants' as const;
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

export async function listplants(): Promise<ApiResult<Model[]>> {
  try {
    const { data, error } = await supabase.from(TABLE).select('*');
    if (error) return { data: null, error: error.message };
    return { data: (data ?? []) as Model[], error: null };
  } catch (error) {
    return { data: null, error: toErrorMessage(error) };
  }
}

export async function getplantsById(id: string): Promise<ApiResult<Model>> {
  try {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) return { data: null, error: error.message };
    return { data: (data as Model | null), error: null };
  } catch (error) {
    return { data: null, error: toErrorMessage(error) };
  }
}

export async function createplants(payload: InsertModel): Promise<ApiResult<Model>> {
  try {
    const { data, error } = await supabase.from(TABLE).insert(payload).select('*').single();
    if (error) return { data: null, error: error.message };
    return { data: data as Model, error: null };
  } catch (error) {
    return { data: null, error: toErrorMessage(error) };
  }
}

export async function updateplants(id: string, patch: UpdateModel): Promise<ApiResult<Model>> {
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

export async function deleteplants(id: string): Promise<ApiResult<{ id: string }>> {
  try {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) return { data: null, error: error.message };
    return { data: { id }, error: null };
  } catch (error) {
    return { data: null, error: toErrorMessage(error) };
  }
}
