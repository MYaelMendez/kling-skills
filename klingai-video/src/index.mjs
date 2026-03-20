/**
 * klingai-video — public library entry point
 *
 * Exposes endpoint selection, task submission, polling, and download
 * so the CLI and external callers share the same logic.
 *
 * Node.js 18+ (ESM)
 */

export const ENDPOINTS = {
  TEXT2VIDEO: '/v1/videos/text2video',
  IMAGE2VIDEO: '/v1/videos/image2video',
  OMNI: '/v1/videos/omni-video',
};

/**
 * Determine the correct Kling API endpoint based on the provided parameters.
 *
 * Rules (in priority order):
 *   1. multi_shot | element_ids | video (reference)  → OMNI
 *   2. image with >1 comma-separated values           → OMNI
 *   3. image (single)                                 → IMAGE2VIDEO
 *   4. text only                                      → TEXT2VIDEO
 *
 * @param {object} params
 * @param {boolean} [params.multi_shot]
 * @param {string}  [params.element_ids]  comma-separated IDs
 * @param {string}  [params.video]        reference video path/URL
 * @param {string}  [params.image]        first-frame path/URL (comma-sep multiple)
 * @returns {'text2video'|'image2video'|'omni'} logical endpoint key
 */
export function chooseEndpoint(params) {
  if (!params || typeof params !== 'object') {
    throw new TypeError('params must be an object');
  }
  if (params.multi_shot || params.element_ids || params.video) {
    return 'omni';
  }
  if (params.image) {
    const images = String(params.image)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (images.length > 1) return 'omni';
    return 'image2video';
  }
  return 'text2video';
}

/**
 * Map a logical endpoint key to the API path string.
 *
 * @param {'text2video'|'image2video'|'omni'} key
 * @returns {string} API path
 */
export function endpointPath(key) {
  switch (key) {
    case 'text2video':
      return ENDPOINTS.TEXT2VIDEO;
    case 'image2video':
      return ENDPOINTS.IMAGE2VIDEO;
    case 'omni':
      return ENDPOINTS.OMNI;
    default:
      throw new Error(`Unknown endpoint key: ${key}`);
  }
}

/**
 * Validate common generation parameters and throw descriptive errors.
 *
 * @param {object} params
 */
export function validateParams(params) {
  if (!params || typeof params !== 'object') {
    throw new TypeError('params must be a non-null object');
  }

  const { prompt, image, multi_shot, multi_prompt, duration, mode, aspect_ratio, sound } = params;

  if (!prompt && !image && !multi_shot) {
    throw new Error('At least one of --prompt, --image, or --multi_shot is required');
  }

  if (multi_shot && !multi_prompt) {
    throw new Error('--multi_prompt is required when --multi_shot is enabled');
  }

  if (duration !== undefined) {
    const d = Number(duration);
    if (!Number.isFinite(d) || d < 3 || d > 15) {
      throw new RangeError('--duration must be between 3 and 15 seconds');
    }
  }

  const validModes = ['pro', 'std'];
  if (mode !== undefined && !validModes.includes(mode)) {
    throw new Error(`--mode must be one of: ${validModes.join(', ')}`);
  }

  const validRatios = ['16:9', '9:16', '1:1'];
  if (aspect_ratio !== undefined && !validRatios.includes(aspect_ratio)) {
    throw new Error(`--aspect_ratio must be one of: ${validRatios.join(', ')}`);
  }

  const validSound = ['on', 'off'];
  if (sound !== undefined && !validSound.includes(sound)) {
    throw new Error(`--sound must be one of: ${validSound.join(', ')}`);
  }
}

// Re-export lower-level helpers so callers can import from one place.
export { submitTask, queryTask, pollTask, pollAndDownload, downloadFile } from '../scripts/shared/task.mjs';
export { klingPost, klingGet } from '../scripts/shared/client.mjs';
export { getBearerToken, resolveApiBase } from '../scripts/shared/auth.mjs';
export { parseArgs, getTokenOrExit, readMediaAsValue } from '../scripts/shared/args.mjs';
