Chicken.register("Signal.Keyboard", ["window"], function (source) {

    var ALT_MAPPING = {
        Up: "ArrowUp",
        Down: "ArrowDown",
        Left: "ArrowLeft",
        Right: "ArrowRight",
        ArrowUp: "Up",
        ArrowDown: "Down",
        ArrowLeft: "Left",
        ArrowRight: "Right"
    };

    var _providers = {};

    source.onkeydown = function (e) {
        //console.log(e);
        var provider = _providers[e.key];
        if (provider) {
            provider.set();
            e.stopPropagation();
            return false;
        }
    };

    source.onkeyup = function (e) {
        var provider = _providers[e.key];
        if (provider) {
            provider.clear();
            e.stopPropagation();
            return false;
        }
    };

    var KbSignalProvider = Chicken.Class(function (signalValue) {
        this.value = 0;
        this._signalValue = signalValue || 1;
    }, {
        set: function () {
            this.value = this._signalValue;
        },

        clear: function () {
            this.value = 0;
        }
    });

    return {
        createSignalProvider: function Keyboard_createSignalProvider(key, signalValue) {
            var provider = new KbSignalProvider(signalValue);
            _providers[key] = provider;
            var alt = ALT_MAPPING[key];
            if (alt) _providers[alt] = provider;

            return provider;
        },

        releaseSignalProvider: function Keyboard_releaseSignalProvider(key) {
            delete _providers[key];
            var alt = ALT_MAPPING[key];
            if (alt) delete _providers[alt];
        }
    };
});
