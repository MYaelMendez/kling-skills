# kling-skills

Open-source skill collection for [Kling AI](https://app.klingai.com/) — text-to-video, image-to-video, Omni, and multi-shot generation. Designed for agent integrations and ready to publish to [llm.store](https://llm.store).

## Skills

| Skill | Description |
|-------|-------------|
| [klingai-video](./klingai-video) | Text-to-video, image-to-video, Omni, multi-shot via the official Kling API |

## Quick start

```bash
# Prerequisites: Node.js 18+
cd klingai-video
npm install
export KLING_TOKEN="your-token"

# Text-to-video
node scripts/kling_video.mjs --prompt "A cat running on the grass" --output_dir ./output

# Image-to-video
node scripts/kling_video.mjs --image ./photo.jpg --prompt "Wind blowing hair" --output_dir ./output
```

See [klingai-video/SKILL.md](./klingai-video/SKILL.md) for full parameter reference.

## Development

```bash
cd klingai-video
npm install
npm run lint
npm test
```

## GitHub Pages

Skill documentation is automatically published to [GitHub Pages](https://myaelmendez.github.io/kling-skills/) on every push to `main` and on every release tag.

## llm.store integration

The `klingai-video/skill_manifest.json` is machine-readable and conforms to the llm.store ingestion contract. The `publish-llm-store.yml` workflow will POST the manifest automatically once `LLM_STORE_URL` and `LLM_STORE_TOKEN` repository secrets are configured.

## Enabling pre-commit hooks (optional)

```bash
pip install pre-commit
pre-commit install
```

## License

[MIT](./LICENSE)
