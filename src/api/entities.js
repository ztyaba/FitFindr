import {
  createEntity,
  listEntities,
  getEntityById,
  updateEntity,
  removeEntity,
} from './localDataStore';

export const FitnessProfessional = {
  list: (ordering, limit) => listEntities('fitnessProfessionals', ordering, limit),
  get: (id) => getEntityById('fitnessProfessionals', id),
};

export const PickupGame = {
  list: (ordering, limit) => listEntities('pickupGames', ordering, limit),
  get: (id) => getEntityById('pickupGames', id),
  create: (payload) => createEntity('pickupGames', payload),
  update: (id, updates) => updateEntity('pickupGames', id, updates),
  remove: (id) => removeEntity('pickupGames', id),
};

export const Court = {
  list: (ordering, limit) => listEntities('courts', ordering, limit),
  get: (id) => getEntityById('courts', id),
};

export const Player = {
  list: (ordering, limit) => listEntities('players', ordering, limit),
  get: (id) => getEntityById('players', id),
};

export const GameParticipation = {
  list: (ordering, limit) => listEntities('gameParticipations', ordering, limit),
  create: (payload) => createEntity('gameParticipations', payload),
  remove: (id) => removeEntity('gameParticipations', id),
};

export const User = {
  getCurrent: async () => null,
  signIn: async () => {
    throw new Error('Authentication is not available in the offline FitFindr demo.');
  },
  signOut: async () => undefined,
};
