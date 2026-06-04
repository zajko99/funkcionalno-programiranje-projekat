import {
  createEntity,
  addComponent,
  entitiesWith,
  get,
  setResource,
} from "../../ecs/world.js";

export const shootSystem =
  ({ cooldownSec = 0.15, bulletSpeed = 650 } = {}) =>
  (world) => {
    if (world.resources.game.over) return world;

    const input = world.resources.input ?? { keysDown: [], buttonsDown: [] };
    const keys = input.keysDown ?? [];
    const buttonsDown = input.buttonsDown ?? [];

    const fireBySpace = keys.includes("Space");
    const fireByEnter = keys.includes("Enter");
    const fireByF = keys.includes("KeyF");
    const fireByClick = buttonsDown.includes(0);
    const wantsFire = fireBySpace || fireByEnter || fireByF || fireByClick;

    const fire = world.resources.fire ?? { cooldown: 0 };
    const dt = world.resources.time.dt;
    const nextCd = Math.max(0, fire.cooldown - dt);

    if (!wantsFire || nextCd > 0) {
      return setResource(world, "fire", { cooldown: nextCd });
    }

    const playerIds = entitiesWith(world, ["Player", "Position", "Size"]);
    if (playerIds.length === 0) {
      return setResource(world, "fire", { cooldown: cooldownSec });
    }

    const pid = playerIds[0];
    const p = get(world, "Position", pid);
    const s = get(world, "Size", pid);
    const center = { x: p.x + s.w / 2, y: p.y + s.h / 2 };

    const dir = { x: 0, y: -1 };

    let w = world;
    let bid;
    [w, bid] = createEntity(w);

    w = addComponent(w, "Bullet", bid, { tag: true });
    w = addComponent(w, "Position", bid, { x: center.x - 4, y: center.y - s.h / 2 });
    w = addComponent(w, "Velocity", bid, { x: dir.x * bulletSpeed, y: dir.y * bulletSpeed });
    w = addComponent(w, "Size", bid, { w: 8, h: 18 });
    w = addComponent(w, "Color", bid, "#f1c40f");
    w = addComponent(w, "Lifetime", bid, { t: 1.2 });

    return setResource(w, "fire", { cooldown: cooldownSec });
  };
