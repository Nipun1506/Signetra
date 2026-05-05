
export interface Badge {
  id: string;
  name: string;
  icon: string;
  level: number;
  unlockedAt: string | null;
}

export interface AchievementState {
  totalXP: number;
  level: number;
  badges: Badge[];
  lastLevelUp: number | null;
}

const BADGES: Badge[] = [
  { id: 'novice', name: 'Novice Signer', icon: 'school', level: 1, unlockedAt: null },
  { id: 'apprentice', name: 'Apprentice', icon: 'workspace_premium', level: 2, unlockedAt: null },
  { id: 'skilled', name: 'Skilled Communicator', icon: 'military_tech', level: 3, unlockedAt: null },
  { id: 'specialist', name: 'Digital Specialist', icon: 'diamond', level: 4, unlockedAt: null },
  { id: 'master', name: 'Signetra Master', icon: 'star', level: 5, unlockedAt: null },
];

const LEVEL_THRESHOLDS = [0, 250, 750, 1500, 3000, 6000];

/**
 * Returns a user-specific localStorage key so every user gets their own
 * achievements, XP, and badges — even on a shared device or browser.
 */
function getUserKey(baseKey: string): string {
  try {
    // Prefer the stored profile email (most stable identifier)
    const profile = localStorage.getItem('signetra_profile');
    if (profile) {
      const parsed = JSON.parse(profile);
      const email: string = parsed.email || '';
      if (email) {
        // Use base64-encoded email slice as a compact, safe key suffix
        return `${baseKey}_${btoa(email).slice(0, 16)}`;
      }
    }
    // Fallback: tail of the JWT token (changes on each login but acceptable)
    const token = localStorage.getItem('signetra_token');
    if (token) return `${baseKey}_${token.slice(-16)}`;
  } catch {
    // ignore parse errors
  }
  return baseKey; // unauthenticated fallback
}

export const getAchievementState = (): AchievementState => {
  const key = getUserKey('signetra_achievements');
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      const state = JSON.parse(saved);
      // Merge with default badges to handle new badge additions
      state.badges = BADGES.map((b: Badge) => {
        const found = state.badges.find((sb: any) => sb.id === b.id);
        return found ? { ...b, unlockedAt: found.unlockedAt } : b;
      });
      return state;
    } catch (e) {
      console.error('Failed to parse achievements', e);
    }
  }
  return {
    totalXP: 0,
    level: 1,
    badges: BADGES.map(b => (b.level === 1 ? { ...b, unlockedAt: new Date().toISOString() } : b)),
    lastLevelUp: null,
  };
};

export const saveAchievementState = (state: AchievementState) => {
  const key = getUserKey('signetra_achievements');
  localStorage.setItem(key, JSON.stringify(state));
};

export const addXP = (
  amount: number
): { state: AchievementState; levelUp: boolean; newBadge: Badge | null } => {
  const state = getAchievementState();
  const oldLevel = state.level;
  state.totalXP += amount;

  // Calculate new level
  let newLevel = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (state.totalXP >= LEVEL_THRESHOLDS[i]) {
      newLevel = i + 1;
    } else {
      break;
    }
  }

  const levelUp = newLevel > oldLevel;
  let newBadge: Badge | null = null;

  if (levelUp) {
    state.level = newLevel;
    state.lastLevelUp = Date.now();

    // Unlock new badges for this level
    state.badges = state.badges.map((b: Badge) => {
      if (b.level <= newLevel && !b.unlockedAt) {
        newBadge = b;
        return { ...b, unlockedAt: new Date().toISOString() };
      }
      return b;
    });
  }

  saveAchievementState(state);
  return { state, levelUp, newBadge };
};

export const getLevelProgress = (xp: number) => {
  let currentLevel = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      currentLevel = i + 1;
    } else {
      break;
    }
  }

  const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1];
  const nextThreshold = LEVEL_THRESHOLDS[currentLevel] || currentThreshold * 2;
  const progress = ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

  return {
    level: currentLevel,
    progress: Math.min(100, Math.max(0, progress)),
    nextThreshold,
  };
};
