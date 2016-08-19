Chicken.register("EntityBuilder",
["Signal.Polar", "Signal.Target", "Signal.Wrapped", "NeuralNet", "Entity", "ChickenVis.Math"],
function (SignalPolar, SignalTarget, SignalWrapped, NeuralNet, Entity, Math) {

    var LAYER1 = 3;
    var LAYER2 = 3;
    var LAYER3 = 2;

    return function EntityBuilder(target, neuralNetData) {
        var targeter = new SignalTarget(target);
        var ent = new Entity();
        ent.attach(targeter);
        //ent.rotation = Math.randomRange(0, Math.TWO_PI);

        var signalPosX = new SignalWrapped(() => ent.pos.x);
        var signalPosY = new SignalWrapped(() => ent.pos.y);
        var signalRotation = new SignalWrapped(() => ent.rotation);

        var net;
        if (neuralNetData) {
            // Imported net, just need to link in the signals
            net = new NeuralNet(neuralNetData);
            for (var  i = 0; i < LAYER1; i++) {
                var neuron = net.neurons[i];
                neuron.inputs[0].signal = targeter.signals[2];
                //neuron.inputs[1].signal = targeter.signals[3];
                //neuron.inputs[2].signal = targeter.signals[1];
                //neuron.inputs[2].signal = signalRotation;
                //neuron.inputs[2].signal = signalPosX;
                //neuron.inputs[3].signal = signalPosY;
            }
        }
        else {
            // Brand new netwrk so we need to attach signals from scratch
            net = new NeuralNet(LAYER1, LAYER2, LAYER3);
            net.randomInit();
            for (var  i = 0; i < LAYER1; i++) {
                var neuron = net.neurons[i];
                neuron.addInput(targeter.signals[2]);
                //neuron.addInput(targeter.signals[3]);
                //neuron.addInput(targeter.signals[1]);
                //neuron.addInput(signalRotation);
                //neuron.addInput(signalPosX);
                //neuron.addInput(signalPosY);
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
            ent.score += targeter.signals[3].value;
        }
        ent.neuralNet = net;
        ent.score = 0;

        return ent;
    };
});
