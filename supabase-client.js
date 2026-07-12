// ============================================================
// Sketchline — Supabase client wrapper
// Include the CDN script BEFORE this file:
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//   <script src="supabase-client.js"></script>
// ============================================================

// ---- 1. Fill these in from Supabase Dashboard → Settings → API ----
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// AUTH
// ============================================================
async function signUp(email, password) {
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

async function signIn(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function signOut() {
  const { error } = await sb.auth.signOut();
  if (error) throw error;
}

async function getCurrentUser() {
  const { data: { user } } = await sb.auth.getUser();
  return user; // null if not logged in
}

// Call this once on page load to react to login/logout anywhere in the app
function onAuthChange(callback) {
  sb.auth.onAuthStateChange((_event, session) => {
    callback(session ? session.user : null);
  });
}

// ============================================================
// SKETCHES  (stores stroke arrays, not images)
// ============================================================
async function saveSketch({ briefId = null, weekNumber = null, title = null, strokes }) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Must be signed in to save a sketch');
  const { data, error } = await sb.from('sketches').insert({
    user_id: user.id,
    brief_id: briefId,
    week_number: weekNumber,
    title,
    strokes: strokes // pass the raw JS array/object — supabase-js serializes to jsonb
  }).select().single();
  if (error) throw error;
  return data;
}

// Get every sketch a user has saved for one brief (e.g. the week 1/4/8 evolution view)
async function getSketchesForBrief(briefId) {
  const user = await getCurrentUser();
  if (!user) return [];
  const { data, error } = await sb
    .from('sketches')
    .select('*')
    .eq('user_id', user.id)
    .eq('brief_id', briefId)
    .order('week_number', { ascending: true });
  if (error) throw error;
  return data;
}

async function getRecentSketches(limit = 20) {
  const user = await getCurrentUser();
  if (!user) return [];
  const { data, error } = await sb
    .from('sketches')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

// ============================================================
// TRACK PROGRESS
// ============================================================
async function getTrackProgress() {
  const user = await getCurrentUser();
  if (!user) return [];
  const { data, error } = await sb.from('track_progress').select('*').eq('user_id', user.id);
  if (error) throw error;
  return data;
}

async function updateTrackProgress(trackId, pct) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Must be signed in');
  const { data, error } = await sb.from('track_progress').upsert({
    user_id: user.id,
    track_id: trackId,
    pct,
    updated_at: new Date().toISOString()
  }).select().single();
  if (error) throw error;
  return data;
}

// ============================================================
// EYE TRAINING
// ============================================================
async function logEyeAttempt({ category, principle, correct }) {
  const user = await getCurrentUser();
  if (!user) return; // silently skip if not logged in — don't block the exercise
  const { error } = await sb.from('eye_training_attempts').insert({
    user_id: user.id, category, principle, correct
  });
  if (error) throw error;
}

async function getEyeTrainingStats() {
  const user = await getCurrentUser();
  if (!user) return { total: 0, correct: 0 };
  const { data, error } = await sb
    .from('eye_training_attempts')
    .select('correct')
    .eq('user_id', user.id);
  if (error) throw error;
  return { total: data.length, correct: data.filter(r => r.correct).length };
}

// ============================================================
// BADGES
// ============================================================
async function awardBadge(badgeId) {
  const user = await getCurrentUser();
  if (!user) return;
  // upsert so awarding the same badge twice doesn't error
  const { error } = await sb.from('badges').upsert({ user_id: user.id, badge_id: badgeId });
  if (error) throw error;
}

async function getBadges() {
  const user = await getCurrentUser();
  if (!user) return [];
  const { data, error } = await sb.from('badges').select('*').eq('user_id', user.id);
  if (error) throw error;
  return data;
}
