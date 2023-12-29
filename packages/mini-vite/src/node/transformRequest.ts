import { SourceMap } from 'rollup';
import { ServerContext } from './server';
import { cleanUrl } from './utils';

export interface TransformOptions {
  html?: boolean;
}

export interface TransformResult {
  code: string;
  map?: SourceMap | { mappings: '' } | null;
  etag?: string;
  deps?: string[];
  dynamicDeps?: string[];
}

export async function transformRequest(
  url: string,
  server: ServerContext,
  options: TransformOptions = {}
): Promise<TransformResult | null> {
    const { pluginContainer } = server;
    url = cleanUrl(url);
    // 依次调用插件容器的 resolveId、load、transform 方法
    // console.log('>>>transformRequest', url);
    const resolvedResult = await pluginContainer.resolveId(url);
    let transformResult: TransformResult | null = null;
    if (resolvedResult?.id) {
      // console.log('>>>resolvedResult?.id', resolvedResult?.id);
      const loadResult = await pluginContainer.load(resolvedResult.id);
      let code = loadResult;
      if (loadResult && typeof loadResult === "object" && 'code' in loadResult) {
        code = loadResult.code;
      }
      if (typeof code === 'string') {
        transformResult = await pluginContainer.transform(
          code,
          resolvedResult?.id
        );
      }
    }
    return Promise.resolve(transformResult);
}
