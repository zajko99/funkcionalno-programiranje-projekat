import { createEntity, addComponent, setResource } from "../../ecs/world.js";

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const spawnEnemy = (world, { width }) => {
  let w = world;
  let id;
  [w, id] = createEntity(w);

  const size = 22;
  const pos = { x: randInt(0, width - size), y: -size - randInt(0, 80) };

  w = addComponent(w, "Enemy", id, { tag: true });
  w = addComponent(w, "Position", id, pos);
  w = addComponent(w, "Velocity", id, { x: 0, y: 0 });
  w = addComponent(w, "Size", id, { w: size, h: size });
  w = addComponent(w, "Color", id, "#e74c3c");
  w = addComponent(w, "Aim", id, { angle: Math.PI / 2, drift: Math.random() * Math.PI * 2 });


  return w;
};

export const spawnSystem =
  ({ width, height, everySec = 1.0 } = {}) =>
  (world) => {
    if (world.resources.game.over) return world;

    const dt = world.resources.time.dt;
    const cooldown = world.resources.spawn.cooldown - dt;

    if (cooldown > 0) {
      return setResource(world, "spawn", { cooldown });
    }

    const w2 = spawnEnemy(world, { width });
    return setResource(w2, "spawn", { cooldown: everySec });
  };
