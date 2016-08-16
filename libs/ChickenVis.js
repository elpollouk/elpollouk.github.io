// ChickenVis
// Version: 0.1.0
// Built: 2016-08-16T20:08:59.815Z
// Commit: 9a3ffc01fa1d0a06c5b1771e12b30823279d7e70

// File: js/utils.js
Chicken.register("ChickenVis.createElement", function createElement(type) {
    return document.createElement(type);
});

Chicken.register("ChickenVis.requestAnimationFrame", function requestAnimationFrame(callback) {
    return window.requestAnimationFrame(callback);
});

Chicken.register("ChickenVis.resolveElement", function resolveElement(element) {
    switch (typeof element) {
        case "string":
            return document.getElementById(element);
        case "function":
            return element();
        default:
            return element;
    }
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


// File: js/draw.js
Chicken.register("ChickenVis.Draw",
["ChickenVis.resolveElement"],
function (resolveElement) {
    "use strict";

    var DEFAULT_COLOUR    = "black";
    var DEFAULT_FONT    = "10px Courier";
    var TWO_PI            = 2 * Math.PI;

    var _supressSelection = function _supressSelection() {
        return false;
    }

    var Draw = Chicken.Class(function Draw(container, width, height) {
        container = resolveElement(container);
        this._width = width || container.clientWidth;
        this._height = height || container.clientHeight;
        this._originX = 0;
        this._originY = 0;

        this._canvas = document.createElement("canvas");
        this._canvas.setAttribute("width", this._width);
        this._canvas.setAttribute("height", this._height);
        this._canvas.onselectstart = _supressSelection;
        container.appendChild(this._canvas);

        this._ctx = this._canvas.getContext("2d");

        this._ctx.textBaseline = "top";
    },
    {
        setOrigin: function Draw_setOrigin(x, y) {
            // We store the negative of the origin as we use that when clearing and so saves an operation there
            this._originX = -x;
            this._originY = -y;
            this._ctx.translate(x, y);
        },

        line: function Draw_line(x1, y1, x2, y2, colour) {
            colour = colour || DEFAULT_COLOUR;
            this._ctx.beginPath();
            this._ctx.moveTo(x1, y1);
            this._ctx.lineTo(x2, y2);
            this._ctx.strokeStyle = colour;
            this._ctx.stroke();
        },

        path: function Draw_path(path, colour) {
            colour = colour || DEFAULT_COLOUR;
            var ctx = this._ctx;
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);

            var l = path.length;
            for (var i = 1; i < l; i++) {
                ctx.lineTo(path[i].x, path[i].y);
            }

            ctx.strokeStyle = colour;
            ctx.stroke();
        },

        circle: function Draw_circle(x, y, r, colour, outline) {
            colour = colour || DEFAULT_COLOUR;

            this._ctx.beginPath();
            this._ctx.arc(x, y, r, 0, TWO_PI);

            if (outline) {
                this._ctx.strokeStyle = colour;
                this._ctx.stroke();
            }
            else {
                this._ctx.fillStyle = colour;
                this._ctx.fill();
            }
        },

        rect: function Draw_rect(x, y, w, h, colour, outline) {
            colour = colour || DEFAULT_COLOUR;

            if (outline) {
                this._ctx.beginPath();
                this._ctx.rect(x, y, w, h);
                this._ctx.strokeStyle = colour;
                this._ctx.stroke();
            }
            else {
                this._ctx.fillStyle = colour;
                this._ctx.fillRect(x, y, w, h);
            }
        },

        image: function Draw_image(src, dstX, dstY) {
            this._ctx.drawImage(src, dstX, dstY);
        },

        imageEx: function Draw_imageEx(src, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight) {
            this._ctx.drawImage(src, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
        },

        text: function Draw_text(text, x, y, colour, font) {
            colour = colour || DEFAULT_COLOUR;
            font = font || DEFAULT_FONT;

            this._ctx.font = font;
            this._ctx.fillStyle = colour;
            this._ctx.fillText(text, x, y);
        },

        clear: function Draw_clear() {
            this._ctx.clearRect(this._originX, this._originY, this._width, this._height);
        }
    }, {
        canvas: {
            get: function Draw_getCanvas() {
                return this._canvas;
            },
            enumerable: true
        },
        context: {
            get: function Draw_getContext() {
                return this._ctx;
            },
            enumerable: true
        },
        width: {
            get: function Draw_getWidth() {
                return this._width;
            },
            enumerable: true
        },
        height: {
            get: function Draw_getHeight() {
                return this._height;
            },
            enumerable: true
        }
    });

    return Draw;
});


