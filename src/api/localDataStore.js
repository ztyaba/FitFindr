import { createSeedData } from './seedData';

const STORAGE_KEY = 'fitfinder:data';

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const mergeWithSeed = (seed, stored) => {
  if (!stored || typeof stored !== 'object') {
    return seed;
  }

  return {
    fitnessProfessionals: Array.isArray(stored.fitnessProfessionals)
      ? stored.fitnessProfessionals
      : seed.fitnessProfessionals,
    pickupGames: Array.isArray(stored.pickupGames)
      ? stored.pickupGames
      : seed.pickupGames,
    courts: Array.isArray(stored.courts)
      ? stored.courts
      : seed.courts,
    players: Array.isArray(stored.players)
      ? stored.players
      : seed.players,
    gameParticipations: Array.isArray(stored.gameParticipations)
      ? stored.gameParticipations
      : seed.gameParticipations,
  };
};

const loadInitialData = () => {
  const seed = createSeedData();

  if (!isBrowser()) {
    return seed;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return seed;
    }

    return mergeWithSeed(seed, JSON.parse(stored));
  } catch (error) {
    console.warn('Unable to read FitFindr data from storage.', error);
    return seed;
  }
};

let dataStore = loadInitialData();

const persistData = () => {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dataStore));
  } catch (error) {
    console.warn('Unable to persist FitFindr data to storage.', error);
  }
};

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const valueForPath = (item, path) =>
  path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), item);

const sortItems = (items, ordering) => {
  if (!ordering) return [...items];

  const descending = ordering.startsWith('-');
  const field = descending ? ordering.slice(1) : ordering;

  const sorted = [...items].sort((a, b) => {
    const aValue = valueForPath(a, field);
    const bValue = valueForPath(b, field);

    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return descending ? 1 : -1;
    if (bValue == null) return descending ? -1 : 1;

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return aValue - bValue;
    }

    const aDate = typeof aValue === 'string' ? Date.parse(aValue) : NaN;
    const bDate = typeof bValue === 'string' ? Date.parse(bValue) : NaN;
    if (!Number.isNaN(aDate) && !Number.isNaN(bDate)) {
      return aDate - bDate;
    }

    return String(aValue).localeCompare(String(bValue));
  });

  return descending ? sorted.reverse() : sorted;
};

const generateId = (prefix) => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
};

export const listEntities = async (collection, ordering, limit) => {
  const source = Array.isArray(dataStore[collection]) ? dataStore[collection] : [];
  let results = sortItems(source, ordering);

  if (typeof limit === 'number') {
    results = results.slice(0, limit);
  }

  return deepClone(results);
};

export const getEntityById = async (collection, id) => {
  const source = Array.isArray(dataStore[collection]) ? dataStore[collection] : [];
  const found = source.find((item) => item.id === id);
  return found ? deepClone(found) : undefined;
};

export const createEntity = async (collection, payload) => {
  const source = Array.isArray(dataStore[collection]) ? dataStore[collection] : [];
  const next = {
    ...payload,
    id: payload?.id ?? generateId(collection),
    created_at: payload?.created_at ?? new Date().toISOString(),
  };

  dataStore = {
    ...dataStore,
    [collection]: [next, ...source],
  };

  persistData();
  return deepClone(next);
};

export const updateEntity = async (collection, id, updates) => {
  const source = Array.isArray(dataStore[collection]) ? dataStore[collection] : [];
  let updatedItem;

  const nextCollection = source.map((item) => {
    if (item.id !== id) return item;
    updatedItem = { ...item, ...updates };
    return updatedItem;
  });

  if (!updatedItem) {
    return undefined;
  }

  dataStore = {
    ...dataStore,
    [collection]: nextCollection,
  };

  persistData();
  return deepClone(updatedItem);
};

export const removeEntity = async (collection, id) => {
  const source = Array.isArray(dataStore[collection]) ? dataStore[collection] : [];
  const nextCollection = source.filter((item) => item.id !== id);

  if (nextCollection.length === source.length) {
    return false;
  }

  dataStore = {
    ...dataStore,
    [collection]: nextCollection,
  };

  persistData();
  return true;
};

export const resetDataStore = async () => {
  dataStore = createSeedData();
  persistData();
};
