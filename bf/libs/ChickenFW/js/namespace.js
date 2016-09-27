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