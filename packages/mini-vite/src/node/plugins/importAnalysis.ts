import MagicString from "magic-string";
import { Plugin } from "../plugin"
import { ServerContext } from "../server"
import { isJSRequest, normalizePath } from "../utils";
import { init, parse } from "es-module-lexer";
import path from "path";
// import resolve from "resolve";

export function importAnalysisPlugin(): Plugin {
    let serverCtx: ServerContext;
    return {
        name: 'vite:import-analysis',
        configureServer(_server) {
            serverCtx = _server
        },
        async transform(source: string, importer: string, options) {
            if (!serverCtx) return null
            // 只处理 JS 的请求
            if (!isJSRequest(importer) || /\.(vue)$/.test(importer)) return null;
            await init;
            // 解析 import 语句
            const [imports] = parse(source);
            if (!imports.length) {
                return source;
            }
            const ms = new MagicString(source);
            // 遍历每个 import 语句依次进行分析
            for (const importInfo of imports) {
                const { s: modStart, e: modEnd, n: modSource } = importInfo;
                if (!modSource) continue;
                // 将第三方依赖的路径重写到预构建产物的路径
                if (/^[\w@][^:]/.test(modSource)) {
                    const bundlePath = normalizePath(
                        path.join('/', path.join('node_modules', '.mini-vite', 'deps'), `${modSource}.js`)
                        // resolve.sync(modSource, {
                        //     basedir: process.cwd(),
                        // })
                    );
                    // console.log('>>>bundlePath', bundlePath);
                    ms.overwrite(modStart, modEnd, bundlePath);
                } else if (modSource.startsWith(".") || modSource.startsWith("/")) {
                    // 调用插件上下文的 resolve 方法，自动经过路径解析插件的处理
                    const resolved = await this.resolve(modSource, importer);
                    if (resolved) {
                        ms.overwrite(modStart, modEnd, resolved.id);
                    }
                }
            }
            return {
                code: ms.toString(),
                map: ms.generateMap(),
            };
        }
    }
}