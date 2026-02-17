// Backend actor factory
// This file provides the createActor function to instantiate the backend canister

import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from './backend.did';
import type { backendInterface } from './backend.did';

export { idlFactory } from './backend.did';
export type { backendInterface } from './backend.did';

export function createActor(
  canisterId: string,
  options?: { agentOptions?: { identity?: any; host?: string } }
): backendInterface {
  const agent = new HttpAgent({
    host: options?.agentOptions?.host || 'http://localhost:4943',
    identity: options?.agentOptions?.identity
  });

  if (process.env.NODE_ENV !== 'production') {
    agent.fetchRootKey().catch((err) => {
      console.warn('Unable to fetch root key. Check to ensure that your local replica is running');
      console.error(err);
    });
  }

  return Actor.createActor(idlFactory, {
    agent,
    canisterId
  });
}
