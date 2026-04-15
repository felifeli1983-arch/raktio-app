/**
 * Raktio — Auth + Workspace Context
 *
 * Manages:
 * - Supabase auth session (login, signup, logout, session restore)
 * - Current workspace selection + persistence
 * - Token + workspace propagation to the API client
 *
 * All workspace-scoped pages depend on this context.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { setAuthToken, setWorkspaceId } from '../api/client';
import type { Session, User } from '@supabase/supabase-js';

interface Workspace {
  workspace_id: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  selectWorkspace: (ws: Workspace) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    workspaces: [],
    currentWorkspace: null,
  });

  // Sync token + workspace to API client whenever they change
  useEffect(() => {
    if (state.session?.access_token) {
      setAuthToken(state.session.access_token);
    } else {
      setAuthToken('');
    }
  }, [state.session?.access_token]);

  useEffect(() => {
    if (state.currentWorkspace) {
      setWorkspaceId(state.currentWorkspace.workspace_id);
      localStorage.setItem('raktio-workspace-id', state.currentWorkspace.workspace_id);
    }
  }, [state.currentWorkspace]);

  // Restore session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setState(s => ({ ...s, user: session.user, session, loading: false }));
        loadWorkspaces(session.access_token);
      } else {
        setState(s => ({ ...s, loading: false }));
      }
    });

    // Listen for auth state changes (tab focus, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(s => ({
        ...s,
        user: session?.user ?? null,
        session,
        loading: false,
      }));
      if (session) {
        loadWorkspaces(session.access_token);
      } else {
        setState(s => ({ ...s, workspaces: [], currentWorkspace: null }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadWorkspaces = useCallback(async (token: string) => {
    try {
      setAuthToken(token);
      // Fetch workspaces via team API
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/team/workspaces`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        const raw = data.items || data || [];
        const workspaces: Workspace[] = raw.map((w: any) => ({
          workspace_id: w.workspace_id,
          // Backend returns nested: { workspaces: { name, slug } }
          name: w.workspaces?.name || w.workspace_name || w.name || 'Workspace',
          role: w.role || 'viewer',
        }));

        // Restore previously selected workspace from localStorage
        const savedId = localStorage.getItem('raktio-workspace-id');
        const saved = workspaces.find(w => w.workspace_id === savedId);
        const current = saved || workspaces[0] || null;

        setState(s => ({ ...s, workspaces, currentWorkspace: current }));
        if (current) setWorkspaceId(current.workspace_id);
      }
    } catch {
      // If workspace fetch fails, user can still be logged in
      // They just won't have workspace context until it's resolved
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: fullName ? { data: { full_name: fullName } } : undefined,
    });
    if (error) return { error: error.message };
    return {};
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setAuthToken('');
    setWorkspaceId('');
    localStorage.removeItem('raktio-workspace-id');
    setState({
      user: null,
      session: null,
      loading: false,
      workspaces: [],
      currentWorkspace: null,
    });
  }, []);

  const selectWorkspace = useCallback((ws: Workspace) => {
    setState(s => ({ ...s, currentWorkspace: ws }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut, selectWorkspace }}>
      {children}
    </AuthContext.Provider>
  );
}
