import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

import { describe, expect, it, vi } from 'vitest';
import { build } from 'esbuild';

import { modifyEntrypointsPlugin, PLUGIN_NAME } from './plugin.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = fileURLToPath(new URL('.', import.meta.url));

describe.concurrent('modifyEntrypointsPlugin()', () => {
  it('Returns an esbuild plugin', () => {
    expect(modifyEntrypointsPlugin()).toMatchObject({
      name: PLUGIN_NAME,
    });
  });

  describe('Usage with esbuild', () => {
    it('Does nothing if zero entrypoints', async () => {
      const fn = vi.fn(({ contents }) => {
        return {
          contents,
        };
      });

      await build({
        write: false,
        format: 'esm',
        entryPoints: [],
        plugins: [modifyEntrypointsPlugin(fn)],
      });

      expect(fn).not.toHaveBeenCalled();
    });

    it('Can modify the contents of the entrypoint', async () => {
      const results = await build({
        write: false,
        format: 'esm',
        entryPoints: [resolve(__dirname, '../fixtures/test.js')],
        plugins: [
          modifyEntrypointsPlugin(
            ({ contents }) => {
              return {
                contents: `console.log('First');\n${contents}`,
              };
            },
            ({ contents, loader }) => {
              return {
                contents: `${contents}\nconsole.log('Last');`,
                loader: loader ?? 'default',
              };
            },
          ),
        ],
      });

      const text = results.outputFiles?.at(0)?.text.trim();

      expect(text?.startsWith('console.log("First");')).toBeTruthy();
      expect(text?.endsWith('console.log("Last");')).toBeTruthy();
    });
  });
});
