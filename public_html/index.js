var ws = new WebSocket("ws://127.0.0.1:8070/");
ws.binaryType = 'arraybuffer';

var leftCode = 37;
var upCode = 38;
var rightCode = 39;
var downCode = 40;

var playerNumber = 1;

var smallestSquareSize = 5;

var CANVAS_WIDTH = 1100;
var CANVAS_HEIGHT = 500;
//var padding = 20;
//var borderThickness = 6;
//var frameColor = "#000000";
var context = document.getElementById('canvasId').getContext("2d");



window.onload = windowReady;

function windowReady() {
    window.addEventListener("keydown", this.check, false);
}

ws.onopen = function () {
    alert("Opened!");
};

ws.onmessage = function (evt) {
    if (evt.data.constructor.name == "ArrayBuffer") {
        var s = evt.data;
        var view = new DataView(s);
        var Uint = view.getUint8(0);
        var length = view.byteLength;
        var n = 0;
        while (n < (length - 1) / 2) {
            player.x[n] = view.getUint8(2 * n + 1);
            player.y[n] = view.getUint8(2 * n + 2);
            n ++;
        }
        draw();
    }
};

ws.onclose = function () {
    alert("Closed!");
};

ws.onerror = function (err) {
    alert("Error: " + err);
};

function check(e) {
    var code = e.keyCode;


    switch (code) {
        case upCode:
            sendAction(11);
            break;
        case rightCode:
            sendAction(12);
            break;
        case downCode:
            sendAction(13);
            break;
        case leftCode:
            sendAction(14);
            break;
    }
}

function sendAction(actionNumber) {
    var action = playerNumber + "" + actionNumber;
    ws.send(action);
}

var player = {
    color: "#00A",
    x: {},
    y: {},
    width: smallestSquareSize,
    height: smallestSquareSize,
    draw: function () {
        context.fillStyle = this.color;
        var n = 0;

        while (n < 100) {
            context.fillRect(this.x[n] * smallestSquareSize, this.y[n] * smallestSquareSize, this.width, this.height);
            n++;
            if (this.x[n] === undefined) {
                break;
            }
        }
    }
};
var tail1 = {
    color: "#00A",
    x: 20,
    y: 20,
    width: smallestSquareSize,
    height: smallestSquareSize,
    draw: function () {
        context.fillStyle = this.color;
        context.fillRect(this.x * smallestSquareSize, this.y * smallestSquareSize, this.width, this.height);
    }
};
var tail2 = {
    color: "#00A",
    x: {},
    y: {},
    width: smallestSquareSize,
    height: smallestSquareSize,
    draw: function () {
        context.fillStyle = this.color;
        context.fillRect(this.x[0] * smallestSquareSize, this.y[0] * smallestSquareSize, this.width, this.height);
        context.fillRect(this.x[1] * smallestSquareSize, this.y[1] * smallestSquareSize, this.width, this.height);
        context.fillRect(this.x[2] * smallestSquareSize, this.y[2] * smallestSquareSize, this.width, this.height);
    }
};

function draw() {
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    player.draw();

}

