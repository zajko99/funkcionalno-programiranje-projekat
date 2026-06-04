import { createWorld, setResource } from "./ecs/world.js";
import { pipe } from "./ecs/helpers.js";

import { spawnPlayer } from "./game/prefabs.js";

import { createInputDriver, inputSystem } from "./game/systems/inputSystem.js";
import { playerControlSystem } from "./game/systems/playerControlSystem.js";
import { shootSystem } from "./game/systems/shootSystem.js";

import { physicsSystem } from "./game/systems/physicsSystem.js";
import { enemyAISystem } from "./game/systems/enemyAISystem.js";
import { spawnSystem } from "./game/systems/spawnSystem.js";
import { collisionSystem } from "./game/systems/collisionSystem.js";
import { scoreSystem } from "./game/systems/scoreSystem.js";
import { renderSystem } from "./game/systems/renderSystem.js";
import { lifetimeSystem } from "./game/systems/lifetimeSystem.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const resize = () => {
  // fullscreen
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};
window.addEventListener("resize", resize);
resize();

const playerStart = () => ({
  x: canvas.width / 2 - 22,
  y: canvas.height - 86,
});

const nameInput = document.getElementById("playerName");
const skinSelect = document.getElementById("playerSkin");
const readInput = createInputDriver(canvas, nameInput, skinSelect);

const restartSystem =
  ({ canvas, ctx }) =>
  (world) => {
    const keys = world.resources.input?.keysDown ?? [];
    const wantsRestart = keys.includes("KeyR");
    if (!world.resources.game.over || !wantsRestart) return world;

    let w = createWorld({ resources: { canvas, ctx } });
    w = setResource(w, "spawn", { cooldown: 0.8 });
    w = setResource(w, "score", { value: 0 });
    w = setResource(w, "fire", { cooldown: 0 });
    w = spawnPlayer(w, playerStart());
    return w;
  };

const makeTick = ({ ctx, canvas, readInput }) => {
  const alwaysSystems = pipe(
    inputSystem({ readInput }),
    restartSystem({ canvas, ctx })
  );

  const runningSystems = pipe(
    playerControlSystem({ speed: 260 }),
    shootSystem({ cooldownSec: 0.15, bulletSpeed: 650 }),

    spawnSystem({ width: canvas.width, height: canvas.height, everySec: 1.05 }),
    enemyAISystem({ enemySpeed: 120 }),

    physicsSystem({ width: canvas.width, height: canvas.height }),
    lifetimeSystem,
    collisionSystem,
    scoreSystem({ pointsPerSec: 30 }),

    renderSystem({ ctx, canvas })
  );

  const pausedSystems = pipe(
    // samo render (da se vidi game over + HUD), bez kretanja/spawna/score
    renderSystem({ ctx, canvas })
  );

  return (world, dt) => {
    // uvek dozvoljen input i restart
    let w = alwaysSystems(world);

    // zamrzavanje igre kada je game over
    const over = w.resources.game?.over === true;
    const timePrev = w.resources.time ?? { t: 0, dt: 0 };
    const timeNext = over
      ? { t: timePrev.t, dt: 0 }
      : { t: timePrev.t + dt, dt };

    w = setResource(w, "time", timeNext);

    return over ? pausedSystems(w) : runningSystems(w);
  };
};

let world = createWorld({ resources: { canvas, ctx } });
world = setResource(world, "fire", { cooldown: 0 });
world = setResource(world, "spawn", { cooldown: 0.8 });
world = spawnPlayer(world, playerStart());

const tick = makeTick({ ctx, canvas, readInput });

let last = performance.now();
const loop = (t) => {
  const dt = Math.min(0.05, (t - last) / 1000);
  last = t;

  world = tick(world, dt);
  requestAnimationFrame(loop);
};

requestAnimationFrame(loop);
