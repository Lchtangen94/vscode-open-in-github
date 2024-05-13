module.exports = {
    root: true,
    env: {
        node: true,
        es6: true,
    },
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
    },
    extends: [
        'eslint:recommended',
        'plugin:prettier/recommended',
    ],
    rules: {
        // Add your custom rules here 
    },
};