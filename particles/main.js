"use strict";

(function() {

const PARTICLE_X = 0;
const PARTICLE_Y = 1;
const PARTICLE_OLD_X = 2;
const PARTICLE_OLD_Y = 3;
const PARTICLE_VX = 4;
const PARTICLE_VY = 5;
const PARTICLE_COLOUR = 6;

const WELL_X = 0;
const WELL_Y = 1;
const WELL_STRENGTH = 2;

const NUM_PARTICLES = 20;
const PARTICLE_RADIUS = 5;
const PARTICLE_INITIAL_VELOCITY_RANGE = 2.5;
const NUM_WELLS = 3;
const WELL_MARGIN = 150;
const WELL_STRENGTH_MIN = 0.05 * 100;
const WELL_STRENGTH_MAX = 0.2 * 100;

const VISUAL_ECHO = 0.8;

const colours = ["red", "green", "blue", "yellow", "cyan", "magenta", "orange", "purple", "lime"];
let nextColourIndex = 0;

let renderWells = false;
const particles = [];
const wells = [];
let canvas, ctx;

function createParticle(x, y, vx, vy, colour) {
    x = x || Math.random() * (canvas.width - PARTICLE_RADIUS * 2) + PARTICLE_RADIUS;
    y = y || Math.random() * (canvas.height - PARTICLE_RADIUS * 2) + PARTICLE_RADIUS;
    vx = vx ||(Math.random() * PARTICLE_INITIAL_VELOCITY_RANGE * 2) - PARTICLE_INITIAL_VELOCITY_RANGE;
    vy = vy || (Math.random() * PARTICLE_INITIAL_VELOCITY_RANGE * 2) - PARTICLE_INITIAL_VELOCITY_RANGE;
    colour = colour || colours[nextColourIndex++ % colours.length];
    particles.push([x, y, x, y, vx, vy, colour]);
}

function createWell(x, y, strength) {
    x = x || Math.random() * (canvas.width - WELL_MARGIN * 2) + WELL_MARGIN;
    y = y || Math.random() * (canvas.height - WELL_MARGIN * 2) + WELL_MARGIN;
    strength = strength || (Math.random() * (WELL_STRENGTH_MAX - WELL_STRENGTH_MIN)) + WELL_STRENGTH_MIN;
    wells.push([x, y, strength]);
}

function update() {
    for (const p of particles) {
        for (const w of wells) {
            const dx = w[WELL_X] - p[PARTICLE_X];
            const dy = w[WELL_Y] - p[PARTICLE_Y];
            const r2 = dx * dx + dy * dy;
            const g = w[WELL_STRENGTH] / r2;
            p[PARTICLE_VX] += g * dx;
            p[PARTICLE_VY] += g * dy;
        }

        p[PARTICLE_OLD_X] = p[PARTICLE_X];
        p[PARTICLE_OLD_Y] = p[PARTICLE_Y];
        p[PARTICLE_X] += p[PARTICLE_VX];
        p[PARTICLE_Y] += p[PARTICLE_VY];
    }
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

function render() {
    ctx.globalAlpha = 1 - VISUAL_ECHO;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;

    if (renderWells) {
        for (const w of wells) {
            circle(w[WELL_X], w[WELL_Y], 10, "rgb(64, 64, 64)");
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

function enterFullscreen() {
    document.body.classList.add("fullscreen");
    document.body.requestFullscreen();
    requestAnimationFrame(initSimulation);
}

function exitFullscreen() {
    document.body.classList.remove("fullscreen");
    document.exitFullscreen();
    requestAnimationFrame(initSimulation);
}

let displayTimeout;
function displayControls() {
    document.body.classList.add("displayControls");
    clearTimeout(displayTimeout);
    displayTimeout = setTimeout(() => document.body.classList.remove("displayControls"), 2000);
}

function initSimulation() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    wells.length = 0;
    for (let i = 0; i < NUM_WELLS; i++) {
        createWell();
    }

    particles.length = 0;
    for (let i = 0; i < NUM_PARTICLES; i++) {
        createParticle();
    }
}

function bindAction(element, event, action) {
    if (typeof element === "string") {
        element = document.getElementById(element);
    }
    element.addEventListener(event, () =>{
        action?.();
        displayControls();
    });
}

function main() {
    canvas = document.getElementById("view");
    ctx = canvas.getContext("2d");

    bindAction("goFullscreen", "click", enterFullscreen);
    bindAction("exitFullscreen", "click", exitFullscreen);
    bindAction("reset", "click", initSimulation);
    bindAction("toggleWells", "click", () => {
        renderWells = !renderWells;
    });
    bindAction(canvas, "mousemove");
    bindAction(canvas, "click");

    initSimulation();

    requestAnimationFrame(step);
}

window.onload = main;

})();