Chicken.register("Neuron", ["ChickenVis.Math"], function (Math) {
    var undefined;

    var sigmoidTable = []
    for (var v = -5; v < 5.01; v += 0.01)
        sigmoidTable.push(1 / (1 + Math.exp(-v)));

    var sigmoidFact = sigmoidTable.length / 10;

    function qsigmoid(value) {
        if (value < -5) return 1;
        if (value >= 5) return 0;

        var v = (value + 5);
        v = Math.floor(v * sigmoidFact);
        v = sigmoidTable[v];

        return v;
    }

    var Neuron = Chicken.Class(function (maxValue, minValue, threshold) {
        this.value = 0;
        this.minValue = minValue || 0;
        this.maxValue = maxValue || 1;
        this.threshold = threshold;
        this.inputs = [];
    }, {
        addInput: function (signal, index, weight) {
            this.inputs.push({
                index: index,
                signal: signal,
                weight: weight || 1,
            });
        },

        think: function () {
            var value = 0;
            for (var i of this.inputs) {
                value += i.signal.value * i.weight;
            }

            /*if (this.maxValue !== undefined && this.maxValue < value)
                value = this.maxValue;
            else if (this.threshold !== undefined && value < this.threshold)
                value = 0;
            else if (this.minValue !== undefined && value < this.minValue)
                value = this.minValue;*/

            value = qsigmoid(value);
            //value = 1 / (1 + Math.exp(-value));
            value *= this.maxValue - this.minValue;
            value += this.minValue;

            this.value = value;
        },

        randomInit: function () {
            var min = this.minValue || -1;
            var max = this.maxValue || 1;
            this.threshold = Math.randomRange(min, max);

            for (var i of this.inputs) {
                i.weight = Math.randomRange(-1, 1);
            }
        },

        mutate: function (chance, delta) {
            if (this.threshold !== undefined && Math.random() <= chance) {
                var t = this.threshold + Math.randomRange(-delta, delta);
                if (this.minValue !== undefined && t < this.minValue)
                    t = this.threshold;
                else if (this.maxValue != undefined && t > this.maxValue)
                    t = this.threshold;

                this.threshold = t;
            }

            for (var i of this.inputs) {
                if (Math.random() <= chance) i.weight += Math.randomRange(-delta, delta);
            }
        },

        export: function () {
            var ex = {};
            if (this.threshold !== undefined) ex.threshold = this.threshold;
            if (this.minValue !== undefined) ex.minValue = this.minValue;
            if (this.maxValue !== undefined) ex.maxValue = this.maxValue;

            ex.inputs = [];
            for (var i of this.inputs) {
                ex.inputs.push({
                    index: i.index,
                    weight: i.weight
                });
            }

            return ex;
        },

        compare: function (neuron) {
            if (this.threshold != neuron.threshold) return false;
            if (this.minValue != neuron.minValue) return false;
            if (this.maxValue != neuron.maxValue) return false;

            if (this.inputs.length != neuron.inputs.length) return false;
            for (var i = 0; i < this.inputs.length; i++) {
                if (this.inputs[i].index != neuron.inputs[i].index) return false;
                if (this.inputs[i].weight != neuron.inputs[i].weight) return false;
            }

            return true;
        }
    });

    return Neuron;
});
