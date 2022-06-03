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
      //  {
      //   source: "/",
      //   destination: "https://www.arium.xuz",
      //   permanent: false,
      // },
      {
        source: "/home",
        destination: "/spaces/home",
        permanent: true,
      },
      {
        source: "/weather",
        destination: "/spaces/weather",
        permanent: true,
      },
      {
        source: "/yungspace",
        destination: "/spaces/yungspace",
        permanent: true,
      },
      {
        source: "/showroom",
        destination: "/spaces/showroom",
        permanent: true,
      },
      {
        source: "/yung-xmas",
        destination: "/spaces/yung-xmas",
        permanent: true,
      },
      {
        source: "/theccnyc",
        destination: "/spaces/theccnyc",
        permanent: true,
      },
    ];
  },
});
