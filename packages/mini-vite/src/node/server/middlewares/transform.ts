import { NextHandleFunction } from "connect";
import { ServerContext } from "..";
import { isJSRequest, isImportRequest } from "../../utils";
import { transformRequest } from "../../transformRequest";
import { isCSSRequest } from "../../plugins/css";

export function transformMiddleware(
    serverContext: ServerContext
): NextHandleFunction {
    return async (req, res, next) => {
      if (req.method !== "GET" || !req.url) {
        return next();
      }
      const url = req.url;
      console.debug(">>>transformMiddleware", url);
      // 若是JS模块资源的请求，则执行以下逻辑
      if (isJSRequest(url) || isImportRequest(url) || isCSSRequest(url)) {
        console.debug(">>>isJSRequest");
        // 使用插件容器解析、加载、转换
        let result = await transformRequest(url, serverContext, {
            html: req.headers.accept?.includes('text/html'),
        });
        if (!result) {
          return next();
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/javascript");
        return res.end(result.code);
      }
      next();
    };
}