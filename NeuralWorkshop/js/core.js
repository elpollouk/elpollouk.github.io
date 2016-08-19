Chicken.register("Core",
["ChickenVis.Loader", "ChickenVis.Draw", "ChickenVis.Math", "EntityBuilder", "ChickenVis.FixedDeltaUpdater"],
function (Loader, Draw, Math, entityBuilder, FixedDeltaUpdater) {
    "use strict";

    var BEST = '{"signals":2,"neurons":[{"threshold":4.495819001036218,"inputs":[{"weight":6.180720240150402},{"weight":2.1165986687037837}]},{"threshold":3.4842915362530786,"inputs":[{"weight":1.1744475313036957},{"weight":-5.7614184284022985}]},{"threshold":-3.2083450935333313,"inputs":[{"weight":-7.040605002931496},{"weight":2.043779609507018}]},{"threshold":-5.4099651340686155,"inputs":[{"weight":8.290695312211316},{"weight":0.996036953105261}]},{"threshold":-2.6086202571864945,"inputs":[{"index":0,"weight":7.8519526901894325},{"index":1,"weight":3.930809469765819},{"index":2,"weight":-6.822721127631051},{"index":3,"weight":3.896709455221053}]},{"threshold":0.7784552328923016,"inputs":[{"index":0,"weight":5.813947892054069},{"index":1,"weight":-4.593401702570674},{"index":2,"weight":3.7385328066948658},{"index":3,"weight":4.613312618217994}]},{"threshold":1.2755072957801854,"inputs":[{"index":0,"weight":-6.157910662076202},{"index":1,"weight":0.11790535633065025},{"index":2,"weight":5.705662286648713},{"index":3,"weight":-2.265591431966755}]},{"threshold":-3.9599935070437313,"inputs":[{"index":0,"weight":2.6758850988338825},{"index":1,"weight":2.2148165800779447},{"index":2,"weight":6.788830370368236},{"index":3,"weight":-0.36627094455088893}]},{"minValue":-1,"maxValue":1,"inputs":[{"index":4,"weight":0.8810560117743427},{"index":5,"weight":-2.761732134112016},{"index":6,"weight":8.21726708080258},{"index":7,"weight":6.089485383669034}]},{"minValue":0,"maxValue":1,"inputs":[{"index":4,"weight":-0.8430951835423294},{"index":5,"weight":0.8558114095029096},{"index":6,"weight":-5.172626517849852},{"index":7,"weight":0.20161509295518804}]}]}';

    var loader = new Loader();
    var draw;

    var assets = [
        {
            id: "entity",
            source: "assets/entity-facing.png",
            type: Loader.TYPE_IMAGE
        }
    ];

    var entities;
    var target = {};
    var maxTargetSpeed = 100;
    var generation = 0;

    function constructEntities() {
        entities = [];
        for (var i = 0; i < 10; i++)
            entities.push(entityBuilder(target));

        //for (var i = 0; i < 1; i++)
        //    entities.push(entityBuilder(target, JSON.parse(BEST)));
    }

    function calcEntityScore(entity) {
        var v = Math.subAndClone2(target.pos, entity.pos);
        return Math.lengthSqrd2(v);
    }

    function nextGeneration() {
        generation++;

        // Find top scoring entity
        var bestEnt = entities[0];
        var bestScore = calcEntityScore(bestEnt);

        for (var i = 1; i < entities.length; i++) {
            var ent = entities[i];
            var score = calcEntityScore(ent);
            if (score < bestScore) {
                bestScore = score;
                bestEnt = ent;
            }
        }

        // Export it's neural net
        var netData = bestEnt.neuralNet.export();

        // Construct the next set of entities
        for (var i = 0; i < entities.length; i++)
            entities[i] = entityBuilder(target, netData);

        // Mutate the generation
        // Very mutated
        entities[0].neuralNet.mutate(0.3, 0.2);
        entities[0].colour = "red";
        entities[1].neuralNet.mutate(0.25, 0.2);
        entities[1].colour = "red";
        // Quite mutated
        entities[2].neuralNet.mutate(0.15, 0.15);
        entities[2].colour = "orange";
        entities[3].neuralNet.mutate(0.15, 0.15);
        entities[3].colour = "orange";
        // Moderately mutated
        entities[4].neuralNet.mutate(0.10, 0.1);
        entities[4].colour = "yellow";
        entities[5].neuralNet.mutate(0.10, 0.1);
        entities[5].colour = "yellow";
        // Slightly mutated
        entities[6].neuralNet.mutate(0.02, 0.02);
        entities[6].colour = "rgb(127, 255, 127)";
        entities[7].neuralNet.mutate(0.02, 0.02);
        entities[7].colour = "rgb(127, 255, 127)";
        entities[8].neuralNet.mutate(0.02, 0.02);
        entities[8].colour = "rgb(127, 255, 127)";
        // Last entity is unmodified from last generation

        if (!entities[9].neuralNet.compare(bestEnt.neuralNet)) throw new Error("Nets did not match!");
    }

    var generationAge = 0;
    var generationTimer = new FixedDeltaUpdater(function () {
        nextGeneration();
        initTarget();
        generationAge = 0;
    }, 11);

    function drawFrame(fps) {
        draw.clear();
        draw.circle(target.pos.x, target.pos.y, 20, "rgb(0, 255, 0)");
        draw.circle(target.pos.x, target.pos.y, 20, "black", true);

        for (var entity of entities) {
            entity.render(draw);
        }

        draw.text(`FPS = ${Math.floor(fps)}`, 0, 0);
        draw.text(`Generation ${generation}`, 0, 10);
        draw.text(`Generation Age = ${Math.floor(generationAge)}`, 0, 20);
    }

    function update(dt) {
        Math.scaleAdd2(target.pos, target.velocity, dt);

        if (target.pos.x < 20) target.velocity.x *= -1;
        else if (target.pos.x > 780) target.velocity.x *= -1;

        if (target.pos.y < 20) target.velocity.y *= -1;
        else if (target.pos.y > 580) target.velocity.y *= -1;

        for (var entity of entities) {
            entity.think();
            entity.update(dt);
        }

        generationAge += dt;
        generationTimer.update(dt);
    }

    function initTarget() {
        target.pos = Math.vector2(Math.randomRange(20, 780), Math.randomRange(20, 580));
        target.velocity = Math.vector2(Math.randomRange(-1, 1), Math.randomRange(-1, 1));
        //target.velocity = Math.vector2(0, 0);
        Math.normalise2(target.velocity);
        Math.scale2(target.velocity, maxTargetSpeed);
    }

    var Core = {
        init: function Core_init(onComplete) {
            draw = new Draw(viewer, 800, 600);

            initTarget();
            constructEntities();

            loader.queue(assets, function () {
                if (loader.numReady + loader.failed.length === loader.numTotal) {
                    onComplete(loader.failed.length === 0);
                }
            });
        },

        onFrame: drawFrame,
        onUpdate: update
    };

    return Core;
});
