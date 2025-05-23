// module.exports = function (api) {
//     api.cache(true);
//     return { presets: ["babel-preset-expo"] };
//   };
  
// babel.config.cjs
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // any plugins you were already using, e.g.
    // plugins: ["@babel/plugin-proposal-class-properties"],
  };
};