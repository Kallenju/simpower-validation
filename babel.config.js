const { NODE_ENV, BROWSERSLIST_ENV: browsers } = process.env;

let params = {
  presets: [
    [
      '@babel/preset-env',
      {
        browserslistEnv: browsers,
        useBuiltIns: 'usage',
        corejs: { version: '3.26', proposals: true },
      },
    ],
  ],

  exclude: [/node_modules/, /core-js/, /webpack/],
};

if (NODE_ENV === 'test') {
  params = {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: 'current',
          },
        },
      ],
    ],
  };
}

module.exports = params;
