# SightSpeak deck

This folder contains the offline Reveal.js presentation for SightSpeak.

To present it, start a local static server from this folder:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/` in a browser. The deck has no CDN or external-font dependency.

- `slides.md` contains the editable slide content.
- `styles.css` contains the visual system and motion.
- `vendor/reveal/` contains the bundled Reveal.js 6.0.1 runtime and license.
