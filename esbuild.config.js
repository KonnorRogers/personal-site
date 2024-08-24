const build = require("./config/esbuild.defaults.js")
const esbuild = require("esbuild")

// Update this if you need to configure a destination folder other than `output`
const outputFolder = "output"

// You can customize this as you wish, perhaps to add new esbuild plugins.
//
// ```
// const path = require("path")
// const esbuildCopy = require('esbuild-plugin-copy').default
// const esbuildOptions = {
//   plugins: [
//     esbuildCopy({
//       assets: {
//         from: [path.resolve(__dirname, 'node_modules/somepackage/files/*')],
//         to: [path.resolve(__dirname, 'output/_bridgetown/somepackage/files')],
//       },
//       verbose: false
//     }),
//   ]
// }
// ```
//
// You can also support custom base_path deployments via changing `publicPath`.
//
// ```
// const esbuildOptions = { publicPath: "/my_subfolder/_bridgetown/static" }
// ```

/** @return {import("esbuild").Plugin} */
const Analyzer = () => {
  return {
    name: "Analyzer",
    async setup (build) {
      // build.onEnd(async (result) => {
      //   const analysis = await esbuild.analyzeMetafile(result.metafile, {})
      //   console.log(analysis)
      // })
    }
  }
}

/**
 * @typedef { import("esbuild").BuildOptions } BuildOptions
 * @type {BuildOptions}
 */
const esbuildOptions = {
  format: "esm",
  splitting: true,
  target: "es2020",
  entryPoints: [
    "./frontend/javascript/index.js",
    "./frontend/javascript/defer.js",
  ],
  plugins: [
    Analyzer()
  ]
}

build(outputFolder, esbuildOptions)
