Chicken.register("Signal.Cluster", ["ChickenVis.Math"], function (Math) {
    var ClusterSignal = Chicken.Class(function (inputSignal, minValue, maxValue, numOutputSignals) {
        this._inputSignal = inputSignal;
        this._minValue = minValue;
        this._maxValue = maxValue;
        this._numOutputSignals = numOutputSignals;
        this._normalisedInput = 0;
        this.signals = [];

        for (var i = 0; i < numOutputSignals; i++)
            this.signals.push({ value: 0 });
    }, {
        update: function () {
            var value = this._inputSignal.value;
            if (value < this._minValue) value = this._minValue;
            else if (value > this._maxValue) value = this._maxValue;

            value /= (this._maxValue - this._minValue);
            value = Math.round(this.signals.length * value);
            this._normalisedInput = value;

            for (var i = 0; i < value; i++)
                this.signals[i].value = 1;

            for (;i < value; i++)
                this.signals[i].value = 0;
        },

        render: function (draw) {
            var segmentWidth = 40 / this.signals.length;

            draw.rect(-20, -20, this._normalisedInput * segmentWidth, 10, "rgba(0, 0, 255, 0.5)");
        }
    });

    return ClusterSignal;
});
