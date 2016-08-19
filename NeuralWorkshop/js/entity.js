Chicken.register("Entity", ["ChickenVis.Math"], function (Math) {

    var ROTATION_SPEED = Math.degreesToRads(20);
    var ACCELERATION = 20;
    var DRAG = 0.955;

    // Todo - Move to ChickenVis.Math
    function rotationToVector(rads, scale) {
        var v = { x: 0, y: scale };
        Math.rotate2(v, -rads);
        return v;
    }

    var arrowPath = [
        { x: 0, y: 17 },
        { x: 4, y: 10 },
        { x: -4, y: 10 },
        { x: 0, y: 17 }
    ];

    var Entity = Chicken.Class(function () {
        this.rotation = Math.PI;
        this.dRotation = 0;
        this.pos = Math.vector2(400, 300);
        this.velocity = Math.vector2(0, 0);
        this.colour = "rgb(127, 127, 255)";
        this.signalSteer = null;
        this.signalGo = null;

        this._attachments = [];
    }, {
        attach: function (attachment) {
            attachment.attachedEntity = this;
            this._attachments.push(attachment);
        },

        render: function (draw) {
            draw.save();

            draw.translate(this.pos.x, this.pos.y);
            draw.rotate(this.rotation);

            draw.circle(0, 0, 20, this.colour);
            draw.circle(0, 0, 20, "black", true);
            draw.path(arrowPath);

            for (var a of this._attachments) {
                a.render(draw);
            }

            draw.restore();
        },

        update: function (dt) {
            // Work out the rotation
            this.dRotation += dt * ROTATION_SPEED * this.signalSteer.value;
            this.dRotation *= DRAG;
            this.rotation += this.dRotation;
            // This is to normalise the value for the AI
            //if (this.rotation < 0) this.rotation += Math.TWO_PI;
            //else if (this.rotation >= Math.TWO_PI) this.rotation -= Math.TWO_PI;

            // Position/Velocity
            var dV = rotationToVector(this.rotation, this.signalGo.value * ACCELERATION * dt);
            Math.add2(this.velocity, dV);
            Math.scale2(this.velocity, DRAG);
            Math.add2(this.pos, this.velocity);

            // World bounding
            //if (this.pos.x < 20) this.pos.x = 20;
            //else if (this.pos.x > 780) this.pos.x = 780;
            //if (this.pos.y < 20) this.pos.y = 20;
            //else if (this.pos.y > 580) this.pos.y = 580;

            // Update our attachments
            for (var a of this._attachments) {
                a.update(dt);
            }
        }
    });

    return Entity;
});
