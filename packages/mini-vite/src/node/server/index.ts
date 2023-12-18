import connect from 'connect';
import colors from 'picocolors';
import { readFileSync } from 'node:fs';
import { optimizeDeps } from '../optimizer';

const { version } = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url)).toString()
);

export async function startDevServer() {
  const app = connect();
  const startTime = Date.now();
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
