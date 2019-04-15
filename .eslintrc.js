module.exports = {
  root: true,
  extends: [
    'standard'
  ],
  //'plugin:vue/recommended'
  parser: "babel-eslint",
  // 'prettier',
  // 'prettier/standard',
  // 'prettier/vue'
  plugins: ['standard'], // , 'prettier' 'vue'
  rules: {
    // 'prettier/prettier': [
    //   'error',
    //   {
    //     semi: false,
    //     singleQuote: true
    //   }
    // ],
    // 'vue/html-self-closing': [
    //   'error',
    //   {
    //     html: {
    //       void: 'any'
    //     }
    //   }
    // ],
    eqeqeq: ['off'],
    // 'vue/require-prop-types': ['off'],
    // 'vue/require-default-prop': ['off'],
    // 'vue/order-in-components': ['off']
  },
  parserOptions: {
    ecmaVersion: 7,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      modules: true,
      experimentalObjectRestSpread: true
    }
  },
  env: {
    es6: true,
    node: true
  }
}
