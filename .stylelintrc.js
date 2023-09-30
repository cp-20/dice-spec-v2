module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-recess-order'],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'layer', 'apply'],
      },
    ],
    'function-url-quotes': 'always',
    'hue-degree-notation': 'number',
    'alpha-value-notation': 'number',
  },
};
