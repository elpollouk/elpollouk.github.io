Chicken.register("Config", [], () => {
    var config = {
        game: {
            updatePeriod: 0.01,
            width: 800,
            height: 600,
        },
        controller: {
            deadzoneSize: 0.2,
        },
        player: {
            acceleration: 25,
            friction: 0.92,
            shotPeriod: 0.15,
            size: 15,
            colour: "rgb(0, 255, 0)",
            jitter: 0.1,
        },
        enemy: {
            speed: 100,
            speedScaleMin: 0.85,
            speedScaleMax: 1.15,
            lookaheadFactor: 100,
            spawnPeriod: 2,
            intialSpawnDelay: 3,
            minSpawnDistance: 150,
            size: 15,
            colour: "orange",
        },
        bullet: {
            speed: 500,
            size: 5,
            colour: "red",
        },
        fieldVisualiser: {
            stride: 10
        }
    };

    config.enemy.minSpawnDistanceSqrd = config.enemy.minSpawnDistance * config.enemy.minSpawnDistance;
    config.player.sizeSqrd = config.player.size * config.player.size;
    config.enemy.sizeSqrd = config.enemy.size * config.enemy.size;
    config.bullet.sizeSqrd = config.bullet.size * config.bullet.size;

    return config;
});