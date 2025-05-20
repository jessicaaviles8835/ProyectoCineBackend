module.exports = {
  mutate: ["routes/**/*.js"],
  testRunner: "jest",
  jest: {
    projectType: "custom",
    config: require('./jest.config.js')
  },
  reporters: ["clear-text", "progress", "html"],
  coverageAnalysis: "off"
};