import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface backendInterface {
  healthCheck: ActorMethod<[], boolean>;
}

export const idlFactory = ({ IDL }: any) => {
  return IDL.Service({
    healthCheck: IDL.Func([], [IDL.Bool], ['query']),
  });
};
