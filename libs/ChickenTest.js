(function () {
	"use strict";

	//-------------------------------------------------------------------------------------------//
	// Public API
	//-------------------------------------------------------------------------------------------//

	// Test assertions
	var Assert = {
		isEqual: function isEqual(expected, actual, message) {
			if (actual != expected) {
				message = _buildMessage("Assert isEqual failed. Exepected = " + expected + ", actual = " + actual, message);
				throw new Error(message);
			}
		},

		isSame: function isSame(expected, actual, message) {
			if (actual !== expected) {
				message = _buildMessage("Assert isSame failed. Exepected = " + expected + ", actual = " + actual, message);
				throw new Error(message);
			}
		},

		arrayEqual: function arrayEqual(expected, actual, message) {
			if (expected.length != actual.length) {
				message = _buildMessage("Assert arrayEqual failed. Expected length = " + expected.length + ", actual length = " + actual.length, message);
				throw new Error(message);
			}

			for (var i = 0; i < expected.length; i++) {
				if (expected[i] != actual[i]) {
					message = _buildMessage("Assert arrayEqual failed. Array content mismatch.", message);
					throw new Error(message);
				}
			}
		},

		isTrue: function isTrue(value, message) {
			if (!value) {
				message = _buildMessage("Assert isTrue failed", message);
				throw new Error(message);
			}
		},

		isFalse: function isFalse(value, message) {
			if (value) {
				message = _buildMessage("Assert isFalse failed", message);
				throw new Error(message);
			}
		},

		isNull: function isNull(value, message) {
			if (value !== null) {
				message = _buildMessage("Assert isNull failed", message);
				throw new Error(message);
			}
		},

		isUndefined: function isUndefined(value, message) {
			if (typeof value !== "undefined") {
				message = _buildMessage("Assert isUndefined failed", message);
				throw new Error(message);
			}
		},

		isNullOrUndefined: function isNullOrUndefined(value, message) {
			if ((value !== null) && (typeof value !== "undefined")) {
				message = _buildMessage("Assert isNullOrUndefined failed", message);
				throw new Error(message);
			}
		},

		isNotNull: function isNotNull(value, message) {
			if (value === null) {
				message = _buildMessage("Assert isNotNull failed", message);
				throw new Error(message);
			}
		},

		isNotUndefined: function isUndefined(value, message) {
			if (typeof value === "undefined") {
				message = _buildMessage("Assert isNotUndefined failed", message);
				throw new Error(message);
			}
		},

		isNotNullOrUndefined: function isNullOrUndefined(value, message) {
			if ((value === null) || (typeof value === "undefined")) {
				message = _buildMessage("Assert isNotNullOrUndefined failed, value was " + (typeof value == "undefined" ? "undefined" : "null"), message);
				throw new Error(message);
			}
		},

		fail: function fail(message) {
			throw new Error(_buildMessage("Failed", message));
		},

		expectedException: function expectedException(details, func, message) {
			details = details || {};

			try {
				func();
			}
			catch (ex) {
				if (details.type && !(ex instanceof details.type)) {
					message = _buildMessage("Wrong exception type thrown. Expected = " + details.type.name + ", Actual = " + ex.constructor.name, message)
					throw new Error(message);
				}

				if (details.message && ex.message.match(details.message) == null) {
					message = _buildMessage("Wrong exception message thrown. Expected = '" + details.message + "', Actual = '" + ex.message + "'", message)
					throw new Error(message);
				}

				// If we got here, then the exception was what we expected and we can return safely
				return;
			}

			throw new Error(_buildMessage("No exception thrown", message));
		},
	};

	// Assert Aliases
	Assert.areEqual = Assert.isEqual;

	// General utility functions
	var Test = {
		// Add a test entry to the output
		// Returns a function to indicate if the test has passed or failed
		addTestEntry: function addTestEntry(testName) {
			var containerDiv = document.createElement("div");
			var titleDiv = document.createElement("div");
			titleDiv.innerText = testName + " ";
			var passFailSpan = document.createElement("span");
			passFailSpan.innerText = "[...]";
			titleDiv.appendChild(passFailSpan);
			containerDiv.appendChild(titleDiv);

			// Set up the output div
			_logDiv = document.createElement("div");
			_logDiv.style.display = "none";
			titleDiv.onclick = function () {
				if (this.style.display === "none") {
					this.style.display = "block";
				}
				else {
					this.style.display = "none";
				}
			}.bind(_logDiv);
			containerDiv.appendChild(_logDiv);
			document.getElementById("output").appendChild(containerDiv);

			// Function to pass or fail the test
			return function complete(passed, errorMessage) {
				if (passed) {
					containerDiv.classList.add("passed");
					passFailSpan.innerText = "[PASSED]";
					passFailSpan.parentElement.style.color = "green";
				}
				else {
					containerDiv.classList.add("failed");
					passFailSpan.innerText = "[FAILED] - " + errorMessage;
					passFailSpan.parentElement.style.color = "red";
				}
			};
		},

		// Write to the test output
		log: function log(text, color) {
			var div = document.createElement("div");
			div.innerHTML = Test.htmlEscape(text);
			div.style.color = color || "black";
			var target = _logDiv || document.getElementById("output");
			target.appendChild(div);
		},
		// Log an exception to the output
		logException: function logException(ex) {
			Test.log(ex.stack, "red");
		},

		// Escape a string so that it preserves formatting in innerHTML
		htmlEscape: function htmlEscape(text) {
			return text
				.replace(/</g,"&lt;")
				.replace(/>/g,"&gt;")
				.replace(/ /g, "&nbsp;")
				.replace(/\r\n/g, "<br />")
				.replace(/\n/g, "<br />")
				.replace(/\r/g, "<br />");
		},

		// Register a script to load by the framework
		addScripts: function addScripts() {
			for (var i = 0; i < arguments.length; i++) {
				_scriptsToLoad.push(arguments[i]);
			}
		},

		// Mock a function on an object with a replacement implementation
		// Returns an object that contains the logged function calls
		// .reset() on returned object restores the original function
		mock: function mock(obj, funcName, mockFunc) {
			var mock;
			var wrappedFunc = function () {
				var r;

				mock.calls.push(arguments);
				if (mockFunc) {
					try {
						r = mockFunc.apply(obj, arguments);
					}
					catch (ex) {
						mock.exceptions.push(ex);
						mock.returns.push(r);
						throw ex;
					}
				}

				mock.exceptions.push(null);
				mock.returns.push(r);
				return r;
			};

			mock = _applyMock(obj, funcName, wrappedFunc);

			return mock;
		},

		// Spy on a function on an object
		// Returns an object that contains the logged function calls
		// .reset() on returned object restores the original function
		spy: function spy(obj, funcName) {
			var mock;
			var spyFunc = function () {
				mock.calls.push(arguments);
				var r;
				try {
					r = mock.originalFunc.apply(obj, arguments);
				}
				catch (ex) {
					mock.returns.push(r);
					mock.exceptions.push(ex);
					throw ex;
				}
				mock.returns.push(r);
				mock.exceptions.push(null);
				return r;
			};

			mock = _applyMock(obj, funcName, spyFunc);

			return mock;
		},

		// Return a simple function object than can be used to monitor calls to it
		// This can be used to monitor correct callback and event behaviour
		// Returns can be a single value or an array of values
		monitor: function monitor(returns) {
			var monitorFunc = function () {
				monitorFunc.calls.push(arguments);

				if (Array.isArray(returns)) {
					if (returns.length != 1) {
						return returns.shift();
					}
					return returns[0];
				}
				return returns;
			};
			monitorFunc.calls = [];
			return monitorFunc;
		},
	};


	//-------------------------------------------------------------------------------------------//
	// Internal implementation details
	//-------------------------------------------------------------------------------------------//

	// Test execution state
	var _testList = [];
	var _progress = {
		passed: 0,
		failed: 0,
	};
	var _testComplete = null;		// Function to mark a current test output div as passed or failed
	var _logDiv = null;				// The log output div for the currently executing test
	var _scriptsToLoad = [];		// The list of scripts we need to make sure a loaded before running tests
	var _failedToLoad = false;		// A flag to indicate that a script has failed to load

	// Builds an assert failure message
	var _buildMessage = function _buildMessage(fromAssert, fromTest) {
		if (fromTest) {
			return fromAssert + ": " + fromTest;
		}
		return fromAssert;
	};

	// Returns the first line of an exception to use as a summary
	var _getExceptionSummary = function _getExceptionSummary(ex) {
		return ex.message.split("\n")[0];
	};

	// Function to update the current progress
	var _updateProgress = function _updateProgress() {
		document.getElementById("total").innerText = "Total = " + (_progress.passed + _progress.failed);
		document.getElementById("passed").innerText = "Passed = " + _progress.passed;
		document.getElementById("failed").innerText = "Failed = " + _progress.failed;
	};

	// Executes a single test by shifting it from the test list and handling the passed/failed state
	var _execTest = function _execTest() {
		var test = _testList.shift();
		try {
			// Execute any code that needs to run before the test
			test.class.beforeTest && test.class.beforeTest();
			test.func.before && test.func.before();

			test.func.apply(test.class, [test.testData]);

			_progress.passed++;
			_testComplete(true);
		}
		catch (e) {
			// Log the test failure
			_progress.failed++;
			_testComplete(false, _getExceptionSummary(e));
			Test.logException(e);
		}

		// Execute any code that needs to run after the test
		test.func.after && test.func.after();
		test.class.afterTest && test.class.afterTest();

		// Update the progress in the UI
		_updateProgress();

		// Log a request to execute the next test
		setImmediate(_execNextTest);
	};

	// Execute the next test in the list if there are any left, otherwise report the run complete
	var _execNextTest = function _execNextTest() {
		if (_testList.length) {
			_testComplete = Test.addTestEntry(_testList[0].name);
			_execTest();
		}
		else {
			var div = document.createElement("div");
			div.innerText = "Done.";
			document.getElementById("output").appendChild(div);
		}
	};

	// Load scripts, logging errors until they're all loaded
	var _loadScripts = function _loadScripts(complete) {
		if (_scriptsToLoad.length !== 0) {
			// Remove the next script url from the list
			var url = _scriptsToLoad.shift();

			// Attach the event listeners before we set the source to avoid any race conditions
			var el = document.createElement("script");
			el.onload = function () {
				_loadScripts(complete);
			};
			el.onerror = function () {
				// Script failed to load, so log it in order to prevent the tests runnning
				Test.log("Failed to load " + url, "red");
				_failedToLoad = true;
				_loadScripts(complete);
			};
			document.head.appendChild(el);
			el.src = url;
		}
		else {
			// No more scripts, time to move on
			complete();
		}
	};

	// Global error handler to detect errors while loading scripts
	var _globalErrorHandler = function _globalErrorHandler2(message, file, lineno, colno, error) {
		Test.log("Unhandled Exception", "red");

		// Don't bother with the error as synax errors don't produce anything meaningful in terms of a stack trace
		Test.log(message, "red");
		if (colno) {
			Test.log("  " + file + ":" + lineno + ":" + colno, "red");
		}
		else {
			Test.log("  " + file + ":" + lineno, "red");
		}

		// Stop the tests running if we're still in the loading phase
		_failedToLoad = true;
	}

	// Check if an object member is a valid test candidate
	var _isTest = function _isTest(cls, testName) {
		return (testName !== "beforeTest"
		 && testName !== "afterTest"
		 && testName[0] !== "_"
		 && typeof cls[testName] === "function"
		 && cls.hasOwnProperty(testName));
	};

	// Generate the test qualifier for data driven tests
	var _generatePreName = function _generatePreName(classData, classIteration, functionData, functionIteration) {
		var preName = "";

		if (classData.length > 1) {
			preName += (classData[classIteration].testId || (classIteration + 1)) + ":";
		}

		if (functionData.length > 1) {
			preName += (functionData[functionIteration].testId || (functionIteration + 1)) + ":";
		}

		return preName;
	};

	// Combines two objects into one
	var _combine = function _combine(obj1, obj2) {
		var r = {};

		for (var member in obj1) {
			if (obj1.hasOwnProperty(member)) r[member] = obj1[member];
		}

		for (var member in obj2) {
			if (obj2.hasOwnProperty(member)) r[member] = obj2[member];
		}

		return r;
	};

	// Add all the combinations of the test to the test list based on defined class and function test data
	var _addTest = function _addTest(className, cls, testName) {
		var func = cls[testName];
	 	var classData = cls.testData || [{}];

	 	for (var classIt = 0; classIt < classData.length; classIt++) {
	 		var functionData = func.testData || [{}];

	 		for (var functionIt = 0; functionIt < functionData.length; functionIt++) {
		 		var preName = _generatePreName(classData, classIt, functionData, functionIt);
		 		var testData = _combine(classData[classIt], functionData[functionIt]);

				_testList.push({
					name: preName + className + "." + testName,
					class: cls,
					func: func,
					testData: testData
				});
			}
		}
	};

	// Scan the Tests name space for tests to run
	var _scanForTests = function _scanForTests() {
		for (var className in window.Tests) {
			if (window.Tests.hasOwnProperty(className)) {

				var cls = window.Tests[className];
				for (var testName in cls) {
					// Script private and before/after test functions
					if (_isTest(cls, testName)) {
					 	// Looks to be a valid test, add it to the list
					 	_addTest(className, cls, testName);
					}
				}

			}
		}
	};

	// Apply a mock function to the specified object and return a mock handler
	var _applyMock = function _applyMock(obj, funcName, mockFunc) {
		var originalFunc = obj[funcName];
		if (typeof originalFunc !== "function") throw new Error("Unable to replace " + funcName + " as it is not a function");

		obj[funcName] = mockFunc;

		var mock = {
			originalFunc: originalFunc,
			calls: [],
			returns: [],
			exceptions: [],
			reset: function () {
				obj[funcName] = originalFunc;
			}
		};

		return mock;
	};


	//--------------------------------------------------------------------------------------------/
	// Main entry point and exports
	//--------------------------------------------------------------------------------------------/
	window.Test = Test;
	window.Assert = Assert;
	window.Tests = {};

	// Define a version of setImmediate if there isn't one available on the current platform
	if (!window.setImmediate) {
		window.setImmediate = function setImmediate(callback) {
			return setTimeout(callback, 0);
		};

		window.clearImmediate = function clearImmediate(token) {
			clearTimeout(token);
		};
	}

	window.onload = function () {
		// Build the progress display
		document.getElementById("progress").innerHTML = "<b><span id='total'>Total = 0</span>, <span id='passed'>Passed = 0</span>, <span id='failed'>Failed = 0</span></b> <button id='togglePassed'>Hide Passed</button>";
		document.getElementById("passed").style.color = "green";
		document.getElementById("failed").style.color = "red";
		document.getElementById("togglePassed").onclick = function () {
			var passedTests = document.querySelectorAll("#output .passed");
			var hide = this.innerText === "Hide Passed";
			for (var i = 0; i < passedTests.length; i++) {
				passedTests[i].style.display = hide ? "none" : "";
			}
			this.innerText = hide ? "Show Passed" : "Hide Passed";
		};

		window.onerror = _globalErrorHandler;

		// Start loading the scripts
		_loadScripts(function () {
			// Only run the tests if we managed to load all the required scripts
			if (!_failedToLoad) {
				_scanForTests();
				setImmediate(_execNextTest);
			}
		});
	}

})();
