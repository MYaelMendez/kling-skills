/**
 * Tests for polling helpers using mocked fetch (scripts/shared/task.mjs)
 *
 * We mock the global fetch so no real HTTP calls are made.
 * Tests are scoped to single-response scenarios to avoid ESM module-cache /
 * timer interactions in the Jest experimental-vm-modules runner.
 */
import { describe, it, expect } from '@jest/globals';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Create a one-shot fetch mock that returns the given JSON body once.
 * Subsequent calls throw so accidental extra requests are caught.
 */
function makeSingleFetchMock(body, ok = true, status = 200) {
  let called = 0;
  return async (_url, _opts) => {
    called += 1;
    if (called > 1) throw new Error(`fetch called ${called} times — expected 1`);
    return {
      ok,
      status,
      json: async () => body,
      text: async () => JSON.stringify(body),
    };
  };
}

/**
 * Create a multi-shot fetch mock that cycles through the provided response list.
 */
function makeMultiFetchMock(responses) {
  let idx = 0;
  return async (_url, _opts) => {
    const r = responses[idx++];
    if (!r) throw new Error(`fetch called more times than expected (${idx} > ${responses.length})`);
    return {
      ok: r.ok !== false,
      status: r.status ?? 200,
      json: async () => r.body,
      text: async () => JSON.stringify(r.body),
    };
  };
}

// ---------------------------------------------------------------------------
// queryTask — wraps klingGet directly
// ---------------------------------------------------------------------------
describe('queryTask (mocked fetch)', () => {
  it('returns task data for a successful GET', async () => {
    process.env.KLING_API_BASE = 'https://mock.kling.test';
    process.env.KLING_TOKEN = 'mock-token';

    const taskData = {
      task_id: 'abc',
      task_status: 'succeed',
      task_result: { videos: [{ url: 'https://cdn.example.com/out.mp4' }] },
    };

    global.fetch = makeSingleFetchMock({ code: 0, data: taskData });

    const { queryTask } = await import('../scripts/shared/task.mjs');
    const data = await queryTask('/v1/videos/text2video', 'abc', 'mock-token');
    expect(data.task_status).toBe('succeed');
    expect(data.task_result.videos[0].url).toBe('https://cdn.example.com/out.mp4');
  });

  it('throws on API error code', async () => {
    process.env.KLING_API_BASE = 'https://mock.kling.test';
    process.env.KLING_TOKEN = 'mock-token';

    global.fetch = makeSingleFetchMock({ code: 1002, message: 'Unauthorized' });

    const { queryTask } = await import('../scripts/shared/task.mjs');
    await expect(queryTask('/v1/videos/text2video', 'bad-id', 'mock-token')).rejects.toThrow(
      'Unauthorized',
    );
  });
});

// ---------------------------------------------------------------------------
// pollTask — uses multi-shot mock to simulate status transitions
// ---------------------------------------------------------------------------
describe('pollTask (mocked fetch, multi-shot)', () => {
  it('resolves when first response is already succeed', async () => {
    process.env.KLING_API_BASE = 'https://mock.kling.test';
    process.env.KLING_TOKEN = 'mock-token';

    global.fetch = makeSingleFetchMock({
      code: 0,
      data: { task_id: 't1', task_status: 'succeed', task_result: { videos: [{ url: 'https://cdn.example.com/v.mp4' }] } },
    });

    const { pollTask } = await import('../scripts/shared/task.mjs');
    const data = await pollTask('/v1/videos/text2video', 't1', { token: 'mock-token', interval: 1 });
    expect(data.task_status).toBe('succeed');
  }, 10000);

  it('polls processing then succeed', async () => {
    process.env.KLING_API_BASE = 'https://mock.kling.test';
    process.env.KLING_TOKEN = 'mock-token';

    global.fetch = makeMultiFetchMock([
      { body: { code: 0, data: { task_id: 't2', task_status: 'processing' } } },
      { body: { code: 0, data: { task_id: 't2', task_status: 'succeed', task_result: { videos: [{ url: 'https://cdn.example.com/v2.mp4' }] } } } },
    ]);

    const { pollTask } = await import('../scripts/shared/task.mjs');
    const data = await pollTask('/v1/videos/text2video', 't2', { token: 'mock-token', interval: 1 });
    expect(data.task_status).toBe('succeed');
  }, 10000);

  it('throws when task fails', async () => {
    process.env.KLING_API_BASE = 'https://mock.kling.test';
    process.env.KLING_TOKEN = 'mock-token';

    global.fetch = makeSingleFetchMock({
      code: 0,
      data: { task_id: 'f1', task_status: 'failed', task_status_msg: 'Quota exceeded' },
    });

    const { pollTask } = await import('../scripts/shared/task.mjs');
    await expect(
      pollTask('/v1/videos/text2video', 'f1', { token: 'mock-token', interval: 1 }),
    ).rejects.toThrow('Quota exceeded');
  }, 10000);
});
