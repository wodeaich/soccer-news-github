module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: "@babel/eslint-parser",
    requireConfigFile: false
  },
  extends: ["@nuxtjs", "plugin:nuxt/recommended", "prettier"],
  // 第三方压缩库与生成数据不参与 lint
  ignorePatterns: ["static/", "content/", "dist/"],
  plugins: [],
  // add your custom rules here
  rules: {
    // 禁用所有 TypeScript 类型检查规则
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/ban-ts-ignore": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "no-console": "off",
    "vue/multi-word-component-names": "off"
  }
};
