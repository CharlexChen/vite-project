import { pathExists } from "fs-extra";
import path from "path";
import resolve from "resolve";
import { ServerContext } from "../server";
import { normalizePath } from "../utils";
import { Plugin } from "../plugin";

export function resolvePlugin(): Plugin {
  let serverContext: ServerContext;
  return {
    name: 'vite:resolve',
    configureServer(server) {
      // 保存服务端上下文
      serverContext = server;
    },
    async resolveId(id: string, importer?: string) {
      // 绝对路径
      if (path.isAbsolute(id)) {
        // 路径存在，直接返回
        if (await pathExists(id)) {
          return { id };
        }
        // 路径不存在的情况下加上 root 路径前缀，支持类似 /src/main.ts 的情况
        id = path.join(serverContext.root, id);
        if (await pathExists(id)) {
          return { id };
        }
      } else if (id.startsWith('.')) {
        // 相对路径
        if (!importer) throw new Error('`importer` should not be undefined');
        const hasExtension = path.extname(id).length > 1;
        let resolvedId: string;
        // 包含文件名后缀，如 ./main.ts
        if (hasExtension) {
          resolvedId = normalizePath(
            resolve.sync(id, { basedir: path.dirname(importer) })
          );
          if (await pathExists(resolvedId)) {
            return { id: resolvedId };
          }
        } else {
          // 不包含文件名后缀，如 ./main
          // 遍历来实现自动推断文件后缀名，如：./main -> ./main.ts
          for (const extname of [".tsx", ".ts", ".jsx", "js"]) {
            try {
              const withExtension = `${id}${extname}`;
              resolvedId = normalizePath(
                resolve.sync(withExtension, {
                  basedir: path.dirname(importer),
                })
              );
              if (await pathExists(resolvedId)) {
                return { id: resolvedId };
              }
            } catch (error) {}
          }
        }
      }
      return null;
    },
  };
}
