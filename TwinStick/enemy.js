Chicken.register("Enemy", ["Config", "ChickenVis.Math"], (Config, Math) => {
    "use strict";

    var playerEnemySizeSqrd = Config.player.size + Config.enemy.size;
    playerEnemySizeSqrd *= playerEnemySizeSqrd;

    return Chicken.Class(function (game, pos) {
        this.game = game;
        this.pos = Math.clone2(pos);
    }, {
        update: function (dt) {
            var playerPos = this.game.player.pos
            var d = Math.subAndClone2(playerPos, this.pos);
            Math.normalise2(d);
            Math.scaleAdd2(this.pos, d, Config.enemy.speed * dt);

            if (Math.distanceBetweenSqrd2(playerPos, this.pos) <= playerEnemySizeSqrd)
                this.game.killPlayer();
        },

        render: function (dt, draw) {
            draw.circle(this.pos.x, this.pos.y, Config.enemy.size, Config.enemy.colour);
        }
    });
});