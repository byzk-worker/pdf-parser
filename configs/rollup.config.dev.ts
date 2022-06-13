import { RollupOptions, RollupWarning, WarningHandler } from "rollup";
import babel from "@rollup/plugin-babel";

import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
// import postcss from "@yinxulai/rollup-plugin-less";
import url from "@rollup/plugin-url";
import posthtml from "rollup-plugin-posthtml-template";
import nodePolyfills from "rollup-plugin-polyfill-node";
import builtins from "rollup-plugin-node-builtins";
import globals from "rollup-plugin-node-globals";
import json from "@rollup/plugin-json";

// import base64 from "postcss-font-base64";
const packageInfo = require("../package.json");

const path = require("path");

const autoprefixer = require("autoprefixer");
const postcss = require("rollup-plugin-postcss");
const less = require("less");

const resolveFile = function (...filePath) {
  return path.join(__dirname, "..", ...filePath);
};

function onwarn(warning: RollupWarning, defaultHandler: WarningHandler) {
  if (warning.code === "CIRCULAR_DEPENDENCY" || warning.code === "EVAL") {
    return;
  }
  defaultHandler(warning);
}

const processLess = function (context, payload) {
  return new Promise((resolve, reject) => {
    less.render(
      {
        file: context,
      },
      function (err, result) {
        if (!err) {
          resolve(result);
        } else {
          reject(err);
        }
      }
    );

    less.render(context, {}).then(
      function (output) {
        // output.css = string of css
        // output.map = string of sourcemap
        // output.imports = array of string filenames of the imports referenced
        if (output && output.css) {
          resolve(output.css);
        } else {
          reject({});
        }
      },
      function (err) {
        reject(err);
      }
    );
  });
};

const configs: RollupOptions = {
  input: "src/index.ts",
  output: [
    {
      file: resolveFile("build", "dist", packageInfo.libName + ".js"),
      format: "iife",
      name: packageInfo.libName,
      sourcemap: true,
      // globals: {
      //   "@byzk/document-reader":"documentReader"
      // }
      // plugins: [
      //   posthtml({
      //     directives: [{ name: "%", start: "<", end: ">" }],
      //   }),
      // ],
      // banner:
      //   "window.global = {XMLHttpRequest, setTimeout, ReadableStream, ArrayBuffer, location}; process.nextTick = function(){}; process.stderr={};",
    },
  ],
  onwarn,
  // external: ["@byzk/document-reader"],
  plugins: [
    json(),
    // postcss({
    //   cssModule: true,
    //   insert: true,
    // }),
    // posthtml({
    //   template: true,
    // }),
    posthtml({
      directives: [{ name: "%", start: "<", end: ">" }],
      template: true,
    }),
    postcss({
      // modules: true,
      extract: false,
      minimize: false,
      process: processLess,
      plugins: [autoprefixer({ add: true })],
    }),
    url({
      include: [
        "**/*.svg",
        "**/*.png",
        "**/*.jp(e)?g",
        "**/*.gif",
        "**/*.webp",
        "**/*.ttf",
        "**/*.woff",
        "**/*.woff2",
      ],
    }),
    typescript({}),
    commonjs(),
    // builtins(),
    nodeResolve({ browser: true, preferBuiltins: false }),

    // globals(),
    // nodePolyfills({
    //   baseDir: "src",
    // }),
    babel({
      exclude: "node_modules/**", // 防止打包node_modules下的文件
      babelHelpers: "runtime", // 使plugin-transform-runtime生效
      // 使用预设
      presets: [
        [
          "@babel/preset-env",
          {
            modules: false,
            useBuiltIns: "usage",
            corejs: "3.22.1",
            // 目标浏览器
            // "targets": {
            //   "edge": '17',
            //   "firefox": '60',
            //   "chrome": '67',
            //   "safari": '11.1',
            //   'ie': '6',
            // },
          },
        ],
        // ['env', {
        //   modules: false,
        //   useBuiltIns: false,
        //   targets: {
        //     browsers: [
        //       '> 1%',
        //       'last 2 versions',
        //       'Firefox ESR',
        //     ],
        //   },
        // }]
      ],
      plugins: [
        //  多次导入的文件，只导入一次
        ["@babel/plugin-transform-runtime"],
      ],
    }),
    serve({
      // 装备serve武器并配置参数
      port: 3008,
      contentBase: [resolveFile("")],
    }),
    livereload(resolveFile("build", "dist")),
  ],
};

export default configs;
