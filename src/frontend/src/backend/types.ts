/**
 * Additional types not auto-generated from Candid but needed for the frontend.
 * These types match the backend's Motoko variant types.
 */

export type ApprovalStatus = 
  | { __kind__: 'pending' }
  | { __kind__: 'approved' }
  | { __kind__: 'rejected' };
