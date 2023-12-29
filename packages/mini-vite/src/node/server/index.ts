import connect from 'connect';
import colors from 'picocolors';
import { readFileSync } from 'node:fs';
import { optimizeDeps } from '../optimizer';

import { createPluginContainer, PluginContainer } from "./pluginContainer";
import { Plugin } from "../plugin";
import { indexHtmlMiddleware } from './middlewares/indexHtml';
import { transformMiddleware } from './middlewares/transform';
import { resolvePlugin } from '../plugins/resolve';
import { esbuildTransformPlugin } from '../plugins/esbuild';
import { importAnalysisPlugin } from '../plugins/importAnalysis';
import { cssPlugin } from '../plugins/css';

export interface ServerContext {
  root: string;
  pluginContainer: PluginContainer;
  app: connect.Server;
  plugins: Plugin[];
}

const { version } = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url)).toString()
);

export async function startDevServer() {
  const app = connect();
  const startTime = Date.now();

  // MOCK用到的插件
  const plugins: Plugin[] = [resolvePlugin(), esbuildTransformPlugin(), importAnalysisPlugin(), cssPlugin()];
  const pluginContainer = createPluginContainer({
    plugins
  });
  const serverContext: ServerContext = {
    root: process.cwd(),
    app,
    pluginContainer,
    plugins,
  };

  for (const plugin of plugins) {
    if (plugin.configureServer) {
      await plugin.configureServer(serverContext);
    }
  }
  app.use(indexHtmlMiddleware(serverContext));
  app.use(transformMiddleware(serverContext));
  const port = 3001;
  app.listen(port, async () => {
    await optimizeDeps({ root: process.cwd() });
    console.log(colors.green('🚀 Hello，恭喜你，开发服务器启动成功 🚀'));
    const startupDurationString = startTime
      ? colors.dim(
          `ready in ${colors.reset(
            colors.bold(Math.ceil(Date.now() - startTime))
          )} ms`
        )
      : '';
    console.log(
      `\n  ${colors.green(
        `${colors.bold('MINI-VITE')} v${version}`
      )}  ${startupDurationString}\n`
    );
    console.log(
      `  ${colors.green('➜')}  ${colors.bold('Local')}:   ${colors.blue(
        `http://localhost:${port}`
      )}`
    );
  });
}
