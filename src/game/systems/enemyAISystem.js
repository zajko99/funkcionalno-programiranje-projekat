import { entitiesWith, get, set } from "../../ecs/world.js";

export const enemyAISystem =
  ({ enemySpeed = 120 } = {}) =>
  (world) => {
    const enemyIds = entitiesWith(world, ["Enemy", "Position", "Velocity", "Size"]);
    const t = world.resources.time?.t ?? 0;

    return enemyIds.reduce((w, id) => {
      const aim = get(w, "Aim", id) ?? { drift: id * 0.7 };
      const sway = Math.sin(t * 2.4 + aim.drift) * 44;

      return set(w, "Velocity", id, { x: sway, y: enemySpeed });
    }, world);
  };
