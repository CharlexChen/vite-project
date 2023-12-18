export const externalTypes = [
    'css',
    // supported pre-processor types
    'less',
    'sass',
    'scss',
    'styl',
    'stylus',
    'pcss',
    'postcss',
    // wasm
    'wasm',
    // known SFC types
    'vue',
    'svelte',
    'marko',
    'astro',
    'imba',
    // JSX/TSX may be configured to be compiled differently from how esbuild
    // handles it by default, so exclude them as well
    'jsx',
    'tsx',
]