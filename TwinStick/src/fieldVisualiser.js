Chicken.register("FieldVisualiser", ["Config", "ChickenVis.Draw"], (Config, Draw) => {
    "use strict";

    var stride = Config.fieldVisualiser.stride;
    var gameWidth = Config.game.width;
    var gameHeight = Config.game.height;
    var width = gameWidth / stride;
    var height = gameHeight / stride;

    function getSourceColour(data, x, y) {
        var red = y * (gameWidth * 4) + x * 4
        var colour = [data[red], data[red+1], data[red+2]];
        if (colour[0] === colour[1] && colour[1] === colour[2]) {
            colour[0] = 0;
            colour[1] = 0;
            colour[2] = 0;
        } else {
            var a = (colour[0] + colour[1] + colour[2]) / 3;
            colour[0] = a;
            colour[1] = a;
            colour[2] = a;
        }
        return colour;
    }

    function putTargetColour(data, x, y, colour) {
        var red = y * (width * 4) + x * 4
        data[red] = colour[0];
        data[red+1] = colour[1];
        data[red+2] = colour[2];
        data[red+3] = 255;
    }

    return Chicken.Class(function (context2d, container) {
        this.draw = new Draw(container, width, height);
        this.sourceCtx = context2d
    }, {
        render: function () {
            var source = this.sourceCtx.getImageData(0, 0, gameWidth, gameHeight);
            var target = this.draw.context.createImageData(width, height);
            var x = 0;
            var y = 0;
            while (y < height) {
                while (x < width) {
                    var colour = getSourceColour(source.data, x * stride, y * stride);
                    putTargetColour(target.data, x, y, colour);
                    x++;
                }
                y++;
                x = 0;
            }

            this.draw.context.putImageData(target, 0, 0);
        }
    });
});