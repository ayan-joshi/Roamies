// Must match the CHECK constraints in supabase/migrations.
export const GENDERS = ["Male", "Female", "Non-Binary"] as const;
export const BUDGETS = ["Hostel/Budget", "Mid-range", "Luxury"] as const;
export const VIBES = ["Trekking/Adventure", "Spiritual", "Cafe Hopping/Chill", "Partying"] as const;
export const RADII_KM = [25, 50, 100] as const;
export const DAILY_INTROS = 8; // keep in sync with public.daily_intro_limit()

export const INTRO_MIN = 10;
export const INTRO_MAX = 300;
export const ANSWER_MAX = 200;
export const MESSAGE_MAX = 2000; // matches the messages.body CHECK constraint

// No real ID verification yet, so no trust badge anywhere. Flip once verification is real.
export const SHOW_VERIFIED_BADGE = false;

export const REPORT_REASONS = ["Harassment", "Fake profile", "Scam or money request", "Unsafe meetup", "Spam", "Something else"] as const;
