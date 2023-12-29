import fse from "fs-extra";
import { Plugin } from "../plugin";

export const CSS_LANGS_RE = /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:$|\?)/;
  
export const isCSSRequest = (request: string): boolean => CSS_LANGS_RE.test(request);

export function cssPlugin(): Plugin {
  return {
    name: "vite:css",
    load(id: string) {
      if (isCSSRequest(id)) {
        return fse.readFile(id, "utf-8");
      }
    },
    async transform(code: string, id: string) {
      if (!isCSSRequest(id)) {
        return null;
      }
      // 将css样式代码转成style标签并塞到页面的head下，达成样式引入的目的
      const cssModule = `
const css = "${code.replace(/\n/g, "")}";
const style = document.createElement("style");
style.setAttribute("type", "text/css");
style.innerHTML = css;
document.head.appendChild(style);
export default css;
`.trim();
      return {
        code: cssModule,
      };
    },
  };
}