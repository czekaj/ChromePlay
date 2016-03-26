module.exports = {
  entry: {
    background: "./js/background",
    content: "./js/content",
  },
  output: {
    path: "build",
    filename: "[name].bundle.js",
  },
  devtool: "source-map",
};
