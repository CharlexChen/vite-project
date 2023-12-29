import { NextHandleFunction } from "connect";
import { ServerContext } from "../index";
import path from "path";
import fse from "fs-extra";

/**
 * 对HTML进行处理转换的中间件
 * @param serverContext 
 * @returns 
 */
export function indexHtmlMiddleware(
  serverContext: ServerContext
): NextHandleFunction {
  return async (req, res, next) => {
    console.log('>>>indexHtmlMiddleware', req.url);
    if (req.url === "/") {
      // 取出开发服务器上下文的 root 作为项目根目录
      const { root } = serverContext;
      // Vite创建的项目默认使用项目根目录下的 index.html
      const indexHtmlPath = path.join(root, "index.html");
      // 判断是否存在
      if (await fse.pathExists(indexHtmlPath)) {
        const rawHtml = await fse.readFile(indexHtmlPath, "utf8");
        let html = rawHtml;
        // 执行用户提供 or Vite内置的插件中 transformIndexHtml 方法来对 HTML 进行自定义的修改/替换
        for (const plugin of serverContext.plugins) {
          if (plugin.transformIndexHtml) {
            html = await plugin.transformIndexHtml(html);
          }
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        return res.end(html);
      }
    }
    return next();
  };
}
