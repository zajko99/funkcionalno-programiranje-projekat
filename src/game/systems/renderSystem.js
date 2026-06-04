import { entitiesWith, get, has } from "../../ecs/world.js";

const fract = (x) => x - Math.floor(x);
const hash2 = (n) => {
  const x = fract(Math.sin(n * 127.1) * 43758.5453123);
  const y = fract(Math.sin(n * 311.7) * 12578.1459123);
  return { x, y };
};

const clamp = (min, max, v) => Math.max(min, Math.min(max, v));

const roundedRectPath = (ctx, x, y, w, h, r) => {
  const rr = clamp(0, Math.min(w, h) / 2, r);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
};

const drawShipBody = (ctx, size, skin) => {
  if (skin === "wing") {
    ctx.beginPath();
    ctx.moveTo(size * 1.02, 0);
    ctx.lineTo(-size * 0.32, -size * 1.02);
    ctx.lineTo(-size * 0.08, -size * 0.22);
    ctx.lineTo(-size * 0.78, -size * 0.36);
    ctx.lineTo(-size * 0.48, 0);
    ctx.lineTo(-size * 0.78, size * 0.36);
    ctx.lineTo(-size * 0.08, size * 0.22);
    ctx.lineTo(-size * 0.32, size * 1.02);
    ctx.closePath();
    return;
  }

  if (skin === "orbiter") {
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.86, size * 0.62, 0, 0, Math.PI * 2);
    ctx.moveTo(size * 1.2, 0);
    ctx.lineTo(size * 0.56, -size * 0.32);
    ctx.lineTo(size * 0.56, size * 0.32);
    ctx.closePath();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(size * 1.12, 0);
  ctx.lineTo(-size * 0.55, -size * 0.82);
  ctx.lineTo(-size * 0.28, 0);
  ctx.lineTo(-size * 0.55, size * 0.82);
  ctx.closePath();
};

const drawPlayer = (ctx, cx, cy, size, angle, t, skin = "dart") => {
  const pulse = 0.5 + 0.5 * Math.sin(t * 7.0);
  const glow = 14 + pulse * 12;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  ctx.shadowColor = "rgba(119, 232, 255, 0.42)";
  ctx.shadowBlur = glow;

  const g = ctx.createLinearGradient(-size, -size, size, size);
  g.addColorStop(0, "rgba(255, 255, 255, 0.98)");
  g.addColorStop(0.42, "rgba(119, 232, 255, 0.94)");
  g.addColorStop(1, "rgba(76, 111, 255, 0.9)");

  ctx.fillStyle = g;
  ctx.strokeStyle = "rgba(255,255,255,0.42)";
  ctx.lineWidth = 1.5;

  drawShipBody(ctx, size, skin);
  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(8, 12, 44, 0.72)";
  ctx.lineWidth = 2.4;
  if (skin === "orbiter") {
    ctx.beginPath();
    ctx.ellipse(-size * 0.08, 0, size * 0.36, size * 0.23, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(size * 0.5, 0);
    ctx.lineTo(-size * 0.18, 0);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.shadowColor = "rgba(255, 218, 105, 0.58)";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(skin === "orbiter" ? -size * 0.08 : -size * 0.04, 0, 2.5, 0, Math.PI * 2);
  ctx.fill();

  if (skin !== "orbiter") {
    ctx.shadowColor = "rgba(255, 106, 61, 0.68)";
    ctx.shadowBlur = 12 + pulse * 8;
    ctx.fillStyle = "rgba(255, 126, 56, 0.9)";
    ctx.beginPath();
    ctx.moveTo(-size * 0.6, -size * 0.18);
    ctx.lineTo(-size * 1.02, 0);
    ctx.lineTo(-size * 0.6, size * 0.18);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(10, 18, 55, 0.74)";
    ctx.beginPath();
    ctx.ellipse(size * 0.18, 0, size * 0.22, size * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

const drawEnemy = (ctx, cx, cy, r, t, idx) => {
  const bob = Math.sin(t * 4.2 + idx) * r * 0.14;
  const flap = Math.sin(t * 9 + idx) * 0.55;
  const tilt = Math.sin(t * 2.4 + idx) * 0.18;

  ctx.save();
  ctx.translate(cx, cy + bob);
  ctx.rotate(tilt);

  ctx.shadowColor = "rgba(255, 218, 105, 0.35)";
  ctx.shadowBlur = 12;

  ctx.fillStyle = "rgba(255, 246, 220, 0.96)";
  ctx.strokeStyle = "rgba(123, 83, 42, 0.72)";
  ctx.lineWidth = 1.4;

  ctx.beginPath();
  ctx.ellipse(0, r * 0.08, r * 0.78, r * 0.86, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  ctx.beginPath();
  ctx.ellipse(-r * 0.52, r * 0.08, r * 0.28, r * 0.46, -0.7 - flap * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(r * 0.52, r * 0.08, r * 0.28, r * 0.46, 0.7 + flap * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 74, 57, 0.95)";
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.arc(i * r * 0.18, -r * 0.78, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(255, 185, 42, 0.96)";
  ctx.beginPath();
  ctx.moveTo(r * 0.05, -r * 0.22);
  ctx.lineTo(r * 0.68, -r * 0.1);
  ctx.lineTo(r * 0.05, r * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#1b1730";
  ctx.beginPath();
  ctx.arc(-r * 0.24, -r * 0.26, r * 0.08, 0, Math.PI * 2);
  ctx.arc(r * 0.16, -r * 0.26, r * 0.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 185, 42, 0.82)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-r * 0.22, r * 0.85);
  ctx.lineTo(-r * 0.36, r * 1.04);
  ctx.moveTo(-r * 0.22, r * 0.85);
  ctx.lineTo(-r * 0.08, r * 1.04);
  ctx.moveTo(r * 0.22, r * 0.85);
  ctx.lineTo(r * 0.08, r * 1.04);
  ctx.moveTo(r * 0.22, r * 0.85);
  ctx.lineTo(r * 0.36, r * 1.04);
  ctx.stroke();

  ctx.shadowBlur = 0;

  ctx.restore();
};

const drawBullet = (ctx, cx, cy, t) => {
  const pulse = 0.5 + 0.5 * Math.sin(t * 9.0);
  ctx.save();
  ctx.shadowColor = "rgba(255, 58, 95, 0.72)";
  ctx.shadowBlur = 16 + pulse * 10;
  const g = ctx.createLinearGradient(cx, cy - 12, cx, cy + 12);
  g.addColorStop(0, "rgba(255, 255, 255, 0.98)");
  g.addColorStop(0.45, "rgba(255, 218, 105, 0.98)");
  g.addColorStop(1, "rgba(255, 58, 95, 0.96)");
  ctx.strokeStyle = g;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 9);
  ctx.lineTo(cx, cy + 9);
  ctx.stroke();
  ctx.restore();
};

const drawCrosshair = (ctx, x, y, t) => {
  const pulse = 0.5 + 0.5 * Math.sin(t * 5.0);
  const rOuter = 16 + pulse * 2;
  const rInner = 5 + pulse;

  ctx.save();
  ctx.translate(x, y);

  ctx.shadowColor = "rgba(255, 218, 105, 0.52)";
  ctx.shadowBlur = 12;

  ctx.fillStyle = "rgba(255, 218, 105, 0.16)";
  ctx.beginPath();
  ctx.arc(0, 0, rOuter, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 218, 105, 0.86)";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, 0, rOuter, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(119, 232, 255, 0.84)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-rOuter - 7, 0);
  ctx.lineTo(-rInner, 0);
  ctx.moveTo(rInner, 0);
  ctx.lineTo(rOuter + 7, 0);
  ctx.moveTo(0, -rOuter - 7);
  ctx.lineTo(0, -rInner);
  ctx.moveTo(0, rInner);
  ctx.lineTo(0, rOuter + 7);
  ctx.stroke();

  ctx.shadowBlur = 8;
  ctx.fillStyle = "rgba(255, 106, 61, 0.92)";
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

const drawAimBeam = (ctx, ax, ay, bx, by, t) => {
  ctx.save();
  ctx.globalAlpha = 0.9;

  const g = ctx.createLinearGradient(ax, ay, bx, by);
  g.addColorStop(0, "rgba(255, 218, 105, 0.0)");
  g.addColorStop(0.35, "rgba(255, 218, 105, 0.3)");
  g.addColorStop(0.75, "rgba(119, 232, 255, 0.22)");
  g.addColorStop(1, "rgba(255, 218, 105, 0.0)");

  ctx.strokeStyle = g;
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 12]);
  ctx.lineDashOffset = -(t * 140) % 22;

  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.restore();
};

export const renderSystem =
  ({ ctx, canvas }) =>
  (world) => {
    const { over } = world.resources.game;
    const t = world.resources.time?.t ?? 0;

    // background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bg.addColorStop(0, "rgba(7, 10, 42, 1)");
    bg.addColorStop(0.48, "rgba(14, 18, 74, 1)");
    bg.addColorStop(1, "rgba(50, 18, 68, 1)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const planetX = canvas.width * 0.78;
    const planetY = canvas.height * 0.2;
    const planetR = Math.min(canvas.width, canvas.height) * 0.16;
    ctx.save();
    const planet = ctx.createRadialGradient(
      planetX - planetR * 0.35,
      planetY - planetR * 0.35,
      planetR * 0.1,
      planetX,
      planetY,
      planetR
    );
    planet.addColorStop(0, "rgba(255, 247, 184, 0.28)");
    planet.addColorStop(0.45, "rgba(255, 138, 89, 0.18)");
    planet.addColorStop(1, "rgba(255, 138, 89, 0)");
    ctx.fillStyle = planet;
    ctx.beginPath();
    ctx.arc(planetX, planetY, planetR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const count = 150;
    for (let i = 0; i < count; i++) {
      const h = hash2(i + 1);
      const speed = 22 + (i % 8) * 10;

      const x = (h.x * canvas.width + t * speed * 0.25) % canvas.width;
      const y = (h.y * canvas.height + t * speed) % canvas.height;

      const r = 0.7 + (i % 4) * 0.38;
      const a = 0.16 + (i % 6) * 0.045;

      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(119,232,255,0.025)";
    for (let y = 0; y < canvas.height; y += 5) ctx.fillRect(0, y, canvas.width, 1);

    // vignette
    const vg = ctx.createRadialGradient(
      canvas.width * 0.5,
      canvas.height * 0.5,
      Math.min(canvas.width, canvas.height) * 0.2,
      canvas.width * 0.5,
      canvas.height * 0.5,
      Math.max(canvas.width, canvas.height) * 0.75
    );
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Entities
    const ids = entitiesWith(world, ["Position", "Size"]);
    let enemyIndex = 0;

    ids.forEach((id) => {
      const p = get(world, "Position", id);
      const s = get(world, "Size", id);

      const cx = p.x + s.w / 2;
      const cy = p.y + s.h / 2;

      if (has(world, "Player", id)) {
        const skin = world.resources.input?.skin ?? "wing";
        drawPlayer(ctx, cx, cy, Math.max(s.w, s.h) * 0.62, -Math.PI / 2, t, skin);
        return;
      }

      if (has(world, "Enemy", id)) {
        drawEnemy(ctx, cx, cy, Math.max(s.w, s.h) * 0.58, t, enemyIndex++);
        return;
      }

      if (has(world, "Bullet", id)) {
        drawBullet(ctx, cx, cy, t);
        return;
      }

      // fallback
      if (has(world, "Color", id)) {
        const c = get(world, "Color", id);
        ctx.fillStyle = c;
        ctx.fillRect(p.x, p.y, s.w, s.h);
      }
    });

    // HUD
    ctx.save();
    ctx.font = "800 15px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    ctx.shadowColor = "rgba(255, 218, 105, 0.36)";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "rgba(242, 249, 239, 0.9)";

    const playerName = (world.resources.input?.text ?? "").trim();

    ctx.textAlign = "right";
    ctx.fillText(`PILOT: ${playerName || "IGRAC 1"}`, canvas.width - 16, 64);
    ctx.textAlign = "start";

    const tg = ctx.createLinearGradient(0, 0, 220, 0);
    tg.addColorStop(0, "rgba(255, 218, 105, 0.98)");
    tg.addColorStop(0.55, "rgba(119, 232, 255, 0.98)");
    tg.addColorStop(1, "rgba(255, 106, 61, 0.96)");

    ctx.fillStyle = tg;
    ctx.fillText(`REZULTAT: ${world.resources.score.value}`, 18, canvas.height - 18);

    if (over) {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 25;
      ctx.fillStyle = "rgba(8, 11, 45, 0.78)";
      roundedRectPath(ctx, cx - 240, cy - 110, 480, 210, 6);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 218, 105, 0.34)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      ctx.font = "900 42px ui-sans-serif, system-ui, sans-serif";
      ctx.shadowColor = "rgba(255, 106, 61, 0.34)";
      ctx.shadowBlur = 16;
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fillText("Igra Gotova", cx, cy - 35);

      ctx.font = "650 16px ui-sans-serif, system-ui, sans-serif";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "rgba(255,255,255,0.72)";
      ctx.fillText(`Konacan rezultat: ${world.resources.score.value}`, cx, cy + 12);
      ctx.fillText("Pritisni R za novu igru", cx, cy + 38);

      ctx.textAlign = "start";
      ctx.textBaseline = "alphabetic";
    }

    ctx.restore();
    return world;
  };
