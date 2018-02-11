Chicken.register("Mode.PreGame", ["Config"], (Config) => {

    var boxWidth = 400;
    var boxHeight = 200;
    var firstRun = true;

    return Chicken.Class(function (game) {
        this._game = game;
    }, {
        start: function () {

        },

        update: function(dt) {
            if (this._game.controller.isButtonPressed) {
                this._game.startGame();
                firstRun = false;
            }
        },

        render: function(dt, draw) {
            var x = (Config.game.width - boxWidth) / 2;
            var y = (Config.game.height - boxHeight) / 2;

            draw.rect(x, y, boxWidth, boxHeight, "lightgray");
            draw.rect(x, y, boxWidth, boxHeight, "black", true);

            if (firstRun) {
                draw.text('Press any button on gamepad to start', x + 92, y + 95);
            }
            else {
                var scoreMessage = `You scored ${this._game.score}`;
                draw.text('GAME OVER!', x + 176, y + 80)
                draw.text(scoreMessage, x + (boxWidth - (scoreMessage.length * 5)) / 2, y + 95);      
                draw.text('Press any button on gamepad to start again', x + 72, y + 110);          
            }
        },
    });

});