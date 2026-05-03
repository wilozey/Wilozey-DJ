import type { Database } from './database.types';

export type PublicSchema = Database['public'];
export type Tables = PublicSchema['Tables'];

type KnownTableName = keyof Tables & string;
export type TableName = [KnownTableName] extends [never] ? string : KnownTableName;

export type Row<T extends TableName> = T extends keyof Tables
  ? Tables[T] extends { Row: infer R }
    ? R
    : Record<string, unknown>
  : Record<string, unknown>;

export type InsertDto<T extends TableName> = T extends keyof Tables
  ? Tables[T] extends { Insert: infer I }
    ? I
    : Record<string, unknown>
  : Record<string, unknown>;

export type UpdateDto<T extends TableName> = T extends keyof Tables
  ? Tables[T] extends { Update: infer U }
    ? U
    : Record<string, unknown>
  : Record<string, unknown>;

export type ApiResult<T> = {
  data: T | null;
  error: string | null;
};
