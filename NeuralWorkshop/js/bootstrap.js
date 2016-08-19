Chicken.inject(["ChickenVis.UpdateLoop", "ChickenVis.FixedDeltaUpdater", "Core"],
function (UpdateLoop, FdUpdater, Core) {
    "use strict";

    var autoWarp = false;
    var warpFactor = 1;

    var fixedUpdater = new FdUpdater(Core.onUpdate, 0.010);

    var updater = new UpdateLoop(function (dt) {
        if (autoWarp) {
            if (dt >= 1)
                warpFactor -= 10;
            else {
                warpFactor++;
            }
        }
        else
        {
            warpFactor = Number.parseInt(warp.value);
        }

        fixedUpdater.update(dt * warpFactor);
        Core.onFrame(updater.fps, warpFactor);
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

    window.toggleAutoWarp = function () {
        autoWarp = !autoWarp;
    }
});
