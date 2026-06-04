import { entitiesWith, get, removeEntity, setResource } from "../../ecs/world.js";

const aabb = (aPos, aSize, bPos, bSize) =>
  aPos.x < bPos.x + bSize.w &&
  aPos.x + aSize.w > bPos.x &&
  aPos.y < bPos.y + bSize.h &&
  aPos.y + aSize.h > bPos.y;

export const collisionSystem = (world) => {
  if (world.resources.game.over) return world;

  const playerIds = entitiesWith(world, ["Player", "Position", "Size"]);
  const enemyIds = entitiesWith(world, ["Enemy", "Position", "Size"]);
  const bulletIds = entitiesWith(world, ["Bullet", "Position", "Size"]);
  const canvasHeight = world.resources.canvas?.height ?? 720;

  let w = world;

  w = enemyIds.reduce((ww, eid) => {
    const ep = get(ww, "Position", eid);
    return ep.y > canvasHeight + 60 ? removeEntity(ww, eid) : ww;
  }, w);
  const activeEnemyIds = entitiesWith(w, ["Enemy", "Position", "Size"]);

  // 1) Player hit => game over
  if (playerIds.length > 0) {
    const pid = playerIds[0];
    const pp = get(w, "Position", pid);
    const ps = get(w, "Size", pid);

    const playerHit = activeEnemyIds.some((eid) => {
      const ep = get(w, "Position", eid);
      const es = get(w, "Size", eid);
      return aabb(pp, ps, ep, es);
    });

    if (playerHit) {
      return setResource(w, "game", { over: true, reason: "Hit by enemy" });
    }
  }

  // 2) Bullet hits enemy => remove both + score
  const hits = bulletIds.reduce((acc, bid) => {
    const bp = get(w, "Position", bid);
    const bs = get(w, "Size", bid);

    const hitEnemy = activeEnemyIds.find((eid) => {
      const ep = get(w, "Position", eid);
      const es = get(w, "Size", eid);
      return aabb(bp, bs, ep, es);
    });

    return hitEnemy ? acc.concat([{ bid, eid: hitEnemy }]) : acc;
  }, []);

  if (hits.length === 0) return w;

  const enemiesToRemove = [...new Set(hits.map((h) => h.eid))];
  const bulletsToRemove = [...new Set(hits.map((h) => h.bid))];

  w = enemiesToRemove.reduce((ww, eid) => removeEntity(ww, eid), w);
  w = bulletsToRemove.reduce((ww, bid) => removeEntity(ww, bid), w);

  const bonus = enemiesToRemove.length * 50;
  return setResource(w, "score", { value: w.resources.score.value + bonus });
};
