export const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((v, f) => f(v), x);

export const clamp = (min, max, v) => Math.max(min, Math.min(max, v));

export const setInMap = (map, key, value) => {
  const m = new Map(map);
  m.set(key, value);
  return m;
};

export const deleteFromMap = (map, key) => {
  if (!map.has(key)) return map;
  const m = new Map(map);
  m.delete(key);
  return m;
};

export const uniqueId = (nextId) => nextId;

export const nowMs = () => performance.now();
