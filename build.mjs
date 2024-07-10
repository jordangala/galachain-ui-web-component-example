import * as esbuild from 'esbuild';
import copyStaticFiles from 'esbuild-copy-static-files';

await esbuild.build({
  entryPoints: ['src/example.ts'],
  bundle: true,
  outfile: 'dist/example.js',
  plugins: [copyStaticFiles({ src: './public', dest: './dist' })],
});
