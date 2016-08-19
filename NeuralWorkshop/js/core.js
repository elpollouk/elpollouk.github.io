Chicken.register("Core",
["ChickenVis.Loader", "ChickenVis.Draw", "ChickenVis.Math", "EntityBuilder", "ChickenVis.FixedDeltaUpdater", "Graph"],
function (Loader, Draw, Math, entityBuilder, FixedDeltaUpdater, Graph) {
    "use strict";

    var loader = new Loader();
    var graph = new Graph(5, 45, 150);
    var draw;

    var assets = [
        {
            id: "entity",
            source: "assets/entity-facing.png",
            type: Loader.TYPE_IMAGE
        }
    ];

    var stats = [
        { value: 0, colour: "rgba(127, 127, 255, 0.75)" },
        { value: 0, colour: "rgba(0, 255, 0, 0.75)" },
        { value: 0, colour: "rgba(255, 255, 0, 0.75)" },
        { value: 0, colour: "rgba(255, 192, 0, 0.75)" },
        { value: 0, colour: "rgba(255, 0, 0, 0.75)" }
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
        //var v = Math.subAndClone2(target.pos, entity.pos);
        //return Math.lengthSqrd2(v);
        return entity.score;
    }

    function nextGeneration() {
        generation++;

        // Find top scoring entity
        var bestEnt = entities[0];
        var bestIndex = 0;
        var bestScore = calcEntityScore(bestEnt);

        for (var i = 1; i < entities.length; i++) {
            var ent = entities[i];
            var score = calcEntityScore(ent);
            if (score <= bestScore) {
                bestScore = score;
                bestEnt = ent;
                bestIndex = i;
            }
        }

        // Update the states
        if (bestIndex < 2)
            stats[4].value++;
        else if (bestIndex < 4)
            stats[3].value++;
        else if (bestIndex < 6)
            stats[2].value++;
        else if (bestIndex < 9)
            stats[1].value++;
        else
            stats[0].value++;

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
    }, 5);

    function drawFrame(fps, warpFactor) {
        draw.clear();
        draw.circle(target.pos.x, target.pos.y, 20, "rgb(0, 255, 0)");
        draw.circle(target.pos.x, target.pos.y, 20, "black", true);

        for (var entity of entities) {
            entity.render(draw);
        }

        draw.text(`FPS = ${Math.floor(fps)}`, 0, 0);
        draw.text(`Generation ${generation}`, 0, 10);
        draw.text(`Generation Age = ${Math.floor(generationAge)}`, 0, 20);
        draw.text(`Warp Factor = ${warpFactor}`, 0, 30);

        graph.render(draw, stats);
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
