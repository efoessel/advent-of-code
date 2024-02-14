/* eslint-env node */
module.exports = {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    root: true,
    ignorePatterns: ["run/**/*.ts"],
    rules: {
        "prefer-const": ["error", { "destructuring": "all" }],
        "@typescript-eslint/no-namespace": ["off"]
    }
};