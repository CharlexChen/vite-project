import { Loader, TransformOptions, transform } from 'esbuild';
import { cleanUrl, isJSRequest } from '../utils';
import { Plugin } from '../plugin';
import path from 'path';
import fse from 'fs-extra';
import * as compiler from 'vue/compiler-sfc';

export async function transformWithEsbuild(
  code: string,
  filename: string,
  options?: TransformOptions,
  inMap?: object
) {
  let loader = options?.loader;
  if (!loader) {
    // if the id ends with a valid ext, use it (e.g. vue blocks)
    // otherwise, cleanup the query before checking the ext
    const ext = path
      .extname(/\.\w+$/.test(filename) ? filename : cleanUrl(filename))
      .slice(1);

    if (ext === 'cjs' || ext === 'mjs') {
      loader = 'js';
    } else if (ext === 'cts' || ext === 'mts') {
      loader = 'ts';
    } else {
      loader = ext as Loader;
    }
  }
  const result = await transform(code, options)
  return result;
}

export function esbuildTransformPlugin(): Plugin {
    return {
      name: "vite:esbuild",
      async load(id) {
        if (isJSRequest(id)) {
          try {
            const code = await fse.readFile(id, "utf-8");
            return code;
          } catch (e) {
            return null;
          }
        }
      },
      async transform(code, id) {
        if (/\.(vue)$/.test(id)) {
          // const result = compiler.parse(code, { filename: id, });
          const result1 = compiler.compileTemplate({
            source: code,
            filename: 'app.vue',
            id: id,
          })
          return result1.code;
        }
        const reg = /\.(m?ts|[jt]sx)$/;
        if (reg.test(id) || reg.test(cleanUrl(id))) {
          const result = await transformWithEsbuild(code, id, {
            target: "esnext",
            format: "esm",
            sourcemap: true,
          })
          return {
            code: result.code,
            map: result.map,
          }
        }
        return null;
      },
    }
}
