# klingai-video

Kling video generation (single skill): text-to-video, image-to-video, Omni, multi-shot. Script picks the API by parameters.

## Usage

```bash
node scripts/kling_video.mjs --prompt "description" --output_dir ./output
node scripts/kling_video.mjs --image ./photo.jpg --prompt "motion" --output_dir ./output
node scripts/kling_video.mjs --task_id <id> --download
```

## Development

```bash
npm install
npm run lint
npm test
```

## Docs

- [SKILL.md](SKILL.md) — Usage and parameters
- [reference.md](reference.md) — API reference
- [skill_manifest.json](skill_manifest.json) — Machine-readable manifest for llm.store
- [examples/](examples/) — Sample prompt payloads
- [docs/index.md](docs/index.md) — Generated documentation (also on [GitHub Pages](https://myaelmendez.github.io/kling-skills/))
