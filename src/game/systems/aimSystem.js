import { entitiesWith, get, set, has, addComponent } from "../../ecs/world.js";

export const aimSystem =
  () =>
  (world) => {
    const input = world.resources.input ?? {};
    const mouse = input.mouse;

    if (!mouse) return world;

    const playerIds = entitiesWith(world, ["Player", "Position", "Size"]);
    if (playerIds.length === 0) return world;

    return playerIds.reduce((w, id) => {
      const p = get(w, "Position", id);
      const s = get(w, "Size", id);

      const center = { x: p.x + s.w / 2, y: p.y + s.h / 2 };
      const angle = Math.atan2(mouse.y - center.y, mouse.x - center.x);

      if (has(w, "Aim", id)) {
        const prev = get(w, "Aim", id);
        return set(w, "Aim", id, { ...prev, angle });
      }

      return addComponent(w, "Aim", id, { angle });
    }, world);
  };
