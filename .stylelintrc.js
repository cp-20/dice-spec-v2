export default {
  extends: ['stylelint-config-standard', 'stylelint-config-recess-order'],
  rules: {
    'import-notation': null,
    'at-rule-no-unknown': [
      true,
      { ignoreAtRules: ['tailwind', 'layer', 'apply', 'plugin', 'custom-variant', 'theme', 'utility'] },
    ],
    'at-rule-prelude-no-invalid': [true, { ignoreAtRules: ['apply'] }],
    'function-url-quotes': 'always',
    'hue-degree-notation': 'number',
    'alpha-value-notation': 'number',
  },
};
