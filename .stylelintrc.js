module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-recess-order'],
  rules: {
    'import-notation': 'off',
    'at-rule-no-unknown': [
      true,
      { ignoreAtRules: ['tailwind', 'layer', 'apply', 'plugin', 'custom-variant', 'theme', 'utility'] },
    ],
    'function-url-quotes': 'always',
    'hue-degree-notation': 'number',
    'alpha-value-notation': 'number',
  },
};
