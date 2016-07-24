"use strict";

function calcFor(evoCost, numPokes, numCandies) {
    var pokesToGrind = 0;
    var spareCandies = 0;
    var possibleEvos = Math.floor(numCandies / evoCost);
    if (numPokes <= possibleEvos) {
        spareCandies = numCandies - (numPokes * evoCost);
        possibleEvos = numPokes;
    }
    else {
        pokesToGrind = numPokes - possibleEvos;
        spareCandies = numCandies - (possibleEvos * evoCost) + pokesToGrind;
        while (pokesToGrind != 0 && (evoCost < spareCandies)) {
            pokesToGrind--;
            possibleEvos++;
            spareCandies -= (evoCost + 1);
        }
    }

    console.log(`Pokes to grind = ${pokesToGrind}`);
    console.log(`Possible Evos = ${possibleEvos}`);
    console.log(`Spare Candies = ${spareCandies}`);

    return {
        evoCost: evoCost,
        pokesToGrind: pokesToGrind,
        possibleEvos: possibleEvos,
        spareCandies: spareCandies
    };
}

function renderHeader() {
    var rowElement = document.createElement("tr");

    var addField = function (text) {
        var td = document.createElement("th");
        td.innerText = text;
        rowElement.appendChild(td);
        return td;
    }

    addField("Evo Cost");
    addField("Pokes to Grind");
    addField("Possible Evos");
    addField("Spare Candies");

    output.appendChild(rowElement);
}

function renderCalculationResults(results) {
    var rowElement = document.createElement("tr");

    var addField = function (text) {
        var td = document.createElement("td");
        td.innerText = text;
        rowElement.appendChild(td);
        return td;
    }

    addField(results.evoCost);
    addField(results.pokesToGrind);
    addField(results.possibleEvos);
    addField(results.spareCandies);

    output.appendChild(rowElement);
}

function main() {
    console.log("Hello World");
}

function calc() {
    console.log("Calculating...");
    var pokes = numPokes.value || 0;
    var candies = numCandies.value || 0;

    output.innerHTML = "";
    renderHeader();

    renderCalculationResults(calcFor(12, pokes, candies));
    renderCalculationResults(calcFor(25, pokes, candies));
    renderCalculationResults(calcFor(50, pokes, candies));
    renderCalculationResults(calcFor(100, pokes, candies));
}
