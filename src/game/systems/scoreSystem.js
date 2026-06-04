import { setResource } from "../../ecs/world.js";

export const scoreSystem =
  ({ pointsPerSec = 10 } = {}) =>
  (world) => {
    if (world.resources.game.over) return world;

    const dt = world.resources.time.dt;
    const next = world.resources.score.value + Math.floor(pointsPerSec * dt);

    return setResource(world, "score", { value: next });
  };
