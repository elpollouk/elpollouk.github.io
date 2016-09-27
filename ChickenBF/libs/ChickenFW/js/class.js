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