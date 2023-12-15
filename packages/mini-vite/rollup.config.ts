import { defineConfig } from 'rollup'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import typescript from '@rollup/plugin-typescript'

const __dirname = fileURLToPath(new URL('.', import.meta.url)) // 当前目录路径，如：/Users/xxx/code/study/AsZero-project/packages/mini-vite/

const sharedNodeOptions = defineConfig({
  treeshake: {
    moduleSideEffects: 'no-external', // 只对本地模块进行 tree-shaking，不包括外部依赖
    propertyReadSideEffects: false, // 不对属性读取进行 tree-shaking
    tryCatchDeoptimization: false, // 不对 try-catch 语句进行优化
  },
  output: {
    dir: './dist',
    entryFileNames: `node/[name].js`, // 输出文件名将以 [name].js 的格式命名，其中 [name] 是入口点的名称
    chunkFileNames: 'node/chunks/dep-[hash].js', // 非入口点 chunk 文件的命名格式，[hash] 是文件内容的哈希值
    exports: 'named', // 输出文件使用命名导出
    format: 'esm', // 输出文件使用 ES 模块格式
    externalLiveBindings: false, // 保留外部依赖的实时绑定
    freeze: false, // 冻结输出文件中的对象
  },
  // 用于处理 Rollup 构建过程中的警告
  onwarn(warning, warn) {
    if (warning.message.includes('Circular dependency')) {
      return
    }
    warn(warning)
  },
})

export default defineConfig({
  // 入口文件路径映射
  input: {
    cli: path.resolve(__dirname, 'src/node/cli.ts'),
  },
  plugins: [
    // 引用rollup插件 @rollup/plugin-typescript 来处理 ts 文件
    typescript({
      tsconfig: path.resolve(__dirname, 'src/node/tsconfig.json'),
      declaration: false,
    })
  ],
  ...sharedNodeOptions,
});