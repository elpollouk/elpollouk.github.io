Chicken.register("NeuralNet", ["Neuron"], function (Neuron) {

    var undefined;

    function buildNet(layers) {
        var net = [];
        var prevLayerStart = 0;
        var prevLayerEnd = 0;

        for (var count of layers) {
            for (var i = 0; i < count; i++) {
                var neuron = new Neuron();
                for (var j = prevLayerStart; j < prevLayerEnd; j++) {
                    neuron.addInput(net[j], j);
                }
                net.push(neuron);
            }
            prevLayerStart = prevLayerEnd;
            prevLayerEnd = net.length;
        }

        return net;
    }

    function importNet(data) {
        var net = [];
        for (var neuronData of data.neurons) {
            var neuron = new Neuron(neuronData.maxValue, neuronData.minValue, neuronData.threshold);
            for (var inputData of neuronData.inputs) {
                var input = (inputData.index === undefined) ? null : net[inputData.index];
                neuron.addInput(input, inputData.index, inputData.weight);
            }
            net.push(neuron);
        }

        return net;
    }

    var NeuralNet = Chicken.Class(function () {
        var signalStart;
        if (typeof arguments[0] == "object") {
            this.neurons = importNet(arguments[0]);
            signalStart = this.neurons.length - arguments[0].signals;
        }
        else {
            this.neurons = buildNet(arguments);
            signalStart = this.neurons.length - arguments[arguments.length-1]
        }

        this.signals = [];
        for (var i = signalStart; i < this.neurons.length; i++)
            this.signals.push(this.neurons[i]);
    }, {
        randomInit: function () {
            for (var n of this.neurons)
                n.randomInit();
        },

        think: function () {
            for (var n of this.neurons)
                n.think();
        },

        mutate: function (chance, delta) {
            for (var n of this.neurons)
                n.mutate(chance, delta);
        },

        export: function () {
            var ex = {
                signals: this.signals.length,
                neurons: []
            };

            for (var n of this.neurons)
                ex.neurons.push(n.export());

            return ex;
        },

        compare: function (net) {
            if (net.neurons.length != this.neurons.length) return false;
            for (var i = 0; i < this.neurons.length; i++) {
                if (!this.neurons[i].compare(net.neurons[i])) return false;
            }

            return true;
        }
    });

    return NeuralNet;
});
