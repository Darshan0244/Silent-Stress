type Quest = {
  id: string;
  title: string;
  target: number;
  progress: number;
  rewardXp: number;
};

export type GamificationState = {
  xp: number;
  level: number;
  badges: string[];
  lastActiveISO: string | null;
  streak: number;
  quests: Quest[];
  conversationStreak?: number;
  lastConversationISO?: string | null;
};

const STORAGE_KEY = "ww_gamification_state_v1";

const defaultQuests = (): Quest[] => [
  { id: "q_breathe", title: "Do a breathing cycle", target: 1, progress: 0, rewardXp: 10 },
  { id: "q_sound", title: "Play an ambient sound", target: 1, progress: 0, rewardXp: 10 },
  { id: "q_emoji", title: "Place an emoji in ZenGarden", target: 3, progress: 0, rewardXp: 15 },
];

const defaultState = (): GamificationState => ({
  xp: 0,
  level: 1,
  badges: [],
  lastActiveISO: null,
  streak: 0,
  quests: defaultQuests(),
  conversationStreak: 0,
  lastConversationISO: null,
});

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function loadGamification(): GamificationState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as GamificationState;
    return {
      ...defaultState(),
      ...parsed,
      quests: (parsed.quests?.length ? parsed.quests : defaultQuests()).map((q) => ({ ...q })),
    };
  } catch {
    return defaultState();
  }
}

export function saveGamification(state: GamificationState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function calcLevel(xp: number) {
  return clamp(Math.floor(1 + Math.sqrt(xp / 100)), 1, 99);
}

function updateStreak(state: GamificationState) {
  const today = new Date();
  const dStr = today.toDateString();
  const lastStr = state.lastActiveISO ? new Date(state.lastActiveISO).toDateString() : null;
  if (!lastStr) {
    state.streak = 1;
  } else {
    const last = new Date(lastStr);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (last.toDateString() === dStr) {
      // no change
    } else if (last.toDateString() === yesterday.toDateString()) {
      state.streak = (state.streak || 0) + 1;
    } else {
      state.streak = 1;
    }
  }
  state.lastActiveISO = today.toISOString();
}

function awardBadgeIfNeeded(state: GamificationState) {
  if (state.streak >= 3 && !state.badges.includes("Consistency Bronze")) state.badges.push("Consistency Bronze");
  if (state.streak >= 7 && !state.badges.includes("Consistency Silver")) state.badges.push("Consistency Silver");
  if (state.streak >= 14 && !state.badges.includes("Consistency Gold")) state.badges.push("Consistency Gold");
  if (state.level >= 5 && !state.badges.includes("Calm Novice")) state.badges.push("Calm Novice");
  if ((state.conversationStreak || 0) >= 3 && !state.badges.includes("Connection Bronze")) state.badges.push("Connection Bronze");
  if ((state.conversationStreak || 0) >= 7 && !state.badges.includes("Connection Silver")) state.badges.push("Connection Silver");
  if ((state.conversationStreak || 0) >= 14 && !state.badges.includes("Connection Gold")) state.badges.push("Connection Gold");
}

function completeQuest(state: GamificationState, q: Quest) {
  state.xp += q.rewardXp;
}

function resetDailyQuestsIfNeeded(state: GamificationState) {
  const last = state.lastActiveISO ? new Date(state.lastActiveISO) : null;
  const now = new Date();
  if (!last || last.toDateString() !== now.toDateString()) {
    state.quests = defaultQuests();
  }
}

function emitUpdate() {
  window.dispatchEvent(new CustomEvent("gamification:update"));
}

export function recordEvent(type: "breathing_start" | "breathing_cycle" | "ambient_play" | "emoji_place") {
  const state = loadGamification();
  resetDailyQuestsIfNeeded(state);

  if (type === "breathing_cycle" || type === "breathing_start") {
    const q = state.quests.find((x) => x.id === "q_breathe");
    if (q) q.progress = clamp(q.progress + 1, 0, q.target);
  }
  if (type === "ambient_play") {
    const q = state.quests.find((x) => x.id === "q_sound");
    if (q) q.progress = clamp(q.progress + 1, 0, q.target);
  }
  if (type === "emoji_place") {
    const q = state.quests.find((x) => x.id === "q_emoji");
    if (q) q.progress = clamp(q.progress + 1, 0, q.target);
  }

  state.quests.forEach((q) => {
    if (q.progress >= q.target) completeQuest(state, q);
  });

  state.level = calcLevel(state.xp);
  updateStreak(state);
  awardBadgeIfNeeded(state);
  saveGamification(state);
  emitUpdate();
}

export function recordConversation() {
  const state = loadGamification();
  const today = new Date();
  const dStr = today.toDateString();
  const lastStr = state.lastConversationISO ? new Date(state.lastConversationISO).toDateString() : null;
  if (!lastStr) {
    state.conversationStreak = 1;
  } else {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (lastStr === dStr) {
      // same day, unchanged
    } else if (lastStr === yesterday.toDateString()) {
      state.conversationStreak = (state.conversationStreak || 0) + 1;
    } else {
      state.conversationStreak = 1;
    }
  }
  state.lastConversationISO = today.toISOString();
  awardBadgeIfNeeded(state);
  saveGamification(state);
  emitUpdate();
}

import { useEffect, useState } from "react";

export function useGamificationState(): GamificationState {
  const [state, setState] = useState<GamificationState>(() => loadGamification());
  useEffect(() => {
    const onUpdate = () => setState(loadGamification());
    window.addEventListener("gamification:update", onUpdate);
    return () => window.removeEventListener("gamification:update", onUpdate);
  }, []);
  return state;
}
