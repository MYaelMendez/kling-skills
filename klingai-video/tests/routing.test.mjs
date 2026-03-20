/**
 * Tests for param validation and endpoint routing (src/index.mjs)
 */
import { describe, it, expect } from '@jest/globals';
import { chooseEndpoint, endpointPath, validateParams, ENDPOINTS } from '../src/index.mjs';

// ---------------------------------------------------------------------------
// chooseEndpoint
// ---------------------------------------------------------------------------
describe('chooseEndpoint', () => {
  it('returns text2video for prompt-only', () => {
    expect(chooseEndpoint({ prompt: 'hello' })).toBe('text2video');
  });

  it('returns image2video for single image', () => {
    expect(chooseEndpoint({ image: 'photo.jpg' })).toBe('image2video');
  });

  it('returns omni for multiple comma-separated images', () => {
    expect(chooseEndpoint({ image: 'a.jpg,b.jpg' })).toBe('omni');
  });

  it('returns omni when element_ids is set', () => {
    expect(chooseEndpoint({ image: 'photo.jpg', element_ids: '123' })).toBe('omni');
  });

  it('returns omni when video reference is set', () => {
    expect(chooseEndpoint({ video: 'clip.mp4' })).toBe('omni');
  });

  it('returns omni when multi_shot is true', () => {
    expect(chooseEndpoint({ multi_shot: true })).toBe('omni');
  });

  it('throws TypeError for non-object params', () => {
    expect(() => chooseEndpoint(null)).toThrow(TypeError);
    expect(() => chooseEndpoint('string')).toThrow(TypeError);
  });
});

// ---------------------------------------------------------------------------
// endpointPath
// ---------------------------------------------------------------------------
describe('endpointPath', () => {
  it('maps text2video', () => {
    expect(endpointPath('text2video')).toBe(ENDPOINTS.TEXT2VIDEO);
  });

  it('maps image2video', () => {
    expect(endpointPath('image2video')).toBe(ENDPOINTS.IMAGE2VIDEO);
  });

  it('maps omni', () => {
    expect(endpointPath('omni')).toBe(ENDPOINTS.OMNI);
  });

  it('throws for unknown key', () => {
    expect(() => endpointPath('unknown')).toThrow('Unknown endpoint key');
  });
});

// ---------------------------------------------------------------------------
// validateParams
// ---------------------------------------------------------------------------
describe('validateParams', () => {
  it('passes with a prompt', () => {
    expect(() => validateParams({ prompt: 'hello' })).not.toThrow();
  });

  it('passes with an image', () => {
    expect(() => validateParams({ image: 'photo.jpg' })).not.toThrow();
  });

  it('passes with multi_shot + multi_prompt', () => {
    expect(() =>
      validateParams({ multi_shot: true, multi_prompt: '[{"index":1}]' }),
    ).not.toThrow();
  });

  it('throws when nothing provided', () => {
    expect(() => validateParams({})).toThrow('At least one of');
  });

  it('throws when multi_shot is set but no multi_prompt', () => {
    expect(() => validateParams({ multi_shot: true })).toThrow('--multi_prompt');
  });

  it('throws for invalid duration (too short)', () => {
    expect(() => validateParams({ prompt: 'p', duration: 2 })).toThrow(RangeError);
  });

  it('throws for invalid duration (too long)', () => {
    expect(() => validateParams({ prompt: 'p', duration: 16 })).toThrow(RangeError);
  });

  it('accepts boundary durations', () => {
    expect(() => validateParams({ prompt: 'p', duration: 3 })).not.toThrow();
    expect(() => validateParams({ prompt: 'p', duration: 15 })).not.toThrow();
  });

  it('throws for invalid mode', () => {
    expect(() => validateParams({ prompt: 'p', mode: 'ultra' })).toThrow('--mode');
  });

  it('accepts valid modes', () => {
    expect(() => validateParams({ prompt: 'p', mode: 'pro' })).not.toThrow();
    expect(() => validateParams({ prompt: 'p', mode: 'std' })).not.toThrow();
  });

  it('throws for invalid aspect_ratio', () => {
    expect(() => validateParams({ prompt: 'p', aspect_ratio: '4:3' })).toThrow('--aspect_ratio');
  });

  it('accepts valid aspect ratios', () => {
    for (const r of ['16:9', '9:16', '1:1']) {
      expect(() => validateParams({ prompt: 'p', aspect_ratio: r })).not.toThrow();
    }
  });

  it('throws for invalid sound value', () => {
    expect(() => validateParams({ prompt: 'p', sound: 'yes' })).toThrow('--sound');
  });

  it('accepts valid sound values', () => {
    expect(() => validateParams({ prompt: 'p', sound: 'on' })).not.toThrow();
    expect(() => validateParams({ prompt: 'p', sound: 'off' })).not.toThrow();
  });

  it('throws TypeError for non-object', () => {
    expect(() => validateParams(null)).toThrow(TypeError);
  });
});
