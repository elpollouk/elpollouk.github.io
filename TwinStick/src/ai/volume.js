Chicken.register("Ai.Volume", [], () => {
    "use strict";

    return Chicken.Class(function Volume(width, height, depth, fillerFunc) {
        this._width = width;
        this._height = height;
        this._depth = depth;
        this._array = new Array(width * height * depth);

        if (typeof fillerFunc !== 'function')
            fillerFunc = Volume.ZERO;

        this.fill(fillerFunc);
    }, {
        _posToIndex: function (x, y, z) {
            return (z * (this._width * this._height)) + (y * this._width) + x;
        },

        fill: function (fillerFunc) {
            for (var z = 0; z < this._depth; z++)
                for (var y = 0; y < this._height; y++)
                    for (var x = 0; x < this._width; x++)
                        this._array[this._posToIndex(x, y, z)] = fillerFunc(x, y, z);
        },

        fillAtZ: function (fillerFunc, z) {
            if (z < 0 || this._depth <= z)
                throw new Error('Z value is out of range');

            for (var y = 0; y < this._height; y++)
                for (var x = 0; x < this._width; x++)
                    this._array[this._posToIndex(x, y, z)] = fillerFunc(x, y, z);
        },

        getAt: function (x, y, z) {
            return this._array[this._posToIndex(x, y, z)];
        },

        setAt: function (x, y, z, value) {
            this._array[this._posToIndex(x, y, z)] = value;
        },

        filterSection: function (x, y, filterVolume) {
            if (this._depth !== filterVolume.depth)
                throw new Error('Filter depth does not match volume depth');
            if (x < 0 || x > (this._width - filterVolume.width) || y < 0 || y > (this._height - filterVolume.height))
                throw new Error('Filter position outside valid range');

            var sum = 0;
            var rangeY = filterVolume.height;
            var rangeX = filterVolume.width;

            for (var cz = 0; cz <  this._depth; cz++)
                for (var cy = 0; cy < rangeY; cy++)
                    for (var cx = 0; cx < rangeX; cx++)
                        sum = this.getAt(x + cx, y + cy, z) * filterVolume.getAt(cx, cy, cz);

            return sum;
        },

        filter: function (filterVolume, outputVolume, outputZ) {
            outputZ = outputZ || 0;

            if (this._depth != filterVolume.depth)
                throw new Error('Filter depth does not match volume depth');
            if (this._width < filterVolume.width || this._height < filterVolume.height)
                throw new Error('Filter to large for volue');
            if ((outputVolume.width !== (this._width - (filterVolume.width - 1)))
             || (outputVolume.height !== (this._height - (filterVolume.height - 1))))
                throw new Error("Output volume size doesn't match filter output size");

            outputVolume.fillAtZ((x, y, z) => {
                return this.filterSection(x, y, filterVolume);
            }, outputZ);
        },

        modify: function (modifyFunc) {
            for (var z = 0; z < this._depth; z++)
                for (var y = 0; y < this._height; y++)
                    for (var x = 0; x < this._width; x++) {
                        var i = this._posToIndex(x, y, z);
                        var v = this._array[i];
                        this._array[i] = modifyFunc(x, y, z, v);
                    }
        }
    }, {
        width: {
            get: function () {
                return this._width;
            },
            enumerable: true
        },
        height: {
            get: function () {
                return this._height;
            },
            enumerable: true
        },
        depth: {
            get: function () {
                return this._depth;
            },
            enumerable: true
        },
    }, {
        ZERO: (x, y, z) => 0,
        RANDOM: (x, y, z) => Math.random(),
        RANDOM_NEGTOPOS: (x, y, z) => (Math.random() * 2) - 1,
        VALUE: (v) => (x, y, z) => v,
    });
});