var ws = new WebSocket("ws://127.0.0.1:9014/");
ws.binaryType = 'arraybuffer';

var leftCode = 37;
var upCode = 38;
var rightCode = 39;
var downCode = 40;
var spaceCode = 32;
var shootCode = 67;
var pauseCode = 80;

var playerNumber = 1;

var smallestSquareSize = 14;

var CANVAS_WIDTH = 1100;
var CANVAS_HEIGHT = 600;
//var padding = 20;
//var borderThickness = 6;
//var frameColor = "#000000";
var context = document.getElementById('canvasId').getContext("2d");

var bonuses = [];
var plays = [];
var bullets = [];



window.onload = windowReady;

function windowReady() {
    window.addEventListener("keydown", this.check, false);
    createPlayers();
    createBonuses();
    createBullets();
}

ws.onopen = function () {
    //alert("Opened!");
};

ws.onmessage = function (evt) {
    if (evt.data.constructor.name == "ArrayBuffer") {
        var s = evt.data;
        var view = new DataView(s);
        var dataLength = view.byteLength;
        var actionArrays = [];
        var total = 0;
        var lastSliced = 0;
        while (total < dataLength) {
            actionArrays[total] = view.getInt32(total);
            console.log(actionArrays[total - 1]);
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
            sendAction(35);
            break;
        case shootCode:
            sendAction(45);
            break;
        case pauseCode:
            sendAction(25);
            break;
    }
}

function sendAction(actionNumber) {
    var action = playerNumber + "" + actionNumber;
    ws.send(action);
}

function pixel(I) {
    I.color = I.col;
    I.x = [];
    I.y = [];
    I.offsetX = [];
    I.offsetY = [];
    I.width = smallestSquareSize;
    I.height = smallestSquareSize;
    I.draw = function () {
        context.fillStyle = this.color;
        var n = 0;

        while (n < this.x.length) {
            //context.fillRect(this.x[n] * smallestSquareSize + this.offsetX[n] / smallestSquareSize, this.y[n] * smallestSquareSize + this.offsetY[n] / smallestSquareSize, this.width, this.height);
            context.fillRect(this.x[n] * smallestSquareSize, this.y[n] * smallestSquareSize, this.width, this.height);
            n++;
        }
    };
    return I;
}

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
    // player.draw();
    plays.forEach(function (pixel) {
        pixel.draw();
    });
    bonuses.forEach(function (pixel) {
        pixel.draw();
    });
    bullets.forEach(function (pixel) {
        pixel.draw();
    });

   // gameBorders.draw();

}

function handleSwitcher(arr) {
    var happening = -1;
    while (happening == -1 && arr.length > 1) {
        var happening = arr.shift();

    }

    switch (happening) {

        case 0:
            handleGamePlan(arr);
            break;
        case 1:
            handlePositioning(arr, plays);
            break;
        case 2:
            handlePositioning(arr, bonuses);
            break;
        case 3:
            handlePositioning(arr, bullets);
            break;
    }

}
function handlePositioning(moves, actor) {
    var totalNumberOFObjects = moves.shift();
    var moved = 0;
    actor.forEach(function (pixel) {
        pixel.x = [];
        pixel.y = [];
        pixel.offsetX = [];
        pixel.offsetY = [];
    });

    while (moved < totalNumberOFObjects) {
        var mover = moves.shift();
        
        var numberOfHappening = moves.shift();
        
        var n = 0;
        while (n < numberOfHappening) {


            actor[mover - 1].x[actor[mover - 1].x.length] = moves.shift();
            actor[mover - 1].offsetX[actor[mover - 1].offsetX.length] = moves.shift();
            actor[mover - 1].y[actor[mover - 1].y.length] = moves.shift();
            actor[mover - 1].offsetY[actor[mover - 1].offsetY.length] = moves.shift();
            n++;

        }
        moved++;
    }


}


function handleGamePlan(arr) {
/**
    var totalNumberOFObjects = arr.shift();
    //for now
    var totalNumberOFObjects = 165 + 164;

    while (arr.length > 0) {
        console.log("Called");
        var happening = arr.shift();

        var numberOfHappening = arr.shift();
        //For now
        numberOfHappening = 165 + 164;
        var n = 0;
        //var n = arr.length;
        // var n = 0;
        switch (happening) {
            case 1:
                while (n < numberOfHappening) {
                    gameBorders.x[gameBorders.x.length] = arr.shift();
                    var apa = arr.shift();
                    gameBorders.y[gameBorders.y.length] = arr.shift();
                    var bpa = arr.shift();
                    n++;
                }
        }

    }
    **/

}
function createPlayers() {
    plays.push(pixel({col: "#00A"}));
    plays.push(pixel({col: "#AAA"}));
    plays.push(pixel({col: "#123"}));
    plays.push(pixel({col: "#987"}));
}

function createBonuses() {
    bonuses.push(pixel({col: "#F5A"}));
    bonuses.push(pixel({col: "#FFA"}));
    bonuses.push(pixel({col: "#123"}));
    bonuses.push(pixel({col: "#987"}));
    bonuses.push(pixel({col: "#555"}));
    bonuses.push(pixel({col: "#1F7"}));

}
function createBullets() {
    bullets.push(pixel({col: "#3F9"}));
    bullets.push(pixel({col: "#3F9"}));
    bullets.push(pixel({col: "#3F9"}));
    bullets.push(pixel({col: "#3F9"}));
    bullets.push(pixel({col: "#3F9"}));
    bullets.push(pixel({col: "#3F9"}));

}
