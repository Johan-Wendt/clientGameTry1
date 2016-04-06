var ws = new WebSocket("ws://127.0.0.1:9010/");
ws.binaryType = 'arraybuffer';

var leftCode = 37;
var upCode = 38;
var rightCode = 39;
var downCode = 40;
var spaceCode = 32;

var playerNumber = 1;

var smallestSquareSize = 10;

var CANVAS_WIDTH = 1100;
var CANVAS_HEIGHT = 500;
//var padding = 20;
//var borderThickness = 6;
//var frameColor = "#000000";
var context = document.getElementById('canvasId').getContext("2d");

var bonuses = [];



window.onload = windowReady;

function windowReady() {
    window.addEventListener("keydown", this.check, false);
}

ws.onopen = function () {
    //alert("Opened!");
};

ws.onmessage = function (evt) {
    if (evt.data.constructor.name == "ArrayBuffer") {
        var s = evt.data;
        var view = new DataView(s);
        //var Uint = view.getUint8(0);
        var dataLength = view.byteLength;
        var dataArray = [];
        var actionArrays = [];
        var total = 0;
        // var n = 0;
        var lastSliced = 0;
        var playerResult = [];
        var bonusResult = [];
        while (total < dataLength) {
            actionArrays[total] = view.getInt8(total);
            if (actionArrays[actionArrays.length - 1] == -1) {
                if (total > lastSliced) {

                    handleSwitcher(actionArrays.slice(lastSliced, total));
                    lastSliced = total + 1;
                }
            }
            total++;
        }
        draw();
    }
};

ws.onclose = function () {
  //  alert("Closed!");
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
        case spaceCode:
            sendAction(25);
            break;
    }
}

function sendAction(actionNumber) {
    var action = playerNumber + "" + actionNumber;
    ws.send(action);
}

var player = {
    color: "#00A",
    x: [],
    y: [],
    width: smallestSquareSize,
    height: smallestSquareSize,
    draw: function () {
        context.fillStyle = this.color;
        var n = 0;

        //    if (this.x.length !== undefined) {

        while (n < this.x.length) {
            context.fillRect(this.x[n] * smallestSquareSize, this.y[n] * smallestSquareSize, this.width, this.height);
            n++;


        }
        //   }
    }
};
var speedBonus = {
    color: "#F5A",
    x: [],
    y: [],
    width: smallestSquareSize,
    height: smallestSquareSize,
    draw: function () {
        context.fillStyle = this.color;
        var n = 0;


        while (n < this.x.length) {
            context.fillRect(this.x[n] * smallestSquareSize, this.y[n] * smallestSquareSize, this.width, this.height);
            n++;

        }

    }
};
var gameBorders = {
    color: "#CCC",
    x: [],
    y: [],
    width: smallestSquareSize,
    height: smallestSquareSize,
    draw: function () {
        context.fillStyle = this.color;
        var n = 0;
        

        while (n < this.x.length) {
            
            context.fillRect(this.x[n] * smallestSquareSize, this.y[n] * smallestSquareSize, this.width, this.height);
            n++;

        }
    }
};

function draw() {
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    player.draw();
    speedBonus.draw();
    gameBorders.draw();

}

function handleSwitcher(arr) {
    var happening = -1;
    while(happening == -1 && arr.length > 1) {
        var happening = arr.shift();

    }
        

    switch (happening) {
        case 0:
            handleGamePlan(arr);
            break;
        case 1:
            handlePlayerPositioning(arr);
            break;
        case 2:
            handleBonusPositioning(arr);
            break;
    }

}
function handlePlayerPositioning(arr) {
    var happening = arr.shift();

    //var n = arr.length;
    var n = 0;
    switch (happening) {
        case 1:
            player.x = [];
            player.y = [];
            while (arr.length > 0) {
                player.x[n] = arr.shift();
                player.y[n] = arr.shift();
                n++;
            }
    }
}
function handleBonusPositioning(arr) {
    var happening = arr.shift();
    //var n = arr.length;
    var n = 0;
    switch (happening) {
        case 1:
            speedBonus.x = [];
            speedBonus.y = [];
            while (arr.length > 0) {
                speedBonus.x[n] = arr.shift();
                speedBonus.y[n] = arr.shift();
                n++;
            }
    }
}
function handleGamePlan(arr) {
    var happening = arr.shift();
    //var n = arr.length;
    var n = 0;
    switch (happening) {
        case 1:
            while (arr.length > 0) {
                gameBorders.x[gameBorders.x.length] = arr.shift();
                gameBorders.y[gameBorders.y.length] = arr.shift();
                n++;
            }
    }
}
