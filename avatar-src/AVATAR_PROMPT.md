# Assistant avatar — design prompt

Three PNGs that drop into `public/assistant/`:

| File | Used for |
|---|---|
| `avatar-idle.png` | resting, and any unknown state |
| `avatar-listening.png` | listening — **and reused for thinking** |
| `avatar-answering.png` | speaking a reply |

`AssistantAvatar.jsx` picks these up automatically if present and falls
back to the drawn SVG if not. No code change is needed to adopt them.

## Constraints the artwork cannot violate

These come from how the component actually renders, not from taste.

* **Square canvas, 512 × 512 px, PNG.** Displayed at 84 css px, so 512
  covers 3× HiDPI with room to spare.
* **It is clipped to a circle.** `border-radius: 50%` is on the `img`.
  Corners are cut. Everything that matters lives inside the inscribed
  circle, and nothing important comes within 40px of that circle's edge.
* **Fill the frame — do not deliver it on transparency.** The circle
  should read as a solid medallion sitting on the card. A transparent
  background makes the crop look like a cut-out.
* **Head and shoulders, not waist-up.** This is the one that decides
  whether the thing works. At 84px a waist-up figure's face is about
  20px across and reads as a smudge. The face should fill roughly 55% of
  the circle's height.
* **The three poses must differ in the FACE.** A raised hand at this
  size is six pixels. Gesture is invisible here; mouth, brows and gaze
  are not.
* **No text, no logos, no readable badge or lanyard.** Lettering at this
  scale renders as noise, and an invented company marking is worse than
  none.
* **No thin linework and no fine gradients.** Nothing under 3px at 512,
  or it vanishes on downscale. Flat fills survive; soft gradients band.

## Palette — the client's brand board, exact values

    Deep Teal        #006f73     primary, good for the garment
    Teal             #00a0a0     secondary
    Teal light       #33c7c7     highlights
    Premium Gold     #d8a32a     accent — trim, small details
    Gold light       #ffe08a     accent highlight
    Off White        #f7f8f6     background field
    Executive Dark   #0b1f2a     hair, outlines, deepest shadow

Corporate Red `#c81010` is reserved by the board for alerts. Keep it out
of the avatar.

## The base prompt — generate this one FIRST

> A flat vector illustration portrait of a friendly professional
> concierge, head and shoulders, facing the viewer straight on, centred
> in a square frame.
>
> Style: clean modern flat vector, of the kind used on airport and hotel
> self-service kiosks. Solid colour fills, gentle rounded shapes, minimal
> shading, confident simple shapes with no fine detail. Warm and
> approachable rather than corporate-stiff. Not 3D, not photorealistic,
> not a cartoon mascot, no outline sketchiness.
>
> Character: a South Asian adult with warm mid-brown skin, neat dark
> hair (#0b1f2a), and a calm, welcoming expression. They wear a smart
> deep teal (#006f73) collared uniform jacket with a thin premium gold
> (#d8a32a) trim line along the collar. No badge, no name tag, no text
> anywhere.
>
> Background: a solid off-white (#f7f8f6) field filling the entire
> square, with a soft teal (#33c7c7) circular glow behind the head.
> No border, no frame, no drop shadow on the frame edge.
>
> Framing: the head occupies about 55% of the image height, centred, with
> the shoulders cropped by the bottom edge. Generous even margin all
> round — the image will be cropped to a circle, so keep everything
> important well inside the centre circle.
>
> Expression for this version: mouth closed in a soft natural smile,
> both eyes open and looking directly at the viewer, eyebrows relaxed.

## The two variants — feed the first image back as a reference

Do not describe the character again from scratch. Ask for the same image
with one change. Three separate generations of a description produce
three people who look related, which is exactly the failure the drawn
SVG was built to avoid.

**Listening:**

> Same character, same style, same colours, same framing, same
> background — change only the expression. Head tilted very slightly to
> one side, eyebrows raised a little in attentive interest, eyes open
> slightly wider and focused on the viewer, mouth closed in a small
> smile. The pose reads as "I am listening to you."

**Answering:**

> Same character, same style, same colours, same framing, same
> background — change only the expression. Mouth open mid-sentence in a
> natural speaking shape, eyebrows slightly lifted and animated, eyes
> warm and engaged on the viewer. The pose reads as "I am telling you
> something." Do not change the head angle from the base image.

## Before shipping them

1. Drop the three files into `public/assistant/`.
2. View the assistant at 100% zoom, not zoomed in. If you cannot tell the
   three apart at 84px, the differences are too subtle — push the mouth
   and brows further, not the pose.
3. Check the circular crop cut nothing off — chin, ears, shoulder line.
4. Check all three against the card background in both light and dark.

---

# greeter.png — the standing namaste figure

A different picture from the three above, not a different crop of them.
The launcher shows the figure uncropped at 200-270px tall, so this is
the only file where hands exist at all.

## Prompt — regenerating the existing render in a namaste

Feed the approved concierge render back as a reference and change ONE
thing. Describing her again from scratch produces a different person who
merely resembles her.

> Same 3D character, same face, same hair, same navy uniform with the
> gold trim and the small gold "M" pin, same lighting, same rendering
> style — change only the hands and arms.
>
> She holds both palms pressed flat together in front of her chest in a
> namaste greeting, fingers pointing upward, elbows relaxed and slightly
> out. Warm, welcoming, looking directly at the viewer with the same
> soft smile.
>
> Framing: full upper body from the top of the head to below the waist,
> so the hands and the gesture are entirely inside the frame with clear
> space around them. Portrait orientation, roughly 3:4.
>
> Background: fully transparent. No backdrop, no circle, no floor, no
> shadow, no border — the figure alone on transparency, cut out cleanly
> at the edges including between the arms and the body.

## Checks before it goes in

* **Transparent, actually.** Open it over a dark surface. Generators
  routinely return a white or near-white background that looks
  transparent on a white page and appears as a hard rectangle the moment
  it sits on the film or a teal band. If it has a background, cut it out
  before shipping it.
* **The gap between the arms and the torso must be transparent too.**
  It is the most commonly missed hole, and a filled one makes the
  namaste read as a solid blob at small sizes.
* **Look at it at 200px, not at full size.** If the hands are not
  legible as a namaste there, the gesture needs to be larger in frame —
  that is the only thing this file exists to show.
* **Nothing critical in the bottom 10%.** The figure stands close to the
  bottom of the window.

Save as `public/assistant/greeter.png`. The launcher switches to it
automatically.
