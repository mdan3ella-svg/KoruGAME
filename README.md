# Koru — The Fight for Eden

Extract the archive and open index.html in a WebGL-capable browser. The game, Three.js renderer, loader and animated Koru character are bundled. For static hosting, publish the extracted files together with index.html at the site root.

## Field controls

| Action | Desktop | Touch |
| --- | --- | --- |
| Move | W A S D | Left thumb pad |
| Aim and fire | Aim with the pointer, hold left click | Hold Fire to target the closest hostile |
| Jump | Space | Jump |
| Dash | Shift, with a movement direction or along your aim | Dash, with the pad or along your aim |
| Pause and resume | Escape or the pause button | Pause and Resume |

## Campaign

On the Surface, clear ten hive hosts. In Hive Infiltration, follow the directional readout to three relays. Stand in each ring for 2.4 seconds to bind it before the two-minute timer expires. At the Core, defeat Zyxar before the ninety-second deadline. Watch the expanding red disc. Jump at discharge or move beyond its edge. The Sovereign marks the ground more frequently below half health.

Choose Bastion for an articulated procedural chassis or Koru for the original animated skeletal model. Both use the same movement and damage rules. Dashing consumes neural charge and briefly protects the frame. Each sector restores armour.

## Implementation

index.html contains the base game and embedded copy of koru.glb for local-file launch. eden.js contains the environment, procedural assemblies, weather shaders, frame animation, relay and boss mechanics, audio and touch input. The original GLB is also included for editing. Three.js is distributed under the included vendor license.
