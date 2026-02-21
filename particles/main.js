// v1.0
"use strict";

(function() {

// Particle data structure: [x, y, oldX, oldY, vx, vy, colour]
const PARTICLE_X = 0;
const PARTICLE_Y = 1;
const PARTICLE_OLD_X = 2;
const PARTICLE_OLD_Y = 3;
const PARTICLE_VX = 4;
const PARTICLE_VY = 5;
const PARTICLE_COLOUR = 6;

// Well data structure: [x, y, strength]
const WELL_X = 0;
const WELL_Y = 1;
const WELL_STRENGTH = 2;

const PARTICLES_PER_COLOUR = 3;
const PARTICLE_RADIUS = 6;
const PARTICLE_INITIAL_VELOCITY_RANGE = 2.5;
const PARTICLE_RESET_DISTANCE_SQUARED = 10000000;
const NUM_WELLS = 3;
const WELL_MARGIN = 150; // Limits how close wells can be to the edge of the canvas
const WELL_STRENGTH_MIN = 7;
const WELL_STRENGTH_MAX = 30;
const DISPAY_CONTROLS_TIMEOUT = 5000;
const AUTO_REST_PERIOD = 60000 * 3; // Automatically reset the simulation every 3 minutes to prevent it from stagnating

const VISUAL_ECHO = 0.85;

const COLOURS = ["red", "blue", "yellow", "cyan", "magenta", "orange", "lime"];
let nextColourIndex = 0;

// Setup 4 respawn points in the corners of the screen, with velocities pointing towards the center
const RESPAWN_X = 0;
const RESPAWN_Y = 1;
const RESPAWN_VX = 2;
const RESPAWN_VY = 3;
const RESPANWN_POINTS = [
    [0, 0,  1,  1],
    [1, 0, -1,  1],
    [1, 1, -1, -1],
    [0, 1,  1, -1]
]

let renderWells = false;
const particles = [];
const wells = [];
let canvas, ctx;
let yeets = 0;
let yeetCounter;

function createParticle(x, y, vx, vy, colour) {
    x = x || Math.random() * (canvas.width - PARTICLE_RADIUS * 2) + PARTICLE_RADIUS;
    y = y || Math.random() * (canvas.height - PARTICLE_RADIUS * 2) + PARTICLE_RADIUS;
    vx = vx ||(Math.random() * PARTICLE_INITIAL_VELOCITY_RANGE * 2) - PARTICLE_INITIAL_VELOCITY_RANGE;
    vy = vy || (Math.random() * PARTICLE_INITIAL_VELOCITY_RANGE * 2) - PARTICLE_INITIAL_VELOCITY_RANGE;
    colour = colour || COLOURS[nextColourIndex++ % COLOURS.length];
    particles.push([x, y, x, y, vx, vy, colour]);
}

function createWell(x, y, strength) {
    x = x || Math.random() * (canvas.width - WELL_MARGIN * 2) + WELL_MARGIN;
    y = y || Math.random() * (canvas.height - WELL_MARGIN * 2) + WELL_MARGIN;
    strength = strength || (Math.random() * (WELL_STRENGTH_MAX - WELL_STRENGTH_MIN)) + WELL_STRENGTH_MIN;
    wells.push([x, y, strength]);
}

function respawnParticle(particle) {
    const spawnPoint = RESPANWN_POINTS[Math.floor(Math.random() * RESPANWN_POINTS.length)];
    const x = spawnPoint[RESPAWN_X] * canvas.width;
    const y = spawnPoint[RESPAWN_Y] * canvas.height;
    const vx = spawnPoint[RESPAWN_VX] * (Math.random() * PARTICLE_INITIAL_VELOCITY_RANGE);
    const vy = spawnPoint[RESPAWN_VY] * (Math.random() * PARTICLE_INITIAL_VELOCITY_RANGE);
    particle[PARTICLE_X] = x;
    particle[PARTICLE_Y] = y;
    particle[PARTICLE_OLD_X] = x;
    particle[PARTICLE_OLD_Y] = y;
    particle[PARTICLE_VX] = vx;
    particle[PARTICLE_VY] = vy;
}

function circle(x, y, r, colour) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = colour;
    ctx.fill()
    ctx.restore();
}

function trailSegment(x1, y1, x2, y2, radius, colour) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.translate(x1, y1);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, -radius);
    ctx.lineTo(distance, -radius);
    ctx.arc(distance, 0, radius, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(0, radius);
    ctx.arc(0, 0, radius, Math.PI / 2, -Math.PI / 2);
    ctx.closePath();

    ctx.fillStyle = colour;
    ctx.fill();
    ctx.restore();
}

function update() {
    for (const p of particles) {
        for (const w of wells) {
            const dx = w[WELL_X] - p[PARTICLE_X];
            const dy = w[WELL_Y] - p[PARTICLE_Y];
            const r2 = dx * dx + dy * dy;
            // Detect particles that have flown off into the distance and reset them with a new position and velocity
            if (r2 > PARTICLE_RESET_DISTANCE_SQUARED) {
                yeets++;
                yeetCounter.textContent = yeets;

                popYeetCounter();
                respawnParticle(p);
            }
            else {
                const g = w[WELL_STRENGTH] / r2;
                p[PARTICLE_VX] += g * dx;
                p[PARTICLE_VY] += g * dy;
           }
        }

        p[PARTICLE_OLD_X] = p[PARTICLE_X];
        p[PARTICLE_OLD_Y] = p[PARTICLE_Y];
        p[PARTICLE_X] += p[PARTICLE_VX];
        p[PARTICLE_Y] += p[PARTICLE_VY];
    }
}

function render() {
    ctx.globalAlpha = 1 - VISUAL_ECHO;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;

    if (renderWells) {
        for (const w of wells) {
            circle(w[WELL_X], w[WELL_Y], w[WELL_STRENGTH], draggingWell === w ? "rgb(128, 128, 128)" : "rgb(48, 48, 48)");
        }
    }

    for (const p of particles) {
        trailSegment(p[PARTICLE_OLD_X], p[PARTICLE_OLD_Y], p[PARTICLE_X], p[PARTICLE_Y], PARTICLE_RADIUS, p[PARTICLE_COLOUR]);
    }
}

function step() {
    update();
    render();
    requestAnimationFrame(step);
}

let draggingWell = null;
function onBeginDrag(e) {
    if (!renderWells) return;

    const mouseX = e.offsetX * (canvas.width / canvas.clientWidth);
    const mouseY = e.offsetY * (canvas.height / canvas.clientHeight);
    for (const well of wells) {
        const dx = well[WELL_X] - mouseX;
        const dy = well[WELL_Y] - mouseY;
        if (dx * dx + dy * dy < well[WELL_STRENGTH] * well[WELL_STRENGTH]) {
            draggingWell = well;
            break;
        }
    }
}

function onMouseMove(e) {
    if (draggingWell) {
        draggingWell[WELL_X] = e.offsetX * (canvas.width / canvas.clientWidth);
        draggingWell[WELL_Y] = e.offsetY * (canvas.height / canvas.clientHeight);
    }
}

function onEndDrag(e) {
    draggingWell = null;
}

function enterFullscreen() {
    document.body.classList.add("fullscreen");
    document.body.requestFullscreen();
    setTimeout(initSimulation, 100);
}

function exitFullscreen() {
    document.body.classList.remove("fullscreen");
    document.exitFullscreen();
    setTimeout(initSimulation, 100);
}

let displayTimeout;
function displayControls() {
    document.body.classList.add("displayControls");
    clearTimeout(displayTimeout);
    displayTimeout = setTimeout(() => document.body.classList.remove("displayControls"), DISPAY_CONTROLS_TIMEOUT);
}

let lastPoppedYeets = 0;
function popYeetCounter() {
    const now = Date.now();
    if (lastPoppedYeets + 4200  < now) { // Don't pop the counter more frequently than the animation duration to prevent a race when adding and removing the "pop" class
        yeetCounter.classList.add("pop");
        lastPoppedYeets = now;
    }
}

let autoResetTimeout;
function initSimulation() {
    // Set a consitent scale based on the canvas aspect ratio
    let w = canvas.clientWidth;
    let h = canvas.clientHeight;
    if (w < h) {
        const ratio = w / h;
        h = 1920;
        w = h * ratio;

    } else {
        const ratio = h / w;
        w = 1920;
        h = w * ratio;
    }

    canvas.width = w;
    canvas.height = h;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    draggingWell = null;
    wells.length = 0;
    for (let i = 0; i < NUM_WELLS; i++) {
        createWell();
    }

    particles.length = 0;
    for (let i = 0; i < PARTICLES_PER_COLOUR * COLOURS.length; i++) {
        createParticle();
    }

    clearTimeout(autoResetTimeout);
    autoResetTimeout = setTimeout(initSimulation, AUTO_REST_PERIOD);
}

function bindAction(element, event, action) {
    if (typeof element === "string") {
        element = document.getElementById(element);
    }
    element.addEventListener(event, (e) =>{
        action?.(e);
        displayControls();
    });
}

function main() {
    canvas = document.getElementById("view");
    ctx = canvas.getContext("2d");
    yeetCounter = document.getElementById("yeets");
    yeetCounter.addEventListener("animationend", () => yeetCounter.classList.remove("pop"));
    bindAction("goFullscreen", "click", enterFullscreen);
    bindAction("exitFullscreen", "click", exitFullscreen);
    bindAction("reset", "click", initSimulation);
    bindAction("toggleWells", "click", () => renderWells = !renderWells);
    bindAction("showScore", "click", popYeetCounter);
    bindAction(canvas, "mousemove", onMouseMove);
    bindAction(canvas, "mousedown", onBeginDrag);
    bindAction(canvas, "mouseup", onEndDrag);
    bindAction(canvas, "click");

    initSimulation();
    displayControls();

    requestAnimationFrame(step);
}

window.onload = main;

})();