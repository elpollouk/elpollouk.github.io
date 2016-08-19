Chicken.register("Signal.Wrapped", [], function () {
    return Chicken.Class(function (valueFunc) {
        this._valueFunc = valueFunc;
    }, {

    }, {
        value: {
            get: function () {
                return this._valueFunc();
            },
            enumerable: true
        }
    });
});
