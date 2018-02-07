Chicken.register("Enemy", ["Config", "ChickenVis.Math"], (Config, Math) => {
    "use strict";

    var minX = Config.enemy.size;
    var maxX = Config.game.width - Config.enemy.size;
    var minY = Config.enemy.size;
    var maxY = Config.game.height - Config.enemy.size;
    var playerEnemySizeSqrd = Config.player.size + Config.enemy.size;
    playerEnemySizeSqrd *= playerEnemySizeSqrd;

    return Chicken.Class(function (game, pos) {
        this.game = game;
        this.pos = Math.clone2(pos);
        this.speed = Config.enemy.speed;
        this.speed *= Math.randomRange(Config.enemy.speedScaleMin, Config.enemy.speedScaleMax);
        this.lookaheadFactor = Math.randomRange(0, Config.enemy.lookaheadFactor);
    }, {
        update: function (dt) {
            var moveTarget = Math.clone2(this.game.player.vel);
            Math.scale2(moveTarget, this.lookaheadFactor);
            Math.add2(moveTarget, this.game.player.pos);
            Math.sub2(moveTarget, this.pos);
            Math.normalise2(moveTarget);
            Math.scaleAdd2(this.pos, moveTarget, this.speed * dt);

            if (this.pos.x < minX) this.pos.x = minX;
            else if (this.pos.x > maxX) this.pos.x = maxX;
            if (this.pos.y < minY) this.pos.y = minY;
            else if (this.pos.y > maxY) this.pos.y = maxY;

            if (Math.distanceBetweenSqrd2(this.game.player.pos, this.pos) <= playerEnemySizeSqrd)
                this.game.killPlayer();
        },

        render: function (dt, draw) {
            draw.circle(this.pos.x, this.pos.y, Config.enemy.size, Config.enemy.colour);
        }
    });
});