module.exports = {
  root: true,
  extends: [
    'standard',
    'plugin:vue/recommended'
  ],
  // 'prettier',
  // 'prettier/standard',
  // 'prettier/vue'
  plugins: ['standard', 'vue'], // , 'prettier'
  rules: {
    // 'prettier/prettier': [
    //   'error',
    //   {
    //     semi: false,
    //     singleQuote: true
    //   }
    // ],
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'any'
        }
      }
    ],
    eqeqeq: ['off'],
    'vue/require-prop-types': ['off'],
    'vue/require-default-prop': ['off'],
    'vue/order-in-components': ['off'],
    'no-redeclare': 0
  },
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    es6: true,
    node: true
  }
}
