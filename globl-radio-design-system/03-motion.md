# Motion

AGF's physics, unchanged: critically damped, fast then still, no overshoot, `cubic-bezier(0.16, 1, 0.3, 1)` for everything that eases. Globl Radio adds the motions a live service has, and each one means something.

- **The ring turns only when something is live.** The outer dashed ring rotates at 5 rpm (12 s a revolution, linear) while a stream is on air and stops dead when it ends; it does not decelerate, because the broadcast does not. Arming (the minute before air) shows the ring still, in brass. The ring never turns as decoration or as a loading spinner.
- **The lamp breathes.** ON AIR and the ring's lamp breathe at 1.6 s, the same pulse as AGF's live badge. The word never blinks and the lamp never flashes.
- **The waveform draws itself** once when first seen, over 1.8 s on the damped curve, like an AGF frequency curve. While live it scrolls at the speed of the performance and the live head dot stays fixed; it never loops a canned animation.
- **The countdown** changes digits by replacement, not by rolling. At zero it turns `live-text`, the ring starts, and the ON AIR lamp lights, in that order over 300 ms. Nothing celebrates.
- **The play control** fills on hover in 300 ms on the damped curve. Pressing it is instant.
- **Lower thirds** enter by rising 24px and fading over 700 ms on the damped curve, hold, and leave the same way. No wipes, no slides from the edge.
- **Reveal and parallax** follow AGF's rules on the site. The stave does not parallax; it is a ruled line, not a backdrop.
- Under `prefers-reduced-motion: reduce` the ring stops, the lamp holds steady, the waveform renders complete and the countdown still counts, because a clock that stops is wrong.
