import { entitiesWith, get, set } from "../../ecs/world.js";

const hasAny = (keys, variants) => variants.some((k) => keys.includes(k));

export const playerControlSystem =
  ({ speed = 220 } = {}) =>
  (world) => {
    const playerIds = entitiesWith(world, ["Player", "Velocity"]);
    if (playerIds.length === 0) return world;

    const keys = world.resources.input?.keysDown ?? [];

    const right = hasAny(keys, ["ArrowRight", "KeyD"]);
    const left  = hasAny(keys, ["ArrowLeft", "KeyA"]);
    const down = hasAny(keys, ["ArrowDown", "KeyS"]);
    const up = hasAny(keys, ["ArrowUp", "KeyW"]);

    const axisX = (right ? 1 : 0) + (left ? -1 : 0);
    const axisY = (down ? 1 : 0) + (up ? -1 : 0);

    return playerIds.reduce((w, id) => {
      const v = get(w, "Velocity", id);
      const nextV = { ...v, x: axisX * speed, y: axisY * speed };
      return set(w, "Velocity", id, nextV);
    }, world);
  };
