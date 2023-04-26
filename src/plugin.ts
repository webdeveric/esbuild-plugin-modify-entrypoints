import { readFile } from 'node:fs/promises';

import type { Loader, OnLoadResult, Plugin, PluginBuild } from 'esbuild';

export const PLUGIN_NAME = 'modify-entrypoints';

export type ModifyFnOptions = {
  contents: string;
  path: string;
  resolveDir: string;
  loader?: Loader | undefined;
  options: Readonly<PluginBuild['initialOptions']>;
};

export type OnLoadResultStringContents = Omit<OnLoadResult, 'contents'> & { contents: string };

export type ModifyFn = (options: Readonly<ModifyFnOptions>) => OnLoadResultStringContents;

export const modifyEntrypointsPlugin = (...modifyFunctions: (ModifyFn | ModifyFn[])[]): Plugin => ({
  name: PLUGIN_NAME,
  async setup(build) {
    const functions = modifyFunctions.flat();

    build.onResolve({ filter: /.*/ }, ({ path, resolveDir, kind }) => {
      if (kind === 'entry-point') {
        return {
          path,
          namespace: PLUGIN_NAME,
          pluginData: {
            resolveDir,
          },
        };
      }
    });

    build.onLoad({ filter: /.*/, namespace: PLUGIN_NAME }, async ({ path, pluginData }) => {
      const contents = await readFile(path, 'utf8');

      return functions.reduce<OnLoadResultStringContents>(
        (results, fn) => {
          const innerResults = fn({
            contents: results.contents,
            loader: results.loader,
            path,
            resolveDir: pluginData?.resolveDir,
            options: build.initialOptions,
          });

          const loader = innerResults.loader ?? results.loader;

          return {
            ...results,
            ...innerResults,
            ...(loader ? { loader } : {}),
            resolveDir: pluginData?.resolveDir,
          };
        },
        {
          contents,
        },
      );
    });
  },
});
