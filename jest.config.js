module.exports = {
  clearMocks: true,
  maxWorkers: 1,
  reporters: [
    [ "./reporter", { color: true } ],
  ],
  rootDir: './test',
  verbose: true, // let console.log come through under test
};
