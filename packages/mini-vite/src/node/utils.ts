import path from "path"
import os from "os";
export function slash(p: string): string {
  return p.replace(/\\/g, "/");
}

export const isWindows = os.platform() === "win32";


export function normalizePath(id: string): string {
  return path.posix.normalize(isWindows ? slash(id) : id);
}

const escapeRegexRE = /[-/\\^$*+?.()|[\]{}]/g
export function escapeRegex(str: string): string {
  return str.replace(escapeRegexRE, '\\$&')
}

const knownJsSrcRE =
  /\.(?:[jt]sx?|m[jt]s|vue|marko|svelte|astro|imba|mdx)(?:$|\?)/

export const isJSRequest = (url: string): boolean => {
  url = cleanUrl(url)
  if (knownJsSrcRE.test(url)) {
    return true
  }
  if (!path.extname(url) && url[url.length - 1] !== '/') {
    return true
  }
  return false
}

export const QEURY_RE = /\?.*$/s;
export const HASH_RE = /#.*$/s;
export const cleanUrl = (url: string): string =>
  url.replace(HASH_RE, "").replace(QEURY_RE, "");

const knownTsRE = /\.(?:ts|mts|cts|tsx)(?:$|\?)/
export const isTsRequest = (url: string): boolean => knownTsRE.test(url)

const importQueryRE = /(\?|&)import=?(?:&|$)/
export const isImportRequest = (url: string): boolean => importQueryRE.test(url)