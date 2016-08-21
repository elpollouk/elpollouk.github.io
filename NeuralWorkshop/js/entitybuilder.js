Chicken.register("EntityBuilder",
["Signal.Polar", "Signal.Target", "Signal.Cluster", "Signal.Wrapped", "NeuralNet", "Entity", "ChickenVis.Math"],
function (SignalPolar, SignalTarget, SignalCluster, SignalWrapped, NeuralNet, Entity, Math) {

    var LAYER1 = 4;
    var LAYER2 = 3;
    var LAYER3 = 2;
    var SIGNAL_BIAS = { value: 0 };

    return function EntityBuilder(world, target, neuralNetData) {
        var targeter = new SignalTarget(target);
        var rangeCluster = new SignalCluster(targeter.signals[3], 0, 300, 10);
        var ent = new Entity();
        ent.pos.x = world.width / 2;
        ent.pos.y = world.height / 2;
        ent.attach(targeter);
        ent.attach(rangeCluster);

        var signalPosX = new SignalWrapped(() => ent.pos.x);
        var signalPosY = new SignalWrapped(() => ent.pos.y);
        var signalRotation = new SignalWrapped(() => ent.rotation);

        var net;
        if (neuralNetData) {
            // Imported net, just need to link in the signals
            net = new NeuralNet(neuralNetData);
            for (var  i = 0; i < LAYER1; i++) {
                var neuron = net.neurons[i];
                neuron.inputs[0].signal = SIGNAL_BIAS;
                neuron.inputs[1].signal = targeter.signals[2];

                for (var j = 0; j < rangeCluster.signals.length; j++)
                    neuron.inputs[2 + j].signal = rangeCluster.signals[j];
            }
        }
        else {
            // Brand new netwrk so we need to attach signals from scratch
            net = new NeuralNet(LAYER1, LAYER3);
            net.randomInit();
            for (var  i = 0; i < LAYER1; i++) {
                var neuron = net.neurons[i];
                neuron.addInput(SIGNAL_BIAS);
                neuron.addInput(targeter.signals[2]);

                for (var j = 0; j < rangeCluster.signals.length; j++)
                    neuron.addInput(rangeCluster.signals[i]);
            }

            // Set output signal limits
            net.signals[0].threshold = undefined;
            net.signals[0].minValue = -1;
            net.signals[0].maxValue = 1;

            net.signals[1].threshold = undefined;
            net.signals[1].minValue = 0;
            net.signals[1].maxValue = 1;
        }

        ent.signalSteer = net.signals[0];
        //ent.signalSteer = new SignalPolar(net.signals[0], net.signals[1]);
        ent.signalGo = net.signals[1];

        // Punch in the AI
        ent.think = function Entity_think() {
            net.think();
            var distance = targeter.signals[3].value;
            if (distance <= 20)
                ent.score += 50;
            else if (distance < ent._lastDistance)
                ent.score += 1;
            else
                ent.score -= 2;

            ent._lastDistance = distance;
        }
        ent.neuralNet = net;
        ent.score = 0;
        ent._lastDistance = targeter.signals[3].value;

        return ent;
    };
});
