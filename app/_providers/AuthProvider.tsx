"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabaseBrowser } from "../_lib/supabaseBrowser";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;

  isAdmin: boolean;

  signUp: (email: string, password: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  signIn: (email: string, password: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeEmailList(v: string | undefined) {
  if (!v) return [];
  return v
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Admin emails (comma-separated in env)
  const adminEmails = useMemo(
    () => normalizeEmailList(process.env.NEXT_PUBLIC_ADMIN_EMAILS),
    []
  );

  const isAdmin = useMemo(() => {
    const email = user?.email?.toLowerCase();
    if (!email) return false;
    return adminEmails.includes(email);
  }, [adminEmails, user?.email]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const supabase = supabaseBrowser();
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!mounted) return;
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
      } catch {
        // keep silent; UI will still work and show login
        if (!mounted) return;
        setSession(null);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    const supabase = (() => {
      try {
        return supabaseBrowser();
      } catch {
        return null;
      }
    })();

    if (!supabase) return;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signUp: AuthContextValue["signUp"] = async (email, password) => {
    try {
      const supabase = supabaseBrowser();
      const { error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) return { ok: false, message: error.message };

      // Note: if email confirmations are enabled in Supabase,
      // user will need to confirm. We’ll configure later.
      return { ok: true };
    } catch (e: any) {
      return { ok: false, message: e?.message ?? "Sign up failed." };
    }
  };

  const signIn: AuthContextValue["signIn"] = async (email, password) => {
    try {
      const supabase = supabaseBrowser();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) return { ok: false, message: error.message };
      return { ok: true };
    } catch (e: any) {
      return { ok: false, message: e?.message ?? "Sign in failed." };
    }
  };

  const signOut: AuthContextValue["signOut"] = async () => {
    try {
      const supabase = supabaseBrowser();
      await supabase.auth.signOut();
    } finally {
      setSession(null);
      setUser(null);
    }
  };

  const refresh: AuthContextValue["refresh"] = async () => {
    try {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
    } catch {
      setSession(null);
      setUser(null);
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      isAdmin,
      signUp,
      signIn,
      signOut,
      refresh
    }),
    [user, session, loading, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}