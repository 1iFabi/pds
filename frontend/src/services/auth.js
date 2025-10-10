import { supabase } from '../lib/supabaseClient.js';

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signUp({ email, password, metadata, redirectTo }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata || {},
      emailRedirectTo: redirectTo || `${window.location.origin}/login`,
    },
  });
  return { data, error };
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function requestPasswordReset(email, redirectTo) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo || `${window.location.origin}/reset-password`,
  });
  return { data, error };
}

export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  return { data, error };
}

export async function reauthenticate(email, password) {
  // Useful to verify current password before changing it
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function resendVerification(email) {
  const { data, error } = await supabase.auth.resend({ type: 'signup', email });
  return { data, error };
}
