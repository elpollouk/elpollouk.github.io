Chicken.register("RenderAttachment", [], function () {
    var RenderAttachment = Chicken.Class(function (onRender) {
        this.render = onRender;
    }, {
        update: function () {},
    });

    return RenderAttachment;
})
