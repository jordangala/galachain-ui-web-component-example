import * as esbuild from 'esbuild';
import copyStaticFiles from 'esbuild-copy-static-files';

const watch = async () => {
  const context = await esbuild.context({
    entryPoints: ['src/example.ts'],
    bundle: true,
    outfile: 'dist/example.js',
    plugins: [copyStaticFiles({ src: './public', dest: './dist' })],
    logLevel: 'info',
  });

  await context.watch();
};

watch();
