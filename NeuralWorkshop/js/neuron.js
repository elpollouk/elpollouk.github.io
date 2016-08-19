Chicken.register("Neuron", ["ChickenVis.Math"], function (Math) {
    var undefined;

    var Neuron = Chicken.Class(function (maxValue, minValue, threshold) {
        this.value = 0;
        this.minValue = minValue;
        this.maxValue = maxValue;
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

            if (this.maxValue !== undefined && this.maxValue < value)
                value = this.maxValue;
            else if (this.threshold !== undefined && value < this.threshold)
                value = 0;
            else if (this.minValue !== undefined && value < this.minValue)
                value = this.minValue;

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
