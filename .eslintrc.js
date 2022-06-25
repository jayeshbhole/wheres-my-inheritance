module.exports = {
  env: {
    browser: false,
    es2021: true,
    mocha: true,
    node: true,
  },
  extends: ["standard", "plugin:prettier/recommended", "plugin:node/recommended"],
  parserOptions: {
    ecmaVersion: 12,
  },
  engines: {
    node: ">=8.0.0",
  },
  overrides: [
    {
      files: ["hardhat.config.js"],
      globals: { task: true },
    },
  ],
};
