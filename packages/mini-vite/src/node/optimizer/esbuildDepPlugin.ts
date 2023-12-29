import type { Plugin } from 'esbuild'
import resolve from "resolve"; // 一个实现了 node 路径解析算法的库

// const externalWithConversionNamespace =
//   'vite:dep-pre-bundle:external-conversion'

const cjsExternalFacadeNamespace = 'vite:cjs-external-facade'
const nonFacadePrefix = 'vite-cjs-external-facade:'

export function esbuildDepPlugin(
  depImports: Set<string>
): Plugin {
  return {
    name: 'vite:dep-pre-bundle',
    setup(build) {
      // build.onLoad(
      //   { filter: /.*/, namespace: externalWithConversionNamespace },
      //   (args) => {
      //     // 构建的模块内容导出
      //     const modulePath = `"${args.path}"`
      //     return {
      //       contents: `export { default } from ${modulePath};` +
      //       `export * from ${modulePath};`,
      //       loader: 'js',
      //     }
      //   },
      // )

      build.onResolve(
        { filter: /^[\w@][^:]/ },
        async ({ path: id, importer, kind, resolveDir, namespace }) => {
          // console.log('>>>build.onResolve', id, importer || '-', kind || '-', resolveDir || '-', namespace || '-');
          // 命中需要预编译的依赖
          if (depImports.has(id) && !importer) {
            return {
              // onResolve，这里的 path 就是绝对路径
              path: resolve.sync(id, { basedir: process.cwd() }),
            }
          }
        },
      )
    },
  }
}

const escapeRegexRE = /[-/\\^$*+?.()|[\]{}]/g
export function escapeRegex(str: string): string {
  return str.replace(escapeRegexRE, '\\$&')
}
const matchesEntireLine = (text: string) => `^${escapeRegex(text)}$`

// esbuild doesn't transpile `require('foo')` into `import` statements if 'foo' is externalized
// https://github.com/evanw/esbuild/issues/566#issuecomment-735551834
export function esbuildCjsExternalPlugin(
  externals: string[],
  platform: 'node' | 'browser',
): Plugin {
  return {
    name: 'cjs-external',
    setup(build) {
      const filter = new RegExp(externals.map(matchesEntireLine).join('|'))

      build.onResolve({ filter: new RegExp(`^${nonFacadePrefix}`) }, (args) => {
        return {
          path: args.path.slice(nonFacadePrefix.length),
          external: true,
        }
      })

      build.onResolve({ filter }, (args) => {
        // preserve `require` for node because it's more accurate than converting it to import
        if (args.kind === 'require-call' && platform !== 'node') {
          return {
            path: args.path,
            namespace: cjsExternalFacadeNamespace,
          }
        }

        return {
          path: args.path,
          external: true,
        }
      })

      build.onLoad(
        { filter: /.*/, namespace: cjsExternalFacadeNamespace },
        (args) => ({
          contents:
            `import * as m from ${JSON.stringify(
              nonFacadePrefix + args.path,
            )};` + `module.exports = m;`,
        }),
      )
    },
  }
}
