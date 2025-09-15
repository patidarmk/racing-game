# Applaa Top-down Racer (Vite + React + Canvas)

Run:
1. npm install
2. npm run dev
3. Open http://localhost:5173

Notes:
- Game constants (spawnRate, trafficSpeed, lateralAcceleration, friction, tilt sensitivity) are placed near the top of src/components/GameCanvas.tsx with comments for tuning.
- Levels are defined in src/components/LevelManager.tsx — six progressive themes exist: City, Desert, Forest, Night, Snow, Neon.
- Use the Pause menu to Restart or change levels.
- High scores and unlocked levels are stored in localStorage under `applaa_racer`.
- If DeviceOrientation isn't available, swipe controls are used on mobile.
- Sounds use Howler (optional) and can be muted from the HUD.