module.exports = {
    "env": {
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 13,
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
        "no-use-before-define": "error", // 禁止在变量定义之前使用它们
        "block-scoped-var": "error", // 强制把变量的使用限制在其定义的作用域范围内
        "no-shadow": "error", // 禁止变量声明与外层作用域的变量同名
        "@typescript-eslint/explicit-module-boundary-types": "off" // ts每个函数都要显式声明返回值
    }
};
