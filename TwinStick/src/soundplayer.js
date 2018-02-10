Chicken.register("SoundPlayer", ["Config", "ChickenVis.Math"], (Config, Math) => {

    var soundsPath = 'assets/sounds';

    function loadSound(name) {
        return new Audio(`${soundsPath}/${name}.wav`);
    }

    function playSound(soundArray) {
        if (!Config.game.enableSounds) return;
        var i = Math.randomInt(soundArray.length);
        soundArray[i].play();
    }

    return Chicken.Class(function () {
        if (!Config.game.enableSounds) return;
        this._loadPlayerShots();
        this._loadPlayerDeaths();
        this._loadPlayerBursts();
        this._loadEnemyDeaths();
    }, {
        playPlayerShot: function () {
            playSound(this._shots);
        },

        playPlayerDeath: function () {
            playSound(this._playerDeaths);
        },

        playPlayerBurst: function () {
            playSound(this._playerBursts);
        },

        playEnemyDeath: function () {
            playSound(this._enemyDeaths);
        },

        _loadPlayerShots: function () {
            this._shots = [];
            this._shots.push(loadSound('player_shot_0'));
            this._shots.push(loadSound('player_shot_1'));
            this._shots.push(loadSound('player_shot_2'));
            this._shots.push(loadSound('player_shot_3'));
            this._shots.push(loadSound('player_shot_4'));
            this._shots.push(loadSound('player_shot_5'));
            this._shots.push(loadSound('player_shot_0'));
            this._shots.push(loadSound('player_shot_1'));
            this._shots.push(loadSound('player_shot_2'));
            this._shots.push(loadSound('player_shot_3'));
            this._shots.push(loadSound('player_shot_4'));
            this._shots.push(loadSound('player_shot_5'));
        },

        _loadPlayerDeaths: function () {
            this._playerDeaths = [];
            this._playerDeaths.push(loadSound('player_death_0'));
        },

        _loadPlayerBursts: function () {
            this._playerBursts = [];
            this._playerBursts.push(loadSound('player_burst_0'));
        },

        _loadEnemyDeaths: function () {
            this._enemyDeaths = [];
            this._enemyDeaths.push(loadSound('enemy_death_0'));
            this._enemyDeaths.push(loadSound('enemy_death_1'));
            this._enemyDeaths.push(loadSound('enemy_death_2'));
            this._enemyDeaths.push(loadSound('enemy_death_0'));
            this._enemyDeaths.push(loadSound('enemy_death_1'));
            this._enemyDeaths.push(loadSound('enemy_death_2'));
        }
    });

});