Chicken.register("Signal.Target", ["ChickenVis.Math"], function (Math) {
    var TargetSignal = Chicken.Class(function (target) {
        this.attachedEntity = null;
        this.targetEntity = target || null;
        this._signal0 = {value:0};
        this._signal1 = {value:0};
        this.signals = [this._signal0, this._signal1];
    }, {
        update: function (dt) {
            var targetVector = Math.subAndClone2(this.targetEntity.pos, this.attachedEntity.pos);
            Math.rotate2(targetVector, this.attachedEntity.rotation);
            this._signal0.value = targetVector.x;
            this._signal1.value = targetVector.y;
        },

        render: function (draw) {
            draw.line(0, 0, this._signal0.value, this._signal1.value, "rgba(0, 0, 0, 0.5)");
        }
    });

    return TargetSignal;
});
