// inputSystem.js
import { setResource } from "../../ecs/world.js";

export const createInputDriver = (canvas, nameInput = null, skinSelect = null) => {
  const keysDown = new Set();
  const buttonsDown = new Set();
  let mouse = { x: 0, y: 0 };

  window.addEventListener(
    "keydown",
    (e) => {
      const typingControl =
        nameInput && (document.activeElement === nameInput || document.activeElement === skinSelect);
      if (typingControl) return;

      keysDown.add(e.code);

      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  window.addEventListener("keyup", (e) => {
    keysDown.delete(e.code);
  });

  const updateMouse = (e) => {
    const r = canvas.getBoundingClientRect();
    mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  canvas.addEventListener("mousemove", updateMouse);

  canvas.addEventListener("mousedown", (e) => {
    updateMouse(e);
    buttonsDown.add(e.button);
  });

  window.addEventListener("mouseup", (e) => {
    buttonsDown.delete(e.button);
  });

  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  return () => ({
    keysDown: [...keysDown],
    mouse,
    buttonsDown: [...buttonsDown],

    // text input (player name)
    text: nameInput?.value ?? "",
    skin: skinSelect?.value ?? "dart",
  });
};

export const inputSystem =
  ({ readInput }) =>
  (world) =>
    setResource(world, "input", readInput());
