# `esbuild-plugin-modify-entrypoints`

[![Build Status](https://github.com/webdeveric/esbuild-plugin-modify-entrypoints/workflows/Node.js%20CI/badge.svg)](https://github.com/webdeveric/esbuild-plugin-modify-entrypoints/actions)

## Install

```sh
npm install esbuild-plugin-modify-entrypoints -D
```

## Usage

Add the plugin to your esbuild `plugins`.

```ts
import { build } from 'esbuild';

import { modifyEntrypointsPlugin } from 'esbuild-plugin-modify-entrypoints';

const results = await build({
  entryPoints: ['your-file.ts'],
  plugins: [
    modifyEntrypointsPlugin(({ contents }) => {
      return {
        contents: `console.log('First');\n${contents}`,
        loader: 'ts',
      };
    }),
  ],
});
```
