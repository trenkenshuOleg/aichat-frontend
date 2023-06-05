module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: [],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: "tsconfig.json",
  },
  rules: {
    semi: "off",
    "@typescript-eslint/semi": "off",
  },
};
