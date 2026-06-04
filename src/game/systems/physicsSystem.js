import { entitiesWith, get, has, set } from "../../ecs/world.js";
import { clamp } from "../../ecs/helpers.js";

export const physicsSystem =
  ({ width, height } = {}) =>
  (world) => {
    const dt = world.resources.time.dt;

    const movers = entitiesWith(world, ["Position", "Velocity", "Size"]);

    return movers.reduce((w, id) => {
      const p = get(w, "Position", id);
      const v = get(w, "Velocity", id);
      const s = get(w, "Size", id);

      const nextP = {
        x: clamp(0, width - s.w, p.x + v.x * dt),
        y: clamp(0, height - s.h, p.y + v.y * dt),
      };

      if (has(w, "Enemy", id) || has(w, "Bullet", id)) {
        return set(w, "Position", id, {
          x: clamp(0, width - s.w, p.x + v.x * dt),
          y: p.y + v.y * dt,
        });
      }

      return set(w, "Position", id, nextP);
    }, world);
  };
