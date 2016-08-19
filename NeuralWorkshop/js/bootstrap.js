Chicken.inject(["ChickenVis.UpdateLoop", "ChickenVis.FixedDeltaUpdater", "Core"],
function (UpdateLoop, FdUpdater, Core) {
    "use strict";

    var fixedUpdater = new FdUpdater(Core.onUpdate, 0.010);

    var updater = new UpdateLoop(function (dt) {
        fixedUpdater.update(dt * Number.parseInt(warp.value));
        Core.onFrame(updater.fps);
    });

    window.onload = function () {
        console.log("Launching Neural Workshop...");
        Core.init(function (ok) {
            if (ok) {
                updater.paused = false;
            }
            else {
                console.error("Failed to load assets");
            }
        });
    }

    window.updateToggle = function () {
        updater.paused = !updater.paused;
    }
});
