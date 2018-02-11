Chicken.register("Mode.Play", ["Config", "ChickenVis.Math"], (Config, Math) => {

    return Chicken.Class(function (game) {
        this._game = game;
    }, {
        start: function () {
            this._spawnCount = 1;
            this._currentEnemyTime = Config.enemy.intialSpawnDelay;
        },

        update: function(dt) {
            this._game.player.update(dt);
            this._updateEnemies(dt);
            this._updateBullets(dt);
        },

        render: function(dt, draw) {

        },

        _updateBullets: function (dt) {
            var bullets = this._game.bullets;
            for (var i = 0; i < bullets.length; i++)
                bullets[i].update(dt);
        },
    
        _updateEnemies: function (dt) {
            var enemies = this._game.enemies;
            this._currentEnemyTime -= dt;
            if (this._currentEnemyTime <= 0) {
                this._currentEnemyTime = Config.enemy.spawnPeriod;
                var neededEnemies = this._spawnCount - enemies.length;
                for (var i = 0; i < neededEnemies; i++) {
                    var pos;
                    do
                    {
                        var x = Math.randomRange(0, Config.game.width);
                        var y = Math.randomRange(0, Config.game.height);
                        pos = Math.vector2(x, y);
                    }
                    while (Math.distanceBetweenSqrd2(this._game.player.pos, pos) < Config.enemy.minSpawnDistanceSqrd);
    
                    this._game.spawnEnemy(pos);
                }
                this._spawnCount++;
            }
    
            for (var i = 0; i < enemies.length; i++)
                enemies[i].update(dt);
        },
    });

});