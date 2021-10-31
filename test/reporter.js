/*

copied from https://raw.githubusercontent.com/jodonnell/jest-simple-dot-reporter/a51d89bf94110b0de99d76d6e6d119a2994b9be3/jest-simple-dot-reporter.js with MIT license documented in package.json

Copyright 2021 Jacob O'Donnell

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

class JestSimpleDotReporter {
    constructor(globalConfig, options) {
        this._globalConfig = globalConfig;
        this._options = options;
        this._reset = '';
        this._red = '';
        this._green = '';
        this._yellow = '';
        if (this._options.color) {
            this._reset = '\x1b[0m';
            this._red = '\x1b[31m';
            this._green = '\x1b[32m';
            this._yellow = '\x1b[33m';
        }
    }

    onRunStart(test) {
        this._numTestSuitesLeft = test.numTotalTestSuites;
    }

    onRunComplete(test, results) {
        const {
            numFailedTests,
            numPassedTests,
            numPendingTests,
            testResults,
            numTotalTests,
            numTotalTestSuites,
            startTime,
        } = results;

        console.log();
        testResults.map(({failureMessage}) => {
            if (failureMessage) {
                console.error(failureMessage);
            }
        });


        if (!results.snapshot.didUpdate && results.snapshot.unchecked) {
            console.error(`${this._red}obsolete snapshot(s) found.${this._reset}`);
        }

        console.log(`Ran ${numTotalTests} tests from ${numTotalTestSuites} files in ${testDuration()}`);
        console.log(`${this._green}${numPassedTests || 0} passing${this._reset}`);
        if (numFailedTests) {
            console.log(`${this._red}${numFailedTests} failing${this._reset}`);
        }
        if (numPendingTests) {
            console.log(`${this._yellow}${numPendingTests} pending${this._reset}`);
        }

        function testDuration() {
            const end = new Date();
            const start = new Date(startTime);

            const seconds = (end - start) / 1000;
            return `${seconds} s`;
        }
    }

    onTestResult(test, testResult) {
        process.stdout.write(' ');
        const marks = {
          passed: '.',
          pending: '-',
        };
        const colors = {
          passed: this._green,
          pending: this._yellow,
        };

        const fail_mark = 'X';
        const fail_color = this._red;
        for (var i = 0; i < testResult.testResults.length; i++) {
            const mark = marks[testResult.testResults[i].status] || fail_mark;
            const color = colors[testResult.testResults[i].status] || fail_color;
            process.stdout.write(`${color}${mark}${this._reset}`);
        }

        if (!--this._numTestSuitesLeft && this._globalConfig.collectCoverage) {
            console.log()
        }
    }
}

module.exports = JestSimpleDotReporter;
