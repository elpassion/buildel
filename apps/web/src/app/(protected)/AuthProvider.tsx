'use client';

import {
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';
import { TUser } from '~/contracts/auth.contracts';

interface IAuthContext {
  user: TUser | null;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

interface AuthProviderProps extends PropsWithChildren {
  initialUser?: TUser;
}
export const AuthProvider = ({ children, initialUser }: AuthProviderProps) => {
  const [user, setUser] = useState(initialUser ?? null);

  const value = useMemo(() => ({ user }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used with AuthProvider');
  }

  return ctx;
};
