module.exports = {
  presets: [
    [
      "@babel/preset-react",
      {
        runtime: "classic",
        pure: false, // 是否开启纯函数模式（为了便于阅读编译后的代码，这里设置为false）
      },
    ],
  ],
};
