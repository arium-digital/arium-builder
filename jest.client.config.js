/* eslint-disable @typescript-eslint/no-var-requires */
const _ = require('lodash')
const fs = require('fs');


const mergeJsonAndSave = (originalJsonPath, targetPath, newMapping) => {
  const raw_content = fs.readFileSync(originalJsonPath, 'utf8')
  const content = JSON.parse(raw_content)
  const merged = _.merge({}, content, newMapping)
  fs.writeFileSync(targetPath, JSON.stringify(merged))
  return targetPath
}


module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jsdom',
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    //https://stackoverflow.com/a/57350968
    "\\.(css|sass|scss)$": "identity-obj-proxy",
  },
  roots: [
    "./src/"
  ],
  globals: {
    'ts-jest': {
      tsconfig: mergeJsonAndSave(
        'tsconfig.json',
        'tsconfig.test.json',
        {
          compilerOptions: {
            jsx: "react-jsx"
          }
        }
      )
    }
  }
};