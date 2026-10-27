# Motion

High-end audio equipment never bounces. A VU needle, a motorised fader and a relay all settle with critical damping: fast, then still, with no overshoot. Every motion in the system uses the same physics.

- **The curve** is `cubic-bezier(0.16, 1, 0.3, 1)`, exposed as `--ease-damped` in `components/bundle.css`. Nothing uses `ease-in-out`, `bounce` or a spring with overshoot.
- **Reveal**: content enters as it reaches the viewport by rising `space-24` (24px) and fading from 0 to 1 over 700ms on the damped curve; children stagger 60ms. Patient and cinematic; never more than one reveal group in motion at once.
- **Parallax**: the hero background drifts at 0.6× scroll and the foreground at 1×; nothing moves faster than the page.
- **Orbital rings** turn continuously at 0.5 rpm (120s a revolution, linear) behind a Readout or scope; on hover they accelerate smoothly to 6 rpm over 1.2s on the damped curve and relax back the same way.
- **Stroke draws**: gauges fill, frequency curves draw themselves and roadmaps trace their path with `stroke-dashoffset` over 1.2-1.8s on the damped curve, once, when first seen; never on loop.
- **Meters** update at 30 fps with a 300ms peak-hold and a 1.5s decay; the clip segment latches for 2s. Needles in a VU style use the damped curve over 300ms.
- **Controls**: hover and focus transitions are 300ms on the damped curve; the primary button's glow fades in over the same. Lamps switch instantly; a lamp that eases is a lie about the circuit.
- **ON AIR** pulses the badge lamp at 1.6s; the badge itself never blinks.
- Under `prefers-reduced-motion: reduce` the rings, pulse and parallax stop, reveals become fades of 200ms and stroke draws render complete.
