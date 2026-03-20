# Examples

Sample prompt payloads for the `klingai-video` skill. Each JSON file maps directly to CLI flags.

## Running an example

```bash
cd klingai-video
export KLING_TOKEN="your-token"

# Text-to-video
node scripts/kling_video.mjs \
  --prompt "A golden retriever running on a sunlit beach, slow motion, cinematic" \
  --duration 5 --mode pro --aspect_ratio 16:9 --output_dir ./output

# Image-to-video
node scripts/kling_video.mjs \
  --image ./examples/first_frame.jpg \
  --prompt "Wind gently blowing through her hair" \
  --output_dir ./output

# Omni (subject reference)
node scripts/kling_video.mjs \
  --prompt "<<<element_1>>> walking confidently through a neon-lit cityscape at night" \
  --image ./examples/scene.jpg \
  --element_ids 123456 \
  --output_dir ./output

# Multi-shot
node scripts/kling_video.mjs \
  --multi_shot --shot_type customize \
  --multi_prompt '[{"index":1,"prompt":"Wide shot: sunrise over mountain peaks","duration":"5"},{"index":2,"prompt":"Close-up: dew on a single leaf","duration":"5"}]' \
  --duration 10 --output_dir ./output
```

## Files

| File | Mode | Description |
|------|------|-------------|
| `text2video.json` | text2video | Simple text prompt → video |
| `image2video.json` | image2video | First-frame image + motion prompt |
| `omni.json` | omni | Subject reference + scene image |
| `multi_shot.json` | multi-shot | Two-shot sequence with per-shot prompts |
