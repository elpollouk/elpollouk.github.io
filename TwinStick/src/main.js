Chicken.inject(["Config", "ConfigParser", "Game", "FieldVisualiser", "ChickenVis.UpdateLoop", "ChickenVis.Draw"],
function (Config, parseConfig, Game, FieldVisualiser, UpdateLoop, Draw) {
    "use strict";

    var draw;
    var visualiser;
    var game;
    var updater = new UpdateLoop((dt) => {
        game.update(dt);
        // visualiser.render();
    });

    function resizeToFit() {
        var heightRatio = window.innerHeight / draw.canvas.height
        var widthRatio = window.innerWidth / draw.canvas.width

        if (heightRatio < widthRatio) {
            draw.canvas.style.width = '';
            draw.canvas.style.height = '100%';
            draw.canvas.style.top = '';
            draw.canvas.style.marginTop = '';
        }
        else {
            draw.canvas.style.width = '100%';
            draw.canvas.style.height = '';
            var halfHeight = draw.canvas.clientHeight / 2;
            draw.canvas.style.top = '50%';
            draw.canvas.style.marginTop = '-' + halfHeight + 'px';
        }
    }

    window.onload = () => {
        parseConfig();
        draw = new Draw(document.body, Config.game.width, Config.game.height);
        game = new Game(draw);
        // visualiser = new FieldVisualiser(draw.context, document.body);

        resizeToFit();

        updater.paused = false;
    }

    window.onresize = resizeToFit;
});