# Assets

Drop replacement artwork here. Every scene is built from **inline SVG layers** in `index.html`,
each wrapped in a `.layer` element with a `data-depth` value that drives its parallax speed
(0 = far/slow sky, 1 = near/fast foreground).

## Swapping an SVG layer for a PNG

Find the layer in `index.html`, e.g.:

```html
<div class="layer layer--mtn-far" data-depth="0.22"> ... inline svg ... </div>
```

Replace the inner `<svg>` with an image (or set it as a background) — **keep the wrapper
`div`, its class, and its `data-depth`** so the animation code keeps working untouched:

```html
<div class="layer layer--mtn-far" data-depth="0.22"
     style="background:url(assets/mtn-far.png) center bottom / cover no-repeat"></div>
```

## Files
- `resume.pdf` — linked by the nav "Resume" button. Replace with your own.

## Layer depth cheatsheet
| Layer            | data-depth | Motion  |
|------------------|-----------|---------|
| sky / glow       | 0.02–0.08 | slowest |
| far mountains    | ~0.22     | slow    |
| mid mountains    | ~0.40     | medium  |
| near mountains   | ~0.55     | faster  |
| grass / mist     | 0.85–0.9  | fastest |
