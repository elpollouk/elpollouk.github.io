const pots = [
    1, 7,
    1, 7,
    1, 7,
    1, 7,
    1, 7,
    1, 7,
    1, 7,
    1, 7,
    1, 7,
    1, 7,
    1, 7,
    1, 7,
    1, 7,
    1, 7,
    1, 7,
    2, 3, 4, 5, 6, 7
];

let remaining = 147;
let potIndex = 0;

const scoreDisplay = document.getElementById("remaining");

function pot() {
    if (remaining <= 0) return;

    remaining -= pots[potIndex++];
    scoreDisplay.innerText = remaining;
}

function undo() {
    if (potIndex === 0) return;

    remaining += pots[--potIndex];
    scoreDisplay.innerText =remaining;
}

function reset() {
    remaining = 147;
    potIndex = 0;
    scoreDisplay.innerText = remaining;
}

document.getElementById("pot").onclick = pot;
document.getElementById("undo").onclick = undo;
document.getElementById("reset").onclick = reset;