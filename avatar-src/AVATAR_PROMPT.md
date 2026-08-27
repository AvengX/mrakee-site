# Assistant avatar — the four prompts

The character already exists. Every prompt below is **image-to-image**:
attach the approved concierge render, and change the ONE thing named.

Never re-describe her from scratch. Three descriptions produce three
people who look related — which is the single failure that makes a
swapped-pose avatar fall apart, because the whole illusion is that it is
one person changing expression.

Keep this line at the top of all four:

> Same 3D character, same face, same hair, same dark navy uniform with
> the gold trim and the small gold "M" pin, same skin tone, same
> lighting, same rendering style and same colour grade as the attached
> image. Do not restyle, re-age or redesign her.

---

## 1. `greeter.png` — the namaste, full figure

Shown uncropped at 190–340px in the corner of every page. The only file
where hands exist.

> …change only the hands, arms and framing.
>
> She holds both palms pressed flat together in front of her chest in a
> namaste greeting, fingers pointing upward, elbows relaxed and slightly
> away from the body. Warm and welcoming, looking directly at the
> viewer with the same soft smile.
>
> Framing: full upper body, from the top of the head to below the
> waist, so the hands and the whole gesture sit well inside the frame
> with clear space around them. Portrait orientation, about 3:4,
> 768 x 1024 or larger.
>
> Background: fully transparent. No backdrop, no circle, no floor, no
> shadow, no border — the figure alone on transparency, cut out cleanly
> at every edge including the gaps between her arms and her body.

## 2. `avatar-idle.png` — resting

Shown at 44px, cropped to a circle. The face has to be large.

> …change only the framing and the expression.
>
> Head and shoulders only, centred, facing the viewer. The head fills
> about 55% of the image height, shoulders cropped by the bottom edge,
> generous even margin all round — the image will be cropped to a
> circle, so keep everything important well inside the centre circle.
>
> Expression: mouth closed in a soft natural smile, both eyes open and
> looking at the viewer, eyebrows relaxed.
>
> Square image, 512 x 512, filled edge to edge with a solid off-white
> (#f7f8f6) background and a soft teal (#33c7c7) glow behind her head.
> Not transparent.

## 3. `avatar-listening.png` — attentive

> …same head-and-shoulders framing as the idle image, same background,
> same scale — change only the expression.
>
> Head tilted very slightly to one side, eyebrows raised a little in
> attentive interest, eyes open slightly wider and focused on the
> viewer, mouth closed in a small smile. It should read as "I am
> listening to you."

## 4. `avatar-answering.png` — speaking

This one alternates with the idle frame while the voice runs, so **only
the mouth may differ**. If the head moves between the two, the swap
reads as a twitch instead of speech.

> …same head-and-shoulders framing as the idle image, same background,
> same scale, same head angle, same eye direction — change only the
> mouth.
>
> Mouth open in a natural mid-sentence speaking shape, eyebrows very
> slightly lifted. Everything else identical to the idle image.

---

## Checks before any of them ship

**Transparency, on greeter.png only.** Open it over something dark.
Generators routinely return a white background that looks transparent on
a white page and becomes a hard rectangle the moment it sits over the
film or a teal band. The gaps between her arms and her torso are the
most commonly missed holes; filled, the namaste reads as a blob.

**Look at them at final size, not full size.** The three head-and-
shoulders files are seen at 44px and the greeter at about 200px. If you
cannot tell idle from listening at 44px, push the mouth and brows
harder — the difference has to survive the downscale, and a pose change
will not, which is why none of these ask for one.

**Idle and answering must line up.** Flick between them at full size.
Only the mouth should move.

**No text anywhere** — no badge, no name tag. Lettering at these sizes
renders as noise.

## Where they go

All four into `public/assistant/`. The site picks them up on its own and
falls back to the drawn SVG for any that are missing, so they can be
added one at a time.
