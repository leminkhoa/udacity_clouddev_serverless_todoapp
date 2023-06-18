module.exports = {
    globals: {
      'ts-jest': {
        diagnostics: {
          ignoreCodes: [151001]
        }
      }
    },
    "roots": [
      "<rootDir>/tests"
    ],
    "transform": {
      "^.+\\.tsx?$": "ts-jest"
    },
    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
    "moduleFileExtensions": [
      "ts",
      "js",
      "json",
      "node"
    ],
  }
  