import { Types } from 'mongoose';

/** Normalize MongoDB document ids from lean docs, hydrated docs, or JWT payloads. */
export function resolveDocumentId(
  doc: { id?: string; _id?: Types.ObjectId | string } | string | undefined,
): string {
  if (!doc) return '';
  if (typeof doc === 'string') return doc;
  return String(doc.id ?? doc._id ?? '');
}
