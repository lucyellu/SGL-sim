# SGL Telescope Simulator

Welcome to the **Solar Gravitational Lens (SGL) Simulator**! This is an interactive web-based physics sandbox that demonstrates one of the most mind-bending concepts in modern astrophysics: using our Sun as a giant, galactic-scale magnifying glass to image alien worlds.

## What is a Solar Gravitational Lens?

Albert Einstein's Theory of General Relativity predicts that massive objects bend the fabric of spacetime. When light from a distant star or planet passes near the edge of our Sun, the Sun's immense gravity bends those light rays inward, focusing them to a point deep in interstellar space.

This focal line begins at approximately **542 Astronomical Units (AU)** away from the Sun (about 14 times further than Pluto). If we were to send a fleet of telescopes out to 542 AU and look back toward the Sun, the light of an exoplanet perfectly aligned behind the Sun would be magnified by up to **~100 Billion times**. This would allow us to reconstruct a high-resolution, pixel-by-pixel image of the alien planet's surface—resolving continents, oceans, and potentially city lights on worlds tens of lightyears away.

## Features

- **True-to-Scale Physics Engine:** Explore the Solar System and nearby star systems in a massive 3D environment, mapped accurately to real-world Right Ascension and Lightyear distances.
- **Focal Plane Scanning:** Try your hand at manually aligning the telescope! The focal region of an SGL is only about 1 meter wide. If your telescope drifts even slightly, the image blurs into oblivion.
- **String of Pearls:** Simulate deploying a swarm of telescopes to collect and reconstruct the light rays.
- **Alien Lens Mode (Inversion):** What if aliens are looking back at us? Toggle Inversion Mode to see what the physics look like if an alien civilization uses their own star to look at Earth. Watch as Earth resolves into a detailed 3D mesh when you hit their exact focal distance!

## Screenshots

*(Please place your screenshots in a `screenshots` folder to display them here!)*
![Earth Lens Mode](screenshots/screenshot1.png)
![Alien Lens Mode - Earth](screenshots/screenshot2.png)
![Telemetry & Optics](screenshots/screenshot3.png)

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
4. Use the joystick to perfectly align the telescope on the (0,0) axis to clear up the image reconstruction!

## The Physics of Alien Lenses

Different stars have different masses and radii, which drastically changes where their focal line begins. 
- **Proxima Centauri** is a small red dwarf. Its gravity is weaker, but its radius is so small that its focal line starts at just **~95 AU**. It would be much easier for them to build an SGL telescope!
- **Sirius A** is a massive, bright star. Its focal line is pushed all the way out to **~760 AU**. 

*SGL Simulator was built with React, Three.js, and React-Three-Fiber.*
