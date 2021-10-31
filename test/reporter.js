/*

copied from https://raw.githubusercontent.com/jodonnell/jest-simple-dot-reporter/a51d89bf94110b0de99d76d6e6d119a2994b9be3/jest-simple-dot-reporter.js with MIT license documented in package.json

Copyright 2021 Jacob O'Donnell

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

const pluralize = (word, count) => `${count} ${word}${count === 1 ? '' : 's'}`;

class JestSimpleDotReporter {
    constructor(globalConfig, options) {
        this._globalConfig = globalConfig;
        this._options = options;
    }

    onRunStart(test) {
        this._numTestSuitesLeft = test.numTotalTestSuites;

        console.log()
        console.log(`Found ${test.numTotalTestSuites} test suites`);
    }

    onRunComplete(test, results) {
        const {
            numFailedTests,
            numPassedTests,
            numTodoTests,
            numPendingTests,
            testResults,
            numTotalTests,
            startTime
        } = results;

        console.log();
        testResults.map(({failureMessage}) => {
            if (failureMessage) {
                console.error(failureMessage);
            }
        });

        if (!results.snapshot.didUpdate && results.snapshot.unchecked) {
            const obsoleteError = pluralize('obsolete snapshot', results.snapshot.unchecked) + ' found.';
            if (this._options.color)
                console.error(`\x1b[31m${obsoleteError}\x1b[0m`);
            else
                console.error(obsoleteError);
        }

        console.log(`Ran ${numTotalTests} tests in ${testDuration()}`);
        process.stdout.write(` ${numPassedTests || 0} passing`);
        process.stdout.write(` ${numFailedTests || 0} failing`);
        process.stdout.write(` ${(numTodoTests || 0) + (numPendingTests || 0)} skipped`);
        console.log();

        function testDuration() {
            const end = new Date();
            const start = new Date(startTime);

            const seconds = (end - start) / 1000;
            return `${seconds} s`;
        }
    }

    onTestResult(test, testResult) {
            for (var i = 0; i < testResult.testResults.length; i++) {
                switch (testResult.testResults[i].status) {
                    case "passed":
                        process.stdout.write(".")
                        break
                    case "skipped":
                    case "pending":
                    case "todo":
                    case "disabled":
                        process.stdout.write("*")
                        break
                    case "failed":
                        process.stdout.write("F")
                        break
                    default:
                        process.stdout.write(`(${testResult.testResults[i].status})`)
                }
            }

        if (!--this._numTestSuitesLeft && this._globalConfig.collectCoverage) {
            console.log()
        }
    }
}

module.exports = JestSimpleDotReporter;
