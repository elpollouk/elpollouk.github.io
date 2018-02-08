Chicken.register("Player", ["Config", "ChickenVis.Math"], (Config, Math) => {
    "use strict";

    var minX = Config.player.size;
    var maxX = Config.game.width - Config.player.size;
    var minY = Config.player.size;
    var maxY = Config.game.height - Config.player.size;

    return Chicken.Class(function (game, controller) {
        this._game = game;
        this._controller = controller;
        this.reset();
    }, {
        reset: function () {
            this.pos = Math.vector2(Config.game.width / 2, Config.game.height / 2);
            this.vel = Math.vector2(0, 0);
            this._currentShotTime = 0;
        },

        _jitter: function (v) {
            var jitter = Config.player.jitter;
            var x = Math.randomRange(-jitter, jitter);
            var y = Math.randomRange(-jitter, jitter);
            v.x += x;
            v.y += y;
        },

        update: function (dt) {
            var dX = Config.player.acceleration * this._controller.move.x * dt;
            var dY = Config.player.acceleration * this._controller.move.y * dt;
    
            this.vel.x += dX;
            this.vel.y += dY;
            Math.scale2(this.vel, Config.player.friction);
            Math.add2(this.pos, this.vel);
    
            this._game.enforceBounds(this.pos, Config.player.size);
    
            var shoot = Math.clone2(this._controller.shoot);
            this._currentShotTime -= dt;
            if ((shoot.x + shoot.y) !== 0.0 && this._currentShotTime <= 0) {
                this._jitter(shoot);
                this._game.spawnBullet(this.pos, shoot);
                this._currentShotTime = Config.player.shotPeriod;
            }
        },

        render: function (dt, draw) {
            draw.circle(this.pos.x, this.pos.y, Config.player.size, Config.player.colour);
        },
    });
});