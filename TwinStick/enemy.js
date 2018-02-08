Chicken.register("Enemy", ["Config", "ChickenVis.Math"], (Config, Math) => {
    "use strict";

    var minX = Config.enemy.size;
    var maxX = Config.game.width - Config.enemy.size;
    var minY = Config.enemy.size;
    var maxY = Config.game.height - Config.enemy.size;
    var playerEnemySizeSqrd = Config.player.size + Config.enemy.size;
    playerEnemySizeSqrd *= playerEnemySizeSqrd;

    return Chicken.Class(function (game, pos) {
        this._game = game;
        this.pos = Math.clone2(pos);
        this._speed = Config.enemy.speed;
        this._speed *= Math.randomRange(Config.enemy.speedScaleMin, Config.enemy.speedScaleMax);
        this._lookaheadFactor = Math.randomRange(0, Config.enemy.lookaheadFactor);
    }, {
        update: function (dt) {
            var moveTarget = Math.clone2(this._game.player.vel);
            Math.scale2(moveTarget, this._lookaheadFactor);
            Math.add2(moveTarget, this._game.player.pos);
            Math.sub2(moveTarget, this.pos);
            Math.normalise2(moveTarget);
            Math.scaleAdd2(this.pos, moveTarget, this._speed * dt);

            this._game.enforceBounds(this.pos, Config.enemy.size);

            if (Math.distanceBetweenSqrd2(this._game.player.pos, this.pos) <= playerEnemySizeSqrd)
                this._game.killPlayer();
        },

        render: function (dt, draw) {
            draw.circle(this.pos.x, this.pos.y, Config.enemy.size, Config.enemy.colour);
        }
    });
});