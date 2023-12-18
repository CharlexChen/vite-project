import path from "path";
import colors from 'picocolors';
import { build } from "esbuild";
import { esbuildScanPlugin } from "./scan";

export async function optimizeDeps(config: { root: string }) {
  // 1. 定位需预构建的项目工程入口文件
  const entry = path.resolve(config.root, "src/main.ts");
  // 2. 从入口文件开始扫描依赖项
  const deps = new Set<string>();
  console.debug(colors.green(`scanning for dependencies...\n`))
  await build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    plugins: [esbuildScanPlugin(deps)],
  });
  console.log(
  `${colors.green("需预构建的依赖项如下:")}\n${[...deps]
    .map(colors.green)
    .map((item) => `- ${item}`)
    .join("\n")}\n\n`
  );
  // 3. 预构建依赖
}