const withPlugins = require("next-compose-plugins");
// https://github.com/vercel/next.js/issues/20722
const withTM = require("next-transpile-modules")([
  "@react-three/drei",
  "three",
]);

module.exports = withPlugins([withTM], {
  // https://github.com/netlify/next-on-netlify#caveats
  target: "serverless",
  async redirects() {
    return [
      {
        source: "/",
        destination: "/my-spaces",
        permanent: false,
      },
    ];
  },
});
