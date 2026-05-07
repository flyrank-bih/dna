import { defineConfig } from '@rslib/core';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  lib: [
    {
      format: "esm",
      syntax: ["node 18"],
      dts: true,
    },
    {
      format: "cjs",
      syntax: ["node 18"],
    },
  ],
});
