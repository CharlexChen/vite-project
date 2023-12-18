// src/node/optimizer/scanPlugin.ts
import { Plugin } from "esbuild";
import { externalTypes } from "../constants";

export function esbuildScanPlugin(depImports: Set<string>): Plugin {
  return {
    name: 'vite:dep-scan',
    setup(build) {
      // 忽略部分后缀的文件，像.vue、.svelte等后缀的文件
      build.onResolve(
        { filter: new RegExp(`\\.(${externalTypes.join("|")})$`) },
        (resolveInfo) => {
          return {
            path: resolveInfo.path,
            // 打上 external 标记
            external: true,
          };
        }
      );
      // 记录需要预构建的第三方依赖
      build.onResolve(
        {
          filter: /^[\w@][^:]/,
        },
        (resolveInfo) => {
          const { path: id } = resolveInfo;
          // 推入 depImports 集合中
          depImports.add(id);
          return {
            path: id,
            external: true,
          };
        }
      );
    },
  };
}
