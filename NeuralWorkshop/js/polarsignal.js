Chicken.register("Signal.Polar", [], function () {
    var PolarSignal = Chicken.Class(function (signalNeg, signalPos) {
        this._signalNeg = signalNeg;
        this._signalPos = signalPos;
    }, {

    }, {
        value: {
            get: function PolarSignal_value_get() {
                var n = this._signalNeg.value;
                var p = this._signalPos.value;

                if (n < p) {
                    return p;
                }
                else if (p < n) {
                    return -n;
                }
                return 0;
            },
            enumerable: true
        }
    });

    return PolarSignal;
});
