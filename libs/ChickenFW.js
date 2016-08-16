// ChickenFW
// Version: 1.0.0
// Built: 2016-08-16T19:23:18.010Z
// Commit: 338b3d766516493eb81a6f7a96b3d03358e49ecf

// File: js/mix.js
(function () {
    "use strict";

    var mixIntoObj = function mixIntoObj(dst, src) {
        for (var key in src) {
            if (src.hasOwnProperty(key)) {
                dst[key] = src[key];
            }
        }
    };

    window.Chicken = window.Chicken || {};

    // Mix all subsequent objects into the object specified in the first argument
    window.Chicken.mix = function mix() {
        var target = arguments[0];

        for (var  i = 1; i < arguments.length; i++) {
            var component = arguments[i];
            mixIntoObj(target, component);
        }
    },

    // Construct a new object which is a combination of all the specified object
    window.Chicken.combine = function combine() {
        var obj = {};

        for (var i = 0; i < arguments.length; i++) {
            mixIntoObj(obj, arguments[i]);
        }

        return obj;
    };

})();

// File: js/namespace.js
(function () {
    "use strict";

    var namespace = function namespace(path, content, parent) {
        var name;
        var names = path.split(".");
        parent =  parent || window;

        // Navigate/create the object tree
        while (names.length > 1) {
            name = names.shift();
            parent = parent[name] = parent[name] || {};
        }

        if (typeof content === "object") {
            // Mix into the parent
            name = names[0];
            parent = parent[name] = parent[name] || {};

            Chicken.mix(parent, content);
        }
        else {
            // Set the parent directly
            parent[names[0]] = content;
        }
    };

    // Export the the namespace function using itself
    namespace("Chicken.namespace", namespace);
})();

// File: js/class.js
(function () {
    "use strict";

    var Class = function Class(constructor, memberFuncs, properties, statics) {
        memberFuncs && Chicken.mix(constructor.prototype, memberFuncs);
        properties  && Object.defineProperties(constructor.prototype, properties);
        statics     && Chicken.mix(constructor, statics);

        return constructor;
    };

    var registerClass = function registerClass(namespacePath, constructor, memberFuncs, properties, statics) {
        var c = Chicken.Class(constructor, memberFuncs, properties, statics);
        Chicken.namespace(namespacePath, c);
        return c;
    };

    // Export
    Chicken.namespace("Chicken", {
        Class: Class,
        registerClass: registerClass
    });
})();

// File: js/inject.js
(function () {
	"use strict";

	//-----------------------------------------------------------------------------------------------------------------
	// Private classes
	//-----------------------------------------------------------------------------------------------------------------

	// Structure for dependency definition
	function StoredItem(name, dependencies, initor, value) {
		this.name = name;
		this.dependencies = dependencies;
		this.initor = initor;
		this.value = value;
	};


	//-----------------------------------------------------------------------------------------------------------------
	// Private statics
	//-----------------------------------------------------------------------------------------------------------------

	// Central store for registered objects
	var _objectStore = {};

	// Runs some checks on the dependency definition to make sure it looks ok
	function _validateDependenciesVsInitor(name, dependencies, initor) {

		if (typeof name !== "string") throw new Error("Invalid name specified. Must be a string but was " + typeof name);
		if (!Array.isArray(dependencies)) throw new Error("Dependencies weren't passed as an array for '" + name + "'");
		if (typeof initor !== "function") throw new Error("Invalid initor for '" + name + "'");
		if (initor.length !== dependencies.length) throw new Error("Wrong number of dependencies specified for initor provided for '" + name + "'");

	};

	// Store a value in the object store
	function _registerImmediateValue(name, value) {

		if (typeof name !== "string") throw new Error("Invalid name specified. Must be a string but was " + typeof name);
		if (name in _objectStore) throw new Error("Item '" + name + "' already registered");

		_objectStore[name] = new StoredItem(
			name,							// The item's name
			[],								// No dependencies for provided values
			function() { return value },	// An initor to return the current value in case we're asked to re-initialise
			value							// The resolved value
		);

	};

	// Store an initor component in the object store
	function _registerInitorValue(name, dependencies, initor) {

		// Lets validate everything
		_validateDependenciesVsInitor(name, dependencies, initor);
		if (name in _objectStore) throw new Error("Item '" + name + "' already registered");

		// Then store it
		_objectStore[name] = new StoredItem(name, dependencies, initor);

	};

	// Fetch a value from the global namespace
	function _fetchGlobal(name) {

		var path = name.split(".");
		var value = window;

		for (var i = 0; i < path.length; i++) {
			var key = path[i];
			if (key in value === false) return;
			value = value[key];
		}

		return value;

	};

    // Format a required by list nicely for debugging
	function _formatRequiredBy(requiredBy) {

	    var msg = "";

	    if (requiredBy.length) {
	        msg += "\nRequired by:";
	        for (var i = 0; i < requiredBy.length; i++) {
	            msg += "\n  " + requiredBy[i];
	        }
	    }

	    return msg;

	};


	//-----------------------------------------------------------------------------------------------------------------
	// Public API
	//-----------------------------------------------------------------------------------------------------------------

	var Inject = {

		// Register an item in the store
		// register(name, value)                - Register an immediate value that doesn't require initialisation or dependencies
		// register(name, dependencies, initor) - Register a component that requires injection to construct
		register: function Chicken_register() {

			switch (arguments.length) {
				case 2:
					_registerImmediateValue(arguments[0], arguments[1]);
					break;

				case 3:
					_registerInitorValue(arguments[0], arguments[1], arguments[2]);
					break;

				default:
					throw new Error("Incorrect number of arguments passed to Chicken.register()");
			}

		},

		// Immediately inject the specified dependencies into the provided initor
		// No return value is needed from the initor
		inject: function Chicken_inject(dependencies, initor) {

			_validateDependenciesVsInitor("Chicken.inject()", dependencies, initor);
			return this._initItem(dependencies, initor, [], null);

		},

		// Resolve all dependencies now so that there is no lazy initialisation of existing dependencies
		resolveAll: function Chicken_resolveAll() {

			var requiredBy = [];

			for (var name in _objectStore) {
				if (_objectStore.hasOwnProperty(name)) {

					// Attempt to resolve the item
					var item = _objectStore[name];
					this._checkAndResolve(item, requiredBy, null);

				}
			}

		},

		// Fetch a named item from the object store
		// This will resolve any required dependencies
		fetch: function Chicken_fetch(name, mocks) {
			return this._fetch(name, [], mocks);
		},

		// Clear out all the registered items and revert back to a clean state
		clear: function Chicken_clear() {
			_objectStore = {};
		},


		//-----------------------------------------------------------------------------------------------------------------
		// Internal API
		//-----------------------------------------------------------------------------------------------------------------

		// Check an object store item and resolve it if required returning its value
		_checkAndResolve: function Chicken__checkAndResolve(item, requiredBy, mocks) {

			var value = item.value;

			if (typeof value === "undefined" || mocks) {
				// Log this item in the requiredBy list to help with debugging undefined dependencies
				requiredBy.unshift(item.name);

				// Initialise the item
				value = this._initItem(item.dependencies, item.initor, requiredBy, mocks);
				if (typeof value === "undefined") throw new Error("Initor for '" + name + "' did not return a value.");

				// Remove ourselves from the required by list again now that we've done our work
				requiredBy.shift();

				// If we're in a test scenario, don't save the value back to the object store
				if (!mocks) {
					item.value = value;
				}
			}

			return value;

		},

		// Inject the specified dependencies into the provided initor, resolving where required
		_initItem: function Chicken__initItem(dependencies, initor, requiredBy, mocks) {

			// We need to resolve this object
			var length = dependencies.length;
			var injects = new Array(length);

			// Fetch each dependency
			for (var i = 0; i < length; i++) {
				var dependency = dependencies[i];
				injects[i] = this._fetch(dependency, requiredBy, mocks);
			}

			// Init the item
			return initor.apply(initor, injects);

		},

		// Fetches an object from the store
		// requiredBy is used internally to aide with debugging
		_fetch: function Chicken__fetch(name, requiredBy, mocks) {

		    // Check for circular dependencies
		    if (requiredBy.indexOf(name) >= 0) throw new Error("Circular dependency detected when resolving '" + name + "'." + _formatRequiredBy(requiredBy));

			// First check the mocks
			if (mocks && name in mocks) {
				return mocks[name];
			}

			// Second, check the object store and resolve if available
			var item = _objectStore[name];
			if (item) {
				return this._checkAndResolve(item, requiredBy, mocks);
			}

			// Finally, fall back to the global namespace
			// This is the solve the WinJS problem of lots of external dependencies and the faff needed to register them all
			// I would recommend registering the most common types, e.g. WinJS.Application, so that they are cached in the framework
			var value = _fetchGlobal(name);
			if (typeof value !== "undefined") return value;

			// The item doesn't exist, so generate an error that lists the dependency chain
			throw new Error("Item '" + name + "' has not been registered." + _formatRequiredBy(requiredBy));

		},

	}


	//-----------------------------------------------------------------------------------------------------------------
	// API Export
	//-----------------------------------------------------------------------------------------------------------------
	Chicken.namespace("Chicken", Inject);

})();


// File: js/worker.js
(Chicken.inject(["Worker"], function (Worker) {

	var workerFuncs = {

		startWorker: function Chicken_startWorker(main, onmessage, onerror) {

			var workerURL = URL.createObjectURL(new Blob(["(", main.toString(), ")(this);"], { type: "application/javascript" }));

			var worker = new Worker(workerURL);
			worker.onmessage = onmessage || null;
			worker.onerror = onerror || null;

			URL.revokeObjectURL(workerURL);

			return worker;

		},

	};


	Chicken.namespace("Chicken", workerFuncs);

}));

