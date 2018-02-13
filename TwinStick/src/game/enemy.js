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
        this._isAlive = true;
        this._deathTimer = 0.0;

        this._currentSize = Config.enemy.size;
        this._minSize = Config.enemy.size * (1.0 - Config.enemy.throbFactor);
        this._maxSize = Config.enemy.size * (1.0 + Config.enemy.throbFactor);
        this._throbTime = Config.enemy.throbPeriod * Math.random();
        this._throbDirection = 1;
    }, {
        update: function (dt) {
            if (this._isAlive) {
                var moveTarget = Math.clone2(this._game.player.vel);
                Math.scale2(moveTarget, this._lookaheadFactor);
                Math.add2(moveTarget, this._game.player.pos);
                Math.sub2(moveTarget, this.pos);
                Math.normalise2(moveTarget);
                Math.scaleAdd2(this.pos, moveTarget, this._speed * dt);

                this._game.enforceBounds(this.pos, Config.enemy.size);

                if (Math.distanceBetweenSqrd2(this._game.player.pos, this.pos) <= playerEnemySizeSqrd)
                    this._game.killPlayer();

                this._throbTime += dt * this._throbDirection;
                if (this._throbTime >= Config.enemy.throbPeriod) {
                    this._throbTime = Config.enemy.throbPeriod;
                    this._throbDirection = -1;
                }
                else if (this._throbTime <= 0) {
                    this._throbTime = 0;
                    this._throbDirection = 1;
                }
                this._currentSize = this._minSize + ((this._maxSize - this._minSize) * (this._throbTime / Config.enemy.throbPeriod));
            }
            else {
                this._deathTimer += dt;
                if (this._deathTimer >= Config.enemy.deathTime)
                    this._game.removeEnemy(this);
            }
        },

        render: function (dt, draw) {
            if (this._isAlive) {
                draw.circle(this.pos.x, this.pos.y, this._currentSize, Config.enemy.colour);
            }
            else {
                var scale = this._deathTimer / Config.enemy.deathTime;
                var size = Config.enemy.deathSize * scale;
                var alpha = draw.context.globalAlpha;
                draw.context.globalAlpha = 1.0 - scale;
                draw.circle(this.pos.x, this.pos.y, size, Config.enemy.colour);
                draw.context.globalAlpha = alpha;
            }
        },

        kill: function () {
            this._isAlive = false;
        },
    }, {
        isAlive: {
            get: function () {
                return this._isAlive;
            },
            enumerable: true
        },
    });
});