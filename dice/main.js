"use strict";
const NUM_SIDES = 6;

function reroll() {
    this.innerText = Math.floor(Math.random() * NUM_SIDES) + 1;
}

function addDie(value) {
    const die = document.createElement("div");
    die.className = "die";
    die.innerText = value;
    die.ondblclick = reroll
    document.getElementById("results").appendChild(die);
}

function rollDice() {
    document.getElementById("results").innerHTML = ""
    const numDice = parseInt(document.getElementById("numDice").value);
    for (let i = 0; i < numDice; i++) {
        const dieValue = Math.floor(Math.random() * NUM_SIDES) + 1;
        addDie(dieValue);
    }

    window.documentPictureInPicture.requestWindow
}

async function goPip() {
    const pipWindow = await window.documentPictureInPicture.requestWindow({
        width: 400,
        height: 300,
    });

    [...document.styleSheets].forEach((styleSheet) => {
    try {
      const cssRules = [...styleSheet.cssRules]
        .map((rule) => rule.cssText)
        .join("");
      const style = document.createElement("style");

      style.textContent = cssRules;
      pipWindow.document.head.appendChild(style);
    } catch (e) {
      const link = document.createElement("link");

      link.rel = "stylesheet";
      link.type = styleSheet.type;
      link.media = styleSheet.media;
      link.href = styleSheet.href;
      pipWindow.document.head.appendChild(link);
    }
  });

  pipWindow.document.body.innerHTML = document.body.innerHTML
  const script = document.createElement("script");
  script.src = "main.js";
  pipWindow.document.body.appendChild(script);
  pipWindow.document.getElementById("goPip").style.display = "none";
  pipWindow.document.title = "Dice Roller";
}