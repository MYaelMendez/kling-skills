---
title: klingai-video
description: Official Kling AI Skill — text-to-video, image-to-video, Omni, and multi-shot generation
version: 1.0.0
generated: 2026-03-20
---

# klingai-video

> Official Kling AI Skill — text-to-video, image-to-video, Omni, and multi-shot generation

**Version**: `1.0.0` | **License**: MIT | **Runtime**: Node.js 18+

## Supported Modes

- `text2video`
- `image2video`
- `omni`
- `multi-shot`

## API Endpoints

| Mode | API Path | Model |
|------|----------|-------|
| text only (no --image, --element_ids, --video, --multi_shot) | `/v1/videos/text2video` | `kling-v3` |
| single first-frame image, no subject/multi-shot/reference video | `/v1/videos/image2video` | `kling-v3` |
| multiple images / subject / reference video / multi-shot | `/v1/videos/omni-video` | `kling-v3-omni or kling-video-o1` |

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--prompt` | string | _optional_ | Video description. Omni supports <<<element_1>>> <<<image_1>>> <<<video_1>>> placeholders. |
| `--image` | string | _optional_ | First-frame image path or URL (comma-separated multiple → Omni) |
| `--duration` | number | `5` | Duration 3–15 seconds |
| `--model` | string | `by endpoint` | kling-v3 / kling-v3-omni / kling-video-o1 (script chooses by endpoint) |
| `--mode` | string | `pro` | pro (1080P) / std (720P) |
| `--aspect_ratio` | string | `16:9` | Output aspect ratio |
| `--sound` | string | `off` | on / off. Supported by kling-v3 and omni; with --video only off; kling-video-o1 does not support sound. |
| `--image_tail` | string | _optional_ | Last-frame image (image-to-video / Omni) |
| `--element_ids` | string | _optional_ | Subject IDs, comma-separated (Omni) |
| `--video` | string | _optional_ | Reference video path or URL (Omni) |
| `--multi_shot` | boolean | `false` | Enable multi-shot mode |
| `--shot_type` | string | _optional_ | Shot type: customize (required when multi_shot is true) |
| `--multi_prompt` | array | _optional_ | Shots JSON array (max 6). Each item: { index, prompt, duration } |
| `--output_dir` | string | `./output` | Output directory |
| `--negative_prompt` | string | _optional_ | Negative prompt |
| `--task_id` | string | _optional_ | Task ID for query/download mode |
| `--download` | boolean | `false` | Download result when querying an existing task |

---

> **Language**: Always respond to the user in their own language. Script CLI output is bilingual (English / Chinese). Present results in the user's language.

# Kling AI Video Generation (Kling Official)

Official Kling AI skill for agents to call Kling video API. Single entry for text-to-video, image-to-video, Omni (image/video/subject), and multi-shot. The script picks the API by parameters; zero external dependencies, Node 18+.

## Prerequisites

- Node.js 18+
- Auth (choose one): `KLING_TOKEN` (recommended) or `KLING_API_KEY` (format `accessKey|secretKey`)
- If `KLING_API_BASE` is not set, the script probes China (Beijing) / Global (Singapore) and caches to `~/.config/kling/state.json`
- To force a region: set `KLING_API_BASE`
- After switching account or region: `rm ~/.config/kling/state.json`

## Use cases

**Use for:**
- Text-to-video (text description only)
- Image-to-video (first frame + optional last frame)
- Omni: text + image + reference video + subject (create subject first via klingai-element)
- Multi-shot video

**Not for:**
- Image generation (text/image-to-image) → klingai-image
- Create or manage subjects → klingai-element

## Quick start

```bash
# Show all options
node {baseDir}/scripts/kling_video.mjs --help

# Text-to-video
node {baseDir}/scripts/kling_video.mjs \
  --prompt "A cat running on the grass, sunny day" \
  --output_dir ./output

# Image-to-video
node {baseDir}/scripts/kling_video.mjs \
  --image ./photo.jpg \
  --prompt "Wind blowing hair" \
  --output_dir ./output

# Omni (first frame + subject)
node {baseDir}/scripts/kling_video.mjs \
  --prompt "<<<element_1>>> walking in the park" \
  --image ./scene.jpg \
  --element_ids 123456

# Multi-shot
node {baseDir}/scripts/kling_video.mjs \
  --multi_shot --shot_type customize \
  --multi_prompt '[{"index":1,"prompt":"Sunrise scene","duration":"5"},{"index":2,"prompt":"Close-up","duration":"5"}]' \
  --duration 10

# Query existing task
node {baseDir}/scripts/kling_video.mjs --task_id <id> --download
```

## Core parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--prompt` | Video description (required for text/image/Omni) | — |
| `--image` | First-frame image path or URL (comma-separated multiple → Omni) | — |
| `--duration` | Duration 3–15 s | 5 |
| `--model` | kling-v3 / kling-v3-omni / kling-video-o1 (script chooses) | by endpoint |
| `--mode` | pro (1080P) / std (720P) | pro |
| `--aspect_ratio` | 16:9 / 9:16 / 1:1 | 16:9 |
| `--sound` | on / off. Supported by kling-v3/omni; with `--video` only off; kling-video-o1 does not support sound | off |
| `--image_tail` | Last-frame image (image-to-video / Omni) | — |
| `--element_ids` | Subject IDs, comma-separated (Omni) | — |
| `--video` | Reference video path or URL (Omni) | — |
| `--multi_shot` | Enable multi-shot | false |
| `--shot_type` | Shot type: customize | — |
| `--multi_prompt` | Shots JSON array (max 6) | — |
| `--output_dir` | Output directory | ./output |

Run `--help` for full parameters.

## API routing (script auto-selects)

- **Text only** → `/v1/videos/text2video` (kling-v3)
- **Single first-frame image, no subject/multi-shot/reference video** → `/v1/videos/image2video` (kling-v3)
- **Multiple images / subject / reference video / multi-shot** → `/v1/videos/omni-video` (kling-v3-omni or kling-video-o1)

## Prompt template syntax (Omni)

In the prompt, reference inputs with `<<<>>>`:
- `<<<image_1>>>` — first image from `--image`
- `<<<element_1>>>` — first subject from `--element_ids`
- `<<<video_1>>>` — video from `--video`

## Notes

- Generation typically 1–5 minutes; script polls by default
- In multi-shot mode `--prompt` is ignored; use `--multi_prompt` for each shot
- Reference video and audio generation are mutually exclusive
- API details in [reference.md](reference.md)


---

*Auto-generated from [SKILL.md](../SKILL.md) and [skill_manifest.json](../skill_manifest.json) on 2026-03-20.*
