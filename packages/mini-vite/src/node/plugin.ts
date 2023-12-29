import { LoadResult, ObjectHook, PartialResolvedId, TransformPluginContext, TransformResult, Plugin as RollupPlugin } from "rollup";
import { ServerContext } from "./server";

export type ServerHook = (
  server: ServerContext
) => (() => void) | void | Promise<(() => void) | void>;

// type ObjectHook<T, O = {}> = T | ({ handler: T; order?: 'pre' | 'post' | null } & O);

// 只实现以下这几个钩子
export interface Plugin extends RollupPlugin {
  name: string;
  configureServer?: ServerHook;
  resolveId?: (
    id: string,
    importer?: string
  ) => Promise<PartialResolvedId | null> | PartialResolvedId | null;
  load?: (id: string) => Promise<LoadResult | null> | LoadResult | null;
  transform?: ObjectHook<(
    this: Partial<TransformPluginContext> & Pick<TransformPluginContext, 'resolve'>,
    code: string,
    id: string,
    options?: { ssr?: boolean },
  ) => Promise<TransformResult | null> | TransformResult | null>;
  transformIndexHtml?: (raw: string) => Promise<string> | string;
}
