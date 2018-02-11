Chicken.register("Gamepad", ["Config", "ChickenVis.Math"], (Config, Math) => {
    "use strict";

    var Axes = {
        MoveX: 0,
        MoveY: 1,
        ShootX: 2,
        ShootY: 3
    };

    var _gamePadIndex = -1;

    function isDisconnect() {
        return _gamePadIndex === -1;
    }

    function isButtonDown(gamePad) {
        if (!gamePad) return false;
        if (gamePad.axes.length < 4) return false; // Not a gamepad we can play with
        for (var i = 0; i < gamePad.buttons.length; i++) {
            if (gamePad.buttons[i].pressed)
                return true;
        }

        return false;
    }

    function getGamePad() {
        var gamePads = navigator.getGamepads();
        var gamePad = isDisconnect() ? null : gamePads[_gamePadIndex];
        
        if (!gamePad) {
            // Scan for an active gamepad
            _gamePadIndex = -1;
            for (var i = 0; i < gamePads.length; i++) {
                if (isButtonDown(gamePads[i])) {
                    gamePad = gamePads[i];
                    _gamePadIndex = i;
                }
            }
        }

        return gamePad;
    }

    function getAxes(gamePad, axes) {
        if (!gamePad) return 0;
        var v = gamePad.axes[axes];
        if ((-Config.controller.deadzoneSize < v) && (v < Config.controller.deadzoneSize)) return 0;
        return v;
    };

    return Chicken.Class(function () {
        this.move = Math.vector2(0, 0);
        this.shoot = Math.vector2(0, 0);
        this._buttonPressed = false;
    }, {
        update: function (dt) {
            var gamePad = getGamePad();
            this.move.x = getAxes(gamePad, Axes.MoveX);
            this.move.y = getAxes(gamePad, Axes.MoveY);
            this.shoot.x = getAxes(gamePad, Axes.ShootX);
            this.shoot.y = getAxes(gamePad, Axes.ShootY);
            this._buttonPressed = isButtonDown(gamePad);
        }
    }, {
        isDisconnected: {
            get: isDisconnect,
            enumerable: true
        },

        isButtonPressed: {
            get: function () {
                return this._buttonPressed;
            },
            enumerable: true
        }
    });
});