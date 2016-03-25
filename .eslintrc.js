module.exports = {
    "extends": "airbnb",
    "plugins": [
        "react"
    ],
    "globals": {
      "chrome": true
    },
    "env": {
      "browser": true,
      "node": true,
      "mocha": true,
      "commonjs": true
    },
    "rules": {
      "func-names": 0,
      "quotes": [1, "double"],
      "indent": [1, 2],
      "prefer-arrow-callback": 0,
      "no-unused-expressions": [2, {
            allowShortCircuit: true
        }],
      "no-cond-assign" : [2,"except-parens"],
      "strict" : [0, "safe"],
      "no-param-reassign": 0,
    }
};
