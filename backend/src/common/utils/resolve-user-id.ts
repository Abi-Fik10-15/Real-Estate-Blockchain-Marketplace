import type { UserDocument } from '../../users/schemas/user.schema';

/** Lean JWT users expose `_id`; hydrated docs use `.id`. */
export function resolveUserId(user: UserDocument): string {
  const doc = user as UserDocument & { _id?: { toString(): string } };
  return String(doc._id ?? doc.id);
}
