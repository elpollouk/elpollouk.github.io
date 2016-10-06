(function () {
"use strict";

var series = [];

function initControls() {
    plotWidth.value = 500;
    plotHeight.value = 500;
    axisXmin.value = -1;
    axisXmax.value =  1;
    axisYmin.value = -1;
    axisYmax.value =  1;

    var allInputs = document.querySelectorAll(".controls input");
    for (var input of allInputs) {
        input.onchange = onPlotInputChanged;
    }
}

function onPlotInputChanged() {
    renderPlot();
}

function renderPlot() {
    var width = Number(plotWidth.value);
    var height = Number(plotHeight.value);
    var xMin = Number(axisXmin.value);
    var yMin = Number(axisYmin.value)
    var plotXrange = Number(axisXmax.value) - xMin;
    var plotYrange = Number(axisYmax.value) - yMin;
    var pixelWidth = plotXrange / width;
    var pixelHeight = plotYrange / height;

    var translate = function (x, y) {
        return {
            x: (x - xMin) * width / plotXrange,
            y: height - ((y - yMin) * height / plotYrange)
        }
    }

    var zeroZero = translate(0, 0);

    graph.width = width;
    graph.height = height;
    var ctx = graph.getContext("2d");

    ctx.clearRect(0, 0, width, height);

    // Zero lines
    ctx.moveTo(zeroZero.x, 0);
    ctx.lineTo(zeroZero.x, height);
    ctx.moveTo(0, zeroZero.y);
    ctx.lineTo(width, zeroZero.y);
    ctx.stroke();

    for (var plotter of series) {
        var x = xMin;
        var y = plotter(x);
        var point = translate(x, y);

        ctx.strokeStyle = "blue";
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);

        for (var i = 0; i < width; i++) {
            x += pixelWidth;
            y = plotter(x);
            point = translate(x, y);
            ctx.lineTo(point.x, point.y);
        }

        ctx.stroke();
    }
}

window.onload = function () {
    initControls();
    renderPlot();
}

window.line = function (m, c) {
    m = m || 0;
    c = c || 0;
    return function (x) {
        return (m * x) + c;
    }
}

window.sinewave = function (freq, amplitude, phase) {
    freq = freq || 1;
    amplitude = (amplitude || 1) / 2;
    phase = phase || 0;
    return function (x) {
        return Math.sin((x * 2 * Math.PI * freq) + phase) * amplitude;
    }
}

window.squarewave = function (freq, amplitude, phase) {
    freq = freq || 1;
    var period = 1 / freq;
    var halfPeriod = period / 2;
    amplitude = amplitude || 1;
    amplitude /= 2;
    phase = phase || 0;
    return function (x) {
        var y = (x + phase);
        y = (y < 0) ? y = halfPeriod - y : y;
        y %= period;
        y = y < halfPeriod ? amplitude : -amplitude;
        return y;
    }
}

window.waveform = function () {
    var plotters = arguments;
    return function (x) {
        var sum = 0;
        for (var plotter of plotters) {
            sum += plotter(x);
        }
        return sum;
    }
}

window.clearSeries = function () {
    series = [];
    renderPlot();
}

window.addSeries = function (plotter) {
    series.push(plotter);
    renderPlot();
}

})();
