import type { AuthenticatedUser } from './jwt.types';

// Passport (@types/passport) already declares `Express.User` (empty interface) and
// `Request.user?: User` — extend that interface rather than re-declaring `Request.user`,
// otherwise this augmentation loses the merge and `request.user` stays typed as `{}`.
declare global {
  namespace Express {
    // Empty body is the point: this merges AuthenticatedUser's members into Passport's
    // existing `Express.User` interface via TS declaration merging, not a real subtype.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends AuthenticatedUser {}
  }
}

export {};
