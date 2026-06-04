import { setInMap, deleteFromMap, uniqueId } from "./helpers.js";

export const createWorld = ({ resources = {} } = {}) => ({
  nextEntityId: 1,
  components: {
    Position: new Map(),
    Velocity: new Map(),
    Size: new Map(),
    Color: new Map(),
    Player: new Map(),
    Enemy: new Map(),
    Bullet: new Map(),
    Lifetime: new Map(),
    Aim: new Map(),
  },
  resources: {
    ...resources,
    time: { t: 0, dt: 0 },
    game: { over: false, reason: "" },
    score: { value: 0 },
    spawn: { cooldown: 0 },
    input: { keysDown: [] },
  },
});

export const createEntity = (world) => {
  const id = uniqueId(world.nextEntityId);
  return [{ ...world, nextEntityId: world.nextEntityId + 1 }, id];
};

export const addComponent = (world, componentName, entityId, data) => ({
  ...world,
  components: {
    ...world.components,
    [componentName]: setInMap(world.components[componentName], entityId, data),
  },
});

export const removeEntity = (world, entityId) => ({
  ...world,
  components: Object.fromEntries(
    Object.entries(world.components).map(([name, map]) => [
      name,
      deleteFromMap(map, entityId),
    ])
  ),
});

export const get = (world, componentName, entityId) =>
  world.components[componentName].get(entityId);

export const has = (world, componentName, entityId) =>
  world.components[componentName].has(entityId);

export const set = (world, componentName, entityId, data) =>
  addComponent(world, componentName, entityId, data);

export const entitiesWith = (world, componentNames) => {
  const [first, ...rest] = componentNames;
  const baseIds = [...world.components[first].keys()];
  return baseIds.filter((id) =>
    rest.every((c) => world.components[c].has(id))
  );
};

export const setResource = (world, key, value) => ({
  ...world,
  resources: { ...world.resources, [key]: value },
});
