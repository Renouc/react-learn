// babel.config.js
module.exports = {
  presets: [
    "@babel/preset-env", // 转换现代 JavaScript 语法
    [
      "@babel/preset-react",
      {
        runtime: "classic",
      },
    ],
  ],
};
