import { CustomPluginOptions, PartialResolvedId, SourceDescription, SourceMap, LoadResult, PluginContext, ResolvedId } from "rollup";
import { Plugin } from "../plugin";

export interface PluginContainer {
//   options: InputOptions;
//   getModuleInfo(id: string): ModuleInfo | null;
//   buildStart(options: InputOptions): Promise<void>;
  resolveId(
    id: string,
    importer?: string,
    options?: {
      attributes?: Record<string, string>;
      custom?: CustomPluginOptions;
      skip?: Set<Plugin>;
      ssr?: boolean;
      /**
       * @internal
       */
      scan?: boolean;
      isEntry?: boolean;
    }
  ): Promise<PartialResolvedId | null>;
  transform(
    code: string,
    id: string,
    options?: {
      inMap?: SourceDescription['map'];
      ssr?: boolean;
    }
  ): Promise<{ code: string; map?: SourceMap | { mappings: '' } | null }>;
  load(
    id: string,
    options?: {
      ssr?: boolean;
    }
  ): Promise<LoadResult | null>;
//   watchChange(
//     id: string,
//     change: { event: 'create' | 'update' | 'delete' }
//   ): Promise<void>;
//   close(): Promise<void>;
}
export const createPluginContainer = (config: { plugins: Plugin[] }): PluginContainer => {
    const plugins = config.plugins;
    // 插件上下文对象
    class Context implements Pick<PluginContext, 'resolve'> {
      async resolve(id: string, importer?: string) {
        let out = await pluginContainer.resolveId(id, importer);
        if (typeof out === "string") out = { id: out };
        return out as ResolvedId | null;
      }
    }
    // 插件容器
    const pluginContainer: PluginContainer = {
      async resolveId(id: string, importer?: string) {
        const ctx = new Context();
        for (const plugin of plugins) {
          if (plugin.resolveId) {
            const newId = await plugin.resolveId.call(ctx, id, importer);
            if (newId) {
              id = typeof newId === "string" ? newId : newId.id;
              return { id };
            }
          }
        }
        return null;
      },
      async load(id) {
        const ctx = new Context();
        for (const plugin of plugins) {
          if (plugin.load) {
            const result = await plugin.load.call(ctx, id);
            if (result) {
              return result;
            }
          }
        }
        return null;
      },
      async transform(code, id) {
        const ctx = new Context();
        for (const plugin of plugins) {
          if (plugin.transform) {
            let result = null;
            if ('handler' in plugin.transform) {
              result = await plugin.transform.handler.call(ctx, code, id);
            } else {
              result = await plugin.transform.call(ctx, code, id);
            }
            if (!result) continue;
            if (typeof result === "string") {
              code = result;
            } else if (result.code) {
              code = result.code;
            }
          }
        }
        return { code };
      },
    };
  
    return pluginContainer;
  };