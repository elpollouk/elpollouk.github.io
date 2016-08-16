// Built: 2016-08-16T18:48:36.661Z
// Commit: 731a09c7377ac8285752ae274e36b8039003903e

// File: js/utils.js
Chicken.register("ChickenVis.createElement", function createElement(type) {
    return document.createElement(type);
});

Chicken.register("ChickenVis.requestAnimationFrame", function requestAnimationFrame(callback) {
    return window.requestAnimationFrame(callback);
});


// File: js/loader.js
Chicken.register("ChickenVis.Loader", ["ChickenVis.createElement"], function (createElement) {

    var typeLoaders = {};

    var Loader = Chicken.Class(function Loader() {
        this.numReady = 0;
        this.numTotal = 0;
        this.failed = [];
        this._store = {};
    }, {
        queue: function Loader_queue(items, onStateChange) {
            var loader = this;
            loader.numTotal += items.length;

            for (var i = 0; i < items.length; i++) {
                var asset = Loader.load(items[i].source, items[i].type, function Loader_queue_onStateChange(asset) {
                    switch (asset.state) {
                        case Loader.STATE_READY:
                            loader.numReady++;
                            break;

                        case Loader.STATE_ERROR:
                            loader.failed.push(asset);
                            break;
                    }

                    onStateChange(asset, loader);
                });
                asset.id = items[i].id;
                loader._store[asset.id] = asset;
            }
        },

        getInfo: function Loader_getInfo(id) {
            return this._store[id];
        },

        getData: function Loader_getData(id) {
            var asset = this._store[id];
            if (!asset) return;
            if (asset.state !== Loader.STATE_READY) return null;

            return asset.data;
        }
    }, {}, {
        TYPE_IMAGE : "img",

        STATE_QUEUED : 0,
        STATE_READY : 1,
        STATE_ERROR : -1,

        load: function Loader_load(source, type, onStateChange) {
            var asset = {
                type: type,
                source: source,
                state: Loader.STATE_QUEUED,
                onStateChange: onStateChange
            };

            typeLoaders[type](asset);

            return asset;
        }
    });

    typeLoaders[Loader.TYPE_IMAGE] = function loadImage(asset) {
        asset.data = createElement("img");

        asset.data.src = asset.source;
        asset.data.onload = function () {
            asset.state = Loader.STATE_READY;
            asset.onStateChange(asset);
        }
        asset.data.onerror = function () {
            asset.state = Loader.STATE_ERROR;
            asset.onStateChange(asset);
        }
    }

    return Loader;
});


// File: js/updateloop.js
Chicken.register(
"ChickenVis.UpdateLoop",
["ChickenVis.requestAnimationFrame", "Date.now"],
function (requestFrame, now) {
    "use strict";

    var UpdateLoop = Chicken.Class(function UpdateLoop(onupdate) {
        if (!onupdate) throw new Error("No update function specified");

        // Create an update wrapper that capture both this and the onupdate function
        var updateloop = this;
        var _updateWrapper = function UpdateLoop__updateWrapper() {
            // Calculate our delta times
            var time = now();
            var dt = (time - updateloop._lastFrameTime) / 1000;
            updateloop._lastFrameTime = time;

            if (!updateloop._paused) {
                // Call the registered update handler
                onupdate(dt);
                requestFrame(_updateWrapper);
            }
        };

        // Basic properties
        this._paused = true; // We start off paused
        this._lastTime = 0;
        this._updateWrapper = _updateWrapper;
        this._onupdate = onupdate;
    }, {
        step: function UpdateLoop_step(dt) {
            this._onupdate(dt);
        }
    }, {
        paused: {
            get: function UpdateLoop_getPaused() {
                return this._paused;
            },
            set: function UpdateLoop_setPaused(value) {
                if (value == this._paused) return value;

                this._paused = value;
                if (!value) {
                    this._lastFrameTime = now();
                    this._updateWrapper();
                }

                return value;
            },
            enumerable: true
        }
    });

    return UpdateLoop;
});


