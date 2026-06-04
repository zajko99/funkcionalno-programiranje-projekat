// src/game/systems/lifetimeSystem.js
import { entitiesWith, get, set, removeEntity } from "../../ecs/world.js";

export const lifetimeSystem = (world) => {
  const dt = world.resources.time.dt;
  const ids = entitiesWith(world, ["Lifetime"]);

  return ids.reduce((w, id) => {
    const lt = get(w, "Lifetime", id);
    const next = lt.t - dt;
    return next <= 0 ? removeEntity(w, id) : set(w, "Lifetime", id, { t: next });
  }, world);
};
