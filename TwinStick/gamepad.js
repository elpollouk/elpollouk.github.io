Chicken.register("Gamepad", ["Config", "ChickenVis.Math"], (Config, Math) => {
    "use strict";

    var Axes = {
        MoveX: 0,
        MoveY: 1,
        ShootX: 2,
        ShootY: 3
    };

    var _isDisconnected = true;

    function getAxes(axes) {
        var gamePad = navigator.getGamepads()[0];
        _isDisconnected = !gamePad;
        if (_isDisconnected) return 0;
        var v = gamePad.axes[axes];
        if ((-Config.controller.deadzoneSize < v) && (v < Config.controller.deadzoneSize)) return 0;
        return v;
    };

    return Chicken.Class(function () {
        this.move = Math.vector2(0, 0);
        this.shoot = Math.vector2(0, 0);
    }, {
        update: function (dt) {
            this.move.x = getAxes(Axes.MoveX);
            this.move.y = getAxes(Axes.MoveY);
            this.shoot.x = getAxes(Axes.ShootX);
            this.shoot.y = getAxes(Axes.ShootY);
        }
    }, {
        isDisconnected: {
            get: function () {
                return _isDisconnected;
            },
            enumerable: true
        }
    });
});