/** localStorage key set once the /onboarding carousel has been completed or skipped. */
export const ONBOARDING_SEEN_KEY = "summit_onboarding_seen";

/**
 * Separate keys per role on /growth-machine/board — Builder and Spectator
 * see different onboarding content, so seeing one shouldn't skip the other
 * (e.g. someone who's only ever spectated shouldn't skip the Builder intro
 * the first time they pick that role).
 */
export const GROWTH_MACHINE_BUILDER_ONBOARDING_SEEN_KEY = "summit_growth_machine_builder_onboarding_seen";
export const GROWTH_MACHINE_SPECTATOR_ONBOARDING_SEEN_KEY = "summit_growth_machine_spectator_onboarding_seen";

/** Same idea, for the Excalidraw-based /gm-alt backup — kept separate so
 * seeing one implementation's onboarding doesn't skip the other's. */
export const GM_ALT_BUILDER_ONBOARDING_SEEN_KEY = "summit_gm_alt_builder_onboarding_seen";
export const GM_ALT_SPECTATOR_ONBOARDING_SEEN_KEY = "summit_gm_alt_spectator_onboarding_seen";
