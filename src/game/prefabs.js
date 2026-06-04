import { createEntity, addComponent } from "../ecs/world.js";
import { Position, Velocity, Size, Color, Player } from "./components.js";

export const spawnPlayer = (world, { x, y } = { x: 40, y: 40 }) => {
  let w = world;
  let id;
  [w, id] = createEntity(w);

  w = addComponent(w, "Player", id, Player());
  w = addComponent(w, "Position", id, Position(x, y));
  w = addComponent(w, "Velocity", id, Velocity(0, 0));
  w = addComponent(w, "Size", id, Size(44, 48));
  w = addComponent(w, "Color", id, Color("#77e8ff"));

  return w;
};
