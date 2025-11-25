import type { ConversionHistoryItem } from "./types";

const HISTORY_KEY = "mrpack_conversion_history";
const MAX_ITEMS = 10; 

export const getHistory = (): ConversionHistoryItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse history", e);
    return [];
  }
};

export const addToHistory = (item: Omit<ConversionHistoryItem, "id" | "date">) => {
  const current = getHistory();

  const filtered = current.filter((h) => !(h.name === item.name && h.version === item.version && h.mode === item.mode));

  const newItem: ConversionHistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    date: Date.now(),
  };

  const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
};

export const removeFromHistory = (id: string) => {
  const current = getHistory();
  const updated = current.filter((item) => item.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
};

export const clearHistory = () => {
  localStorage.removeItem(HISTORY_KEY);
};
