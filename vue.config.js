const path = require("path");
function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  baseUrl: "./",
  // outputDir: process.env.VUE_APP_THEME,
  productionSourceMap: false,
  // pluginOptions: {
  //   "style-resources-loader": {
  //     preProcessor: "less",
  //     patterns: [
  //       resolve("src/styles/var.less"),
  //       resolve(`src/styles/themes/${process.env.VUE_APP_THEME}/index.less`)
  //     ]
  //   }
  // },
  chainWebpack: config => {
    config.resolve.alias
      .set("views", resolve("src/views"))
      .set("assets", resolve("src/assets"))
      .set("utils", resolve("src/utils"))
      .set("components", resolve("src/components"))
      .set("api", resolve("src/api"))
      .set("config", resolve("src/config"))
      .set("styles", resolve("src/styles"))
      // .set(
      //   "chart",
      //   resolve(`src/styles/chart/${process.env.VUE_APP_THEME}.js`)
      // )
      ;

    // config.module
    //   .rule("js")
    //   .use("cache-loader")
    //   .tap(options => {
    //     options.cacheIdentifier += process.env.VUE_APP_THEME;
    //     return options;
    //   });
  },
  // devServer: {
  //   open: true,
  //   host: "0.0.0.0",
  //   port: 8084
  // }
};
