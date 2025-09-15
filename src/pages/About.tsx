import React from 'react';

export default function About() {
  return (
    <div className="prose prose-invert max-w-none">
      <h2>About Applaa Racer</h2>
      <p>Applaa Racer is a demo-grade top-down racing game built with React and HTML5 Canvas focused on smooth physics, crisp rendering, and a premium UI.</p>

      <h3>Team</h3>
      <ul>
        <li><strong>Ava Martinez</strong> — Lead Artist (procedural sprites & visual polish)</li>
        <li><strong>Diego Chen</strong> — Lead Engineer (game loop, physics, performance)</li>
        <li><strong>Ravi Patel</strong> — UI/UX (HUD, menus, accessibility)</li>
      </ul>

      <h3>Mission</h3>
      <p>Deliver a compact, maintainable Canvas game architecture that separates rendering/physics from React UI, with straightforward tuning points for spawn rates and difficulty.</p>
    </div>
  );
}