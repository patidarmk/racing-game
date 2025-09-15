import React, { useEffect, useRef, useState } from "react";
import PauseMenu from "./PauseMenu";
import { levels } from "./LevelManager";
import { Howl } from "howler";

/**
 * GameCanvas.tsx
 *
 * HTML5 Canvas-based top-down racer renderer and game loop.
 *
 * Tunable constants at the top for easy adjustments.
 */

/* =========== TUNABLE CONSTANTS =========== */
const baseSpawnIntervalMs = 1100;
const baseTrafficSpeed = 160;
const lateralAcceleration = 1400;
const lateralMaxSpeed = 420;
const lateralFriction = 1800;
const tiltSensitivity = 1.8;

const coinRadius = 12;
const playerWidth = 64;
const playerHeight = 110;
/* ========================================= */

type Vec2 = { x: number; y: number };

type Traffic = {
  id: number;
  lane: number;
  pos: Vec2;
  size: { w: number; h: number };
  speed: number;
  color: string;
};

type Coin = { id: number; pos: Vec2 };
type Obstacle = { id: number; pos: Vec2; size: { w: number; h: number } };

type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
};

let idCounter = 1;

export function GameCanvas(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // UI state
  const [paused, setPaused] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [muted, setMuted] = useState(false);
  const [debug, setDebug] = useState(false);
  const [levelIndex, setLevelIndex] = useState(0);

  // Audio refs (do not construct Howl with empty src)
  const engineSoundRef = useRef<Howl | null>(null);
  const coinSoundRef = useRef<Howl | null>(null);
  const crashSoundRef = useRef<Howl | null>(null);

  useEffect(() => {
    // Keep audio refs null by default. If you add valid audio files later,
    // instantiate Howl with real src values.
    engineSoundRef.current = null;
    coinSoundRef.current = null;
    crashSoundRef.current = null;
  }, []);

  // Mutable state for performant RAF loop
  const player = useRef({
    pos: { x: 0, y: 0 },
    velocityX: 0,
    lives: 3,
    shield: 0,
  });

  const world = useRef({
    cameraY: 0,
    distance: 0,
    score: 0,
    spawnTimer: 0,
    spawnInterval: baseSpawnIntervalMs,
    traffic: [] as Traffic[],
    coins: [] as Coin[],
    obstacles: [] as Obstacle[],
    particles: [] as Particle[],
    speedMultiplier: 1,
  });

  const input = useRef({
    left: false,
    right: false,
    tilt: 0,
    touchLastX: 0,
    touchActive: false,
  });

  const lanes = useRef<number[]>([]);

  // Setup canvas DPR scaling & lanes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(100, Math.floor(rect.width * dpr));
      canvas.height = Math.max(100, Math.floor(rect.height * dpr));
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const roadWidth = rect.width * 0.66;
      const centerX = rect.width / 2;
      const laneW = roadWidth / 3;
      lanes.current = [
        centerX - laneW - laneW / 2,
        centerX - laneW / 2,
        centerX + laneW / 2,
      ];

      player.current.pos.x = lanes.current[1] - playerWidth / 2;
      player.current.pos.y = rect.height - playerHeight - 24;
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // DeviceOrientation tilt support (graceful fallback)
  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      if (e.gamma == null) return;
      const gamma = Math.max(-30, Math.min(30, e.gamma));
      input.current.tilt = (gamma / 30) * tiltSensitivity;
    };
    window.addEventListener("deviceorientation", handler);
    return () => window.removeEventListener("deviceorientation", handler);
  }, []);

  // Keyboard handlers
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") input.current.left = true;
      if (k === "arrowright" || k === "d") input.current.right = true;
      if (k === "p") {
        setPaused((p) => {
          const next = !p;
          setShowPauseMenu(next);
          return next;
        });
      }
      if (k === "m") setMuted((m) => !m);
      if (k === "r") restartRun();
      if (k === "d") setDebug((s) => !s);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") input.current.left = false;
      if (k === "arrowright" || k === "d") input.current.right = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // Touch swipe steering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let active = false;
    let lastX = 0;

    const touchStart = (e: TouchEvent) => {
      active = true;
      lastX = e.touches[0].clientX;
    };
    const touchMove = (e: TouchEvent) => {
      if (!active) return;
      const x = e.touches[0].clientX;
      const dx = x - lastX;
      lastX = x;
      if (Math.abs(dx) > 4) {
        input.current.left = dx < 0;
        input.current.right = dx > 0;
        // short debounce to simulate hold
        window.setTimeout(() => {
          input.current.left = false;
          input.current.right = false;
        }, 120);
      }
    };
    const touchEnd = () => {
      active = false;
      input.current.left = false;
      input.current.right = false;
    };

    canvas.addEventListener("touchstart", touchStart, { passive: true });
    canvas.addEventListener("touchmove", touchMove, { passive: true });
    canvas.addEventListener("touchend", touchEnd);
    canvas.addEventListener("touchcancel", touchEnd);

    return () => {
      canvas.removeEventListener("touchstart", touchStart);
      canvas.removeEventListener("touchmove", touchMove);
      canvas.removeEventListener("touchend", touchEnd);
      canvas.removeEventListener("touchcancel", touchEnd);
    };
  }, []);

  // Collision helper
  const rectsOverlap = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) =>
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  // Spawners
  function spawnTraffic() {
    const laneCount = lanes.current.length;
    if (laneCount === 0) return;
    const lane = Math.floor(Math.random() * laneCount);
    const x = lanes.current[lane] - 32;
    const y = -140 - Math.random() * 180;
    const speed =
      baseTrafficSpeed *
      (1 + Math.random() * 0.18) *
      (levels[levelIndex]?.trafficSpeedMultiplier ?? 1) *
      world.current.speedMultiplier;
    const palette = ["#ef4444", "#06b6d4", "#f59e0b", "#10b981", "#a78bfa"];
    const color = palette[Math.floor(Math.random() * palette.length)];
    world.current.traffic.push({
      id: idCounter++,
      lane,
      pos: { x, y },
      size: { w: 64, h: 110 },
      speed,
      color,
    });
  }
  function spawnCoin() {
    const laneCount = lanes.current.length;
    if (laneCount === 0) return;
    const lane = Math.floor(Math.random() * laneCount);
    const x = lanes.current[lane];
    const y = -100 - Math.random() * 160;
    world.current.coins.push({ id: idCounter++, pos: { x, y } });
  }
  function spawnObstacle() {
    const laneCount = lanes.current.length;
    if (laneCount === 0) return;
    const lane = Math.floor(Math.random() * laneCount);
    const x = lanes.current[lane] - 28;
    const y = -120 - Math.random() * 240;
    world.current.obstacles.push({ id: idCounter++, pos: { x, y }, size: { w: 56, h: 28 } });
  }

  // Particles
  function spawnParticles(x: number, y: number, color = "#FFD166", count = 10) {
    for (let i = 0; i < count; i++) {
      world.current.particles.push({
        id: idCounter++,
        x,
        y,
        vx: (Math.random() - 0.5) * 300,
        vy: (Math.random() - 1.5) * 300,
        life: 0.5 + Math.random() * 0.6,
        size: 3 + Math.random() * 6,
        color,
      });
    }
  }

  // Persistence helpers
  function saveHighScore(score: number) {
    try {
      const key = "applaa_racer_high";
      const prev = Number(localStorage.getItem(key) || "0");
      if (score > prev) localStorage.setItem(key, String(score));
    } catch {
      // ignore
    }
  }

  function restartRun() {
    world.current.traffic.length = 0;
    world.current.coins.length = 0;
    world.current.obstacles.length = 0;
    world.current.particles.length = 0;
    world.current.cameraY = 0;
    world.current.distance = 0;
    world.current.score = 0;
    world.current.spawnTimer = 0;
    player.current.velocityX = 0;
    player.current.lives = 3;
    player.current.shield = 0;
    world.current.speedMultiplier = 1;
    lastTimeRef.current = null;
    setPaused(false);
    setShowPauseMenu(false);
  }

  function togglePause() {
    setPaused((p) => {
      const next = !p;
      setShowPauseMenu(next);
      return next;
    });
  }

  // Main loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cameraShake = 0;

    const loop = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = Math.min(40, time - lastTimeRef.current);
      lastTimeRef.current = time;
      const delta = dt / 1000;

      if (!paused) {
        const level = levels[levelIndex] || levels[0];
        world.current.spawnInterval = Math.max(220, baseSpawnIntervalMs / (level.spawnMultiplier || 1));

        // Lateral physics
        let accel = 0;
        if (input.current.left) accel -= lateralAcceleration;
        if (input.current.right) accel += lateralAcceleration;
        accel += (input.current.tilt || 0) * lateralAcceleration;

        player.current.velocityX += accel * delta;

        // friction
        if (!input.current.left && !input.current.right && Math.abs(input.current.tilt) < 0.02) {
          const sign = Math.sign(player.current.velocityX);
          player.current.velocityX -= sign * Math.min(Math.abs(player.current.velocityX), lateralFriction * delta);
        }

        // clamp lateral speed
        if (player.current.velocityX > lateralMaxSpeed) player.current.velocityX = lateralMaxSpeed;
        if (player.current.velocityX < -lateralMaxSpeed) player.current.velocityX = -lateralMaxSpeed;

        // update position
        player.current.pos.x += player.current.velocityX * delta;

        // clamp to road bounds
        if (lanes.current.length > 0) {
          const minX = lanes.current[0] - 120;
          const maxX = lanes.current[lanes.current.length - 1] + 120;
          player.current.pos.x = Math.max(minX, Math.min(maxX, player.current.pos.x));
        }

        // forward speed
        const forwardSpeed = baseTrafficSpeed * world.current.speedMultiplier * (1 + levelIndex * 0.06);
        world.current.cameraY += forwardSpeed * delta;
        world.current.distance += Math.floor(forwardSpeed * delta);
        world.current.score += Math.floor(forwardSpeed * delta * 0.06);

        // spawning
        world.current.spawnTimer += dt;
        if (world.current.spawnTimer >= world.current.spawnInterval) {
          world.current.spawnTimer = 0;
          const spawnCount = Math.random() < 0.18 ? 2 : 1;
          for (let i = 0; i < spawnCount; i++) {
            if (Math.random() < Math.min(0.95, 0.28 + (levels[levelIndex]?.spawnMultiplier || 1) * 0.1)) spawnTraffic();
            if (Math.random() < 0.18 + (levels[levelIndex]?.spawnMultiplier || 1) * 0.02) spawnCoin();
            if (Math.random() < 0.12 + (levels[levelIndex]?.spawnMultiplier || 1) * 0.03) spawnObstacle();
          }
        }

        // update traffic
        for (let i = world.current.traffic.length - 1; i >= 0; i--) {
          const t = world.current.traffic[i];
          t.pos.y += t.speed * delta;
          if (t.pos.y > canvas.height + 200) world.current.traffic.splice(i, 1);
        }

        // coins: movement & collection
        for (let i = world.current.coins.length - 1; i >= 0; i--) {
          const c = world.current.coins[i];
          c.pos.y += forwardSpeed * 0.98 * delta;
          const pRect = { x: player.current.pos.x, y: player.current.pos.y, w: playerWidth, h: playerHeight };
          const cRect = { x: c.pos.x - coinRadius, y: c.pos.y - coinRadius, w: coinRadius * 2, h: coinRadius * 2 };
          if (rectsOverlap(pRect, cRect)) {
            world.current.score += 100;
            spawnParticles(c.pos.x, c.pos.y, "#FFD166", 12);
            if (coinSoundRef.current && !muted) coinSoundRef.current.play();
            world.current.coins.splice(i, 1);
            continue;
          }
          if (c.pos.y > canvas.height + 80) world.current.coins.splice(i, 1);
        }

        // obstacles: movement & collisions
        for (let i = world.current.obstacles.length - 1; i >= 0; i--) {
          const ob = world.current.obstacles[i];
          ob.pos.y += forwardSpeed * delta;
          const pRect = { x: player.current.pos.x, y: player.current.pos.y, w: playerWidth, h: playerHeight };
          const oRect = { x: ob.pos.x, y: ob.pos.y, w: ob.size.w, h: ob.size.h };
          if (rectsOverlap(pRect, oRect)) {
            cameraShake = 6;
            player.current.velocityX *= 0.4;
            player.current.lives -= 1;
            spawnParticles(ob.pos.x + ob.size.w / 2, ob.pos.y + ob.size.h / 2, "#F97316", 16);
            if (crashSoundRef.current && !muted) crashSoundRef.current.play();
            world.current.obstacles.splice(i, 1);
          } else if (ob.pos.y > canvas.height + 120) {
            world.current.obstacles.splice(i, 1);
          }
        }

        // traffic collisions
        for (let i = world.current.traffic.length - 1; i >= 0; i--) {
          const t = world.current.traffic[i];
          const pRect = { x: player.current.pos.x, y: player.current.pos.y, w: playerWidth, h: playerHeight };
          const tRect = { x: t.pos.x, y: t.pos.y, w: t.size.w, h: t.size.h };
          if (rectsOverlap(pRect, tRect)) {
            cameraShake = 8;
            player.current.velocityX *= 0.2;
            player.current.lives -= 1;
            world.current.score = Math.max(0, world.current.score - 200);
            if (crashSoundRef.current && !muted) crashSoundRef.current.play();
            spawnParticles(t.pos.x + t.size.w / 2, t.pos.y + t.size.h / 2, "#EF4444", 18);
            world.current.traffic.splice(i, 1);
          }
        }

        // particles update
        for (let i = world.current.particles.length - 1; i >= 0; i--) {
          const pr = world.current.particles[i];
          pr.life -= delta;
          pr.x += pr.vx * delta;
          pr.y += pr.vy * delta;
          pr.vy += 400 * delta;
          if (pr.life <= 0) world.current.particles.splice(i, 1);
        }

        // level progression
        if (world.current.distance > (levelIndex + 1) * 3000 && levelIndex < levels.length - 1) {
          setLevelIndex((li) => Math.min(li + 1, levels.length - 1));
          world.current.speedMultiplier += 0.12;
          spawnParticles(player.current.pos.x + playerWidth / 2, player.current.pos.y + 20, "#60A5FA", 20);
        }

        if (player.current.lives <= 0) {
          setPaused(true);
          setShowPauseMenu(true);
          saveHighScore(world.current.score);
        }
      } // end paused

      // render
      renderFrame(ctx, canvas, cameraShake);
      cameraShake *= 0.9;

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, muted, levelIndex]);

  // ---------- Rendering helpers ----------
  function renderFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, camShake: number) {
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, w, h);

    const level = levels[levelIndex] || levels[0];

    // background gradient
    const g = ctx.createLinearGradient(0, 0, 0, h);
    switch (level.theme) {
      case "desert":
        g.addColorStop(0, "#fffbeb");
        g.addColorStop(1, "#fee2b3");
        break;
      case "forest":
        g.addColorStop(0, "#071b11");
        g.addColorStop(1, "#044d3b");
        break;
      case "night":
        g.addColorStop(0, "#020617");
        g.addColorStop(1, "#071024");
        break;
      case "snow":
        g.addColorStop(0, "#f8fafc");
        g.addColorStop(1, "#e6f0ff");
        break;
      case "neon":
        g.addColorStop(0, "#0b1220");
        g.addColorStop(1, "#09142a");
        break;
      default:
        g.addColorStop(0, "#071024");
        g.addColorStop(1, "#021025");
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    const roadW = w * 0.66;
    const roadX = (w - roadW) / 2;
    drawRoad(ctx, roadX, 0, roadW, h);
    drawRoadside(ctx, roadX, roadW, h, level.theme);

    ctx.save();
    ctx.translate((Math.random() - 0.5) * camShake, (Math.random() - 0.5) * camShake);

    // draw world objects
    for (const t of world.current.traffic) drawCar(ctx, t.pos.x, t.pos.y, t.size.w, t.size.h, t.color);
    for (const c of world.current.coins) drawCoin(ctx, c.pos.x, c.pos.y);
    for (const ob of world.current.obstacles) drawObstacle(ctx, ob.pos.x, ob.pos.y, ob.size.w, ob.size.h);
    drawPlayer(ctx, player.current.pos.x, player.current.pos.y, playerWidth, playerHeight);

    // particles
    for (const pr of world.current.particles) {
      ctx.globalAlpha = Math.max(0, pr.life);
      ctx.fillStyle = pr.color;
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, pr.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.restore();

    // HUD
    drawCanvasHUD(ctx, w, h);
    if (debug) drawDebug(ctx, w, h);
  }

  function drawRoad(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
    ctx.fillStyle = "#111827";
    ctx.fillRect(x, y, width, height);
    const laneCount = 3;
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 2;
    for (let i = 1; i < laneCount; i++) {
      const lx = x + (width / laneCount) * i;
      ctx.setLineDash([18, 22]);
      ctx.beginPath();
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx, height);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fillRect(x - 8, 0, 8, height);
    ctx.fillRect(x + width, 0, 8, height);
  }

  function drawRoadside(ctx: CanvasRenderingContext2D, roadX: number, roadW: number, h: number, theme: string) {
    const left = roadX - 120;
    const right = roadX + roadW + 40;
    for (let i = -2; i < 20; i++) {
      const vy = ((i * 260) + (world.current.cameraY * 0.2)) % (h + 400);
      drawProp(ctx, left + Math.sin(i) * 6, vy, theme);
      drawProp(ctx, right + Math.cos(i) * 6, vy + 60, theme);
    }
  }

  function drawProp(ctx: CanvasRenderingContext2D, x: number, y: number, theme: string) {
    ctx.save();
    if (theme === "forest") {
      ctx.fillStyle = "#14532d";
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 18, y + 36);
      ctx.lineTo(x - 18, y + 36);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#5b3e1b";
      ctx.fillRect(x - 3, y + 36, 6, 10);
    } else if (theme === "desert") {
      ctx.fillStyle = "#a16207";
      ctx.beginPath();
      ctx.ellipse(x, y + 12, 18, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (theme === "city" || theme === "neon") {
      ctx.fillStyle = theme === "neon" ? "#7c3aed" : "#334155";
      ctx.fillRect(x - 14, y, 28, 60);
      ctx.fillStyle = "#fde68a";
      ctx.fillRect(x - 8, y + 8, 6, 8);
      ctx.fillRect(x + 2, y + 8, 6, 8);
    } else {
      ctx.fillStyle = "#6b7280";
      ctx.fillRect(x - 6, y, 12, 24);
    }
    ctx.restore();
  }

  function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawCar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h - 6, w * 0.5, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    roundRectPath(ctx, x, y, w, h, 8);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.12)";
    roundRectPath(ctx, x + 10, y + 12, w - 20, h * 0.35, 6);
    ctx.fill();

    ctx.fillStyle = "#111827";
    ctx.fillRect(x + 10, y + h - 12, 12, 6);
    ctx.fillRect(x + w - 22, y + h - 12, 12, 6);
    ctx.restore();
  }

  function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.save();
    ctx.fillStyle = "rgba(96,165,250,0.06)";
    ctx.fillRect(x - 6, y - 6, w + 12, h + 12);
    drawCar(ctx, x, y, w, h, "#06b6d4");
    ctx.restore();
  }

  function drawCoin(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
    ctx.save();
    const g = ctx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, coinRadius);
    g.addColorStop(0, "#fff6d6");
    g.addColorStop(0.2, "#ffd166");
    g.addColorStop(1, "#f59e0b");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, coinRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  function drawObstacle(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.save();
    ctx.fillStyle = "#f97316";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#92400e";
    ctx.fillRect(x + 6, y + 6, w - 12, h - 12);
    ctx.restore();
  }

  function drawCanvasHUD(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const pad = 16;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(pad - 8, pad - 8, 260, 92);
    ctx.fillStyle = "#fff";
    ctx.font = "18px Inter, system-ui, sans-serif";
    ctx.fillText(`Score: ${world.current.score}`, pad, pad + 22);
    ctx.fillText(`Distance: ${world.current.distance} m`, pad, pad + 46);
    ctx.fillText(`Level: ${levelIndex + 1} (${levels[levelIndex]?.name})`, pad, pad + 70);

    for (let i = 0; i < Math.max(0, player.current.lives); i++) {
      ctx.fillStyle = "#ff6b6b";
      ctx.beginPath();
      ctx.arc(w - 24 - i * 20, pad + 12, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = muted ? "#9ca3af" : "#60a5fa";
    ctx.fillRect(w - 120, pad + 6, 8, 8);
    ctx.restore();
  }

  function drawDebug(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(12, h - 96, 260, 84);
    ctx.fillStyle = "#fff";
    ctx.font = "12px monospace";
    ctx.fillText(`Traffic: ${world.current.traffic.length}  Coins: ${world.current.coins.length}  Obstacles: ${world.current.obstacles.length}`, 20, h - 72);
    ctx.fillText(`Particles: ${world.current.particles.length}`, 20, h - 56);
    ctx.fillText(`VelX: ${player.current.velocityX.toFixed(1)}`, 20, h - 40);
    ctx.fillText(`Distance: ${world.current.distance}`, 20, h - 24);
    ctx.restore();
  }

  // Component JSX
  return (
    <div className="w-full h-[420px] md:h-[640px] relative bg-black/5 rounded-lg overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          className="px-3 py-1 rounded-md bg-white/6 text-white text-sm"
          onClick={() => {
            setMuted((m) => !m);
          }}
        >
          {muted ? "Unmute" : "Mute"}
        </button>

        <button
          className="px-3 py-1 rounded-md bg-white/6 text-white text-sm"
          onClick={() => {
            setDebug((d) => !d);
          }}
        >
          {debug ? "Hide Debug" : "Debug"}
        </button>

        <button
          className="px-3 py-1 rounded-md bg-applaa-blue text-white text-sm"
          onClick={() => {
            setPaused((p) => {
              const next = !p;
              setShowPauseMenu(next);
              return next;
            });
          }}
        >
          {paused ? "Resume" : "Pause"}
        </button>
      </div>

      {/* Pause Menu overlay (React) */}
      {showPauseMenu && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="pointer-events-auto">
            <PauseMenu
              isOpen={showPauseMenu}
              onResume={() => {
                setPaused(false);
                setShowPauseMenu(false);
              }}
              onRestart={() => {
                restartRun();
              }}
              onLevelSelect={() => {
                setShowPauseMenu(false);
                setPaused(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default GameCanvas;