import $ from "jquery"
import { Button } from 'antd';
import 'antd/lib/button/style/css';
import ReactDOM from "react-dom"
import React from "react"
import getPixels from "get-pixels"
import hypot from "hypot"
import linspace from "linspace"
var canvas = document.getElementById("canvas");

var ctx = canvas.getContext("2d");
window.onresize = (event) => {
    onResize();
};
function onResize() {
    console.log("resize");
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
}
$(document).ready(() => {
    onResize();
});
var imgRadius = 200;
var grayData = [];
function pinCoords(radius, nPins, offset, x0, y0) {
    offset = offset || 0;
    var alpha = linspace(offset, 2 * Math.PI + offset, nPins + 1);
    if ((!x0) || (!y0)) {
        x0 = radius;
        y0 = radius;
    }
    var coords = []
    for (var i = 0; i < alpha.length; i++) {
        var angle = alpha[i];
        var x = Math.floor(x0 + radius * Math.cos(angle));
        var y = Math.floor(y0 + radius * Math.sin(angle));
        coords.push({ x: x, y: y });
    }
    return coords;
}
function linePixels(pin0, pin1) {
    var length = Math.round(hypot(pin1.x - pin0.x, pin1.y - pin0.y));

    var x = linspace(pin0.x, pin1.x, length);
    var y = linspace(pin0.y, pin1.y, length);

    var out = [];
    for (var i = 0; i < length; i++) {
        out.push({
            x: Math.min(imgRadius * 2 - 1, Math.max(0, Math.floor(x[i]) - 1)),
            y: Math.min(imgRadius * 2 - 1, Math.max(0, Math.floor(y[i]) - 1))
        });
    }
    return out
}

function handleChange(selectorFiles) {
    if (selectorFiles.length <= 0) {
        return;
    }
    getPixels(selectorFiles[0].path, (err, pixels) => {
        if (err) {
            console.log("Bad image path")
            return
        }
        var w = pixels.shape[0];
        var h = pixels.shape[1];

        var imgData = ctx.createImageData(w, h);
        var data = imgData.data;
        var dw = 1;
        var r = Math.min(w, h) / 2;
        imgRadius = r / dw;
        console.log(imgRadius);
        var r2 = r * r;
        var cx = w / 2;
        var cy = h / 2;
        grayData = [];
        for (var i = 0; i < w; i += dw) {
            grayData.push([]);
            for (var j = 0; j < h; j += dw) {
                var gray = 0;
                var index = i + j * w;
                if ((Math.pow(i - cx, 2) + Math.pow(j - cy, 2)) > r2) {
                    gray = 0;
                } else {
                    var r = pixels.data[index * 4];
                    var g = pixels.data[index * 4 + 1];
                    var b = pixels.data[index * 4 + 2];
                    gray = Math.round((r * 0.3 + g * 0.6 + b * 0.1));
                }
                data[index * 4 / dw] = gray;
                data[index * 4 / dw + 1] = gray;
                data[index * 4 / dw + 2] = gray;
                data[index * 4 / dw + 3] = 255;
                grayData[grayData.length - 1].push(255 - gray);
            }
        }
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.putImageData(imgData, 100 + imgRadius * 2, 100);
        generateLines();
    });
}
function sum(line) {
    var res = 0;
    for (var i = 0; i < line.length; i++) {
        if (line[i].x >= grayData.length || !line[i] || !grayData[line[i].x]) {
            continue;
        }
        res += grayData[line[i].x][line[i].y];
    }
    return res;
}
function subtract(start, end) {
    var line = linePixels(start, end);
    for (var i = 0; i < line.length; i++) {
        if (line[i].x >= grayData.length || !line[i] || !grayData[line[i].x]) {
            continue;
        }
        var d = 20;
        grayData[line[i].x][line[i].y] -= d;
        if (grayData[line[i].x][line[i].y] < 0) {
            grayData[line[i].x][line[i].y] = 0;
        }
        try {
            grayData[line[i].x - 1][line[i].y - 1] -= d;
            grayData[line[i].x + 1][line[i].y - 1] -= d;
            grayData[line[i].x - 1][line[i].y + 1] -= d;
            grayData[line[i].x + 1][line[i].y + 1] -= d;
            grayData[line[i].x - 1][line[i].y - 1] = Math.max(0, grayData[line[i].x - 1][line[i].y - 1]);
            grayData[line[i].x - 1][line[i].y + 1] = Math.max(0, grayData[line[i].x - 1][line[i].y + 1]);
            grayData[line[i].x + 1][line[i].y - 1] = Math.max(0, grayData[line[i].x + 1][line[i].y - 1]);
            grayData[line[i].x + 1][line[i].y + 1] = Math.max(0, grayData[line[i].x + 1][line[i].y + 1]);
        } catch (e) {

        }
    }
}
function generateLines() {
    var maxLinesNum = 500;
    var oldPin = 0;
    var nPins = 200;
    var coords = pinCoords(imgRadius, nPins);
    var previousPins = [];
    var lines = [];
    var bestPin;
    for (var i = 0; i < maxLinesNum; i++) {
        var bestLine = 0
        var oldCoord = coords[oldPin];
        for (var index = 1; index < nPins; index++) {
            var pin = (oldPin + index) % nPins;
            var coord = coords[pin]
            var line = linePixels(oldCoord, coord);
            var lineSum = sum(line);
            if (lineSum > bestLine && !(previousPins.indexOf(pin) > -1)) {
                bestLine = lineSum
                bestPin = pin
            }
        }
        if (previousPins.length >= 3) {
            previousPins.shift();
        }
        previousPins.push(bestPin);
        subtract(oldCoord, coords[bestPin]);
        lines.push({ start: oldPin, end: bestPin });
        if (bestPin == oldPin) {
            break
        }
        oldPin = bestPin;
    }
    ctx.beginPath();
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'rgba(0,0,0,1)';

    var radius = imgRadius * 1;
    var cx = radius + 100;
    var cy = radius + 100;
    for (var i = 0; i < lines.length; i++) {
        var sa = lines[i].start * Math.PI * 2 / nPins;
        var ta = lines[i].end * Math.PI * 2 / nPins;
        var sx = radius * Math.cos(sa);
        var sy = radius * Math.sin(sa);
        var tx = radius * Math.cos(ta);
        var ty = radius * Math.sin(ta);
        ctx.moveTo(cx + sx, cy + sy);
        ctx.lineTo(cx + tx, cy + ty);
    }
    ctx.stroke();
    console.log("finish");
}
ReactDOM.render(
    <div>
        <Button
            type="primary"
            onClick={() => {
                $('#file_input').click();
            }}>Load Photo</Button>
        <input
            id="file_input"
            type="file"
            style={{
                "display": "none"
            }}
            onChange={(e) => handleChange(e.target.files)} />
    </div>, document.getElementById("site"));
