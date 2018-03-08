import $ from "jquery"
import {Button} from 'antd';
import 'antd/lib/button/style/css'; // 或者 antd/lib/button/style/css
import ReactDOM from "react-dom"
import React from "react"
import getPixels from "get-pixels"
import linspace from "linspace"
import hypot from "hypot"
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

function pinCoords(radius, nPins, offset, x0, y0) {
    var alpha = linspace(0 + offset, 2 * Math.PI + offset, nPins + 1);
    if ((!x0) || (!y0)) {
        x0 = radius + 1;
        y0 = radius + 1;
    }
    var coords = []
    for (var i = 0; i < alpha.length; i++) {
        var angle = alpha[i];
        var x = Math.ceil(x0 + radius * Math.cos(angle))
        var y = Math.ceil(y0 + radius * Math.sin(angle))
        coords.push({x: x, y: y});
    }
    return coords
}
console.log(pinCoords(100, 200, 0));
function linePixels(pin0, pin1) {
    var length = Math.round(hypot(pin1[0] - pin0[0], pin1[1] - pin0[1]));
    var x = linspace(pin0[0], pin1[0], length)
    var y = linspace(pin0[1], pin1[1], length)
    var out = [];
    for (var i = 0; i < length; i++) {
        out.push({
            x: Math.ceil(x[i]) - 1,
            y: Math.ceil(y[i]) - 1
        });
    }
    return out
}

function handleChange(selectorFiles) {
    getPixels(selectorFiles[0].path, (err, pixels) => {
        if (err) {
            console.log("Bad image path")
            return
        }
        var w = pixels.shape[0];
        var h = pixels.shape[1];

        var imgData = ctx.createImageData(w, h); // width x height
        var data = imgData.data;
        var dw = 4;
        var r = Math.min(w, h) / 2;
        var r2 = r * r;
        var cx = w / 2;
        var cy = h / 2;
        for (var i = 0; i < w; i += dw) {
            for (var j = 0; j < h; j += dw) {
                var gray = 0;
                var index = i + j * w;
                if ((Math.pow(i - cx, 2) + Math.pow(j - cy, 2)) > r2) {
                    gray = 0;
                } else {
                    var r = pixels.data[index * 4];
                    var g = pixels.data[index * 4 + 1];
                    var b = pixels.data[index * 4 + 2];
                    gray = Math.round(255 - (r * 0.3 + g * 0.6 + b * 0.1));
                }
                data[index * 4 / dw] = gray;
                data[index * 4 / dw + 1] = gray;
                data[index * 4 / dw + 2] = gray;
                data[index * 4 / dw + 3] = 255;
            }
        }
        ctx.putImageData(imgData, 100, 100);
    });
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
        onChange={(e) => handleChange(e.target.files)}/>
</div>, document.getElementById("site"));

// # Compute a line mask def linePixels(pin0, pin1):     length =
// int(np.hypot(pin1[0] - pin0[0], pin1[1] - pin0[1]))     x =
// np.linspace(pin0[0], pin1[0], length)     y = np.linspace(pin0[1], pin1[1],
// length)     return (x.astype(np.int)-1, y.astype(np.int)-1)