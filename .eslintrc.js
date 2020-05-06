module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
    ],
    extends: [
        'gemini-testing',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    rules: {
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-member-accessibility": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "prefer-rest-params": "off",
        "@typescript-eslint/no-use-before-define": [
            "error",
            {
                functions: false,
                classes: false,
                variables: true,
                typedefs: false,
            },
        ],
        "@typescript-eslint/no-parameter-properties": "off",
        "no-prototype-builtins": "off"
    }
};
