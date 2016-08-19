Chicken.register("Graph", [], function () {
    var Graph = Chicken.Class(function (x, y, w) {
        this.x = x;
        this.y = y;
        this.w = w;
    }, {
        render: function (draw, values) {
            var highest = 0;
            for (var v of values)
                if (highest < v.value) highest = v.value;

            draw.save();
            draw.translate(this.x, this.y);
            var top = 0;
            for (var v of values) {
                var w = this.w * (v.value / highest);
                draw.rect(0, top, w, 8, v.colour);
                top += 11;
            }
            draw.restore();
        }
    });

    return Graph;
});
