var ws = new WebSocket("ws://127.0.0.1:9020/");
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

var CANVAS_WIDTH = 1000;
var CANVAS_HEIGHT = 500;
//var padding = 20;
//var borderThickness = 6;
//var frameColor = "#000000";
var context = document.getElementById('canvasId').getContext("2d");

var bonuses = [];
var plays = [];
var bullets = [];

var instructionsSentPerActor = 7;

var fps = 60;



window.onload = windowReady;

function windowReady() {
    window.addEventListener("keydown", this.check, false);
    createPlayers();
    createBonuses();
    createBullets();
    setInterval(draw, 1000 / fps);
}

ws.onopen = function () {
    //alert("Opened!");
};

ws.onmessage = function (evt) {
    // if (evt.data.constructor.name == "ArrayBuffer") {
    clearOldPositions();
    handleIncommingData(evt);
   // draw();
    //  }
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

function clearOldPositions() {
    plays.forEach(function (pixel) {
        pixel.x = [];
        pixel.y = [];
        pixel.width = [];
        pixel.height = [];
        pixel.rotation = [];
        pixel.shape = [];
    });
    bonuses.forEach(function (pixel) {
        pixel.x = [];
        pixel.y = [];
        pixel.width = [];
        pixel.height = [];
        pixel.rotation = [];
        pixel.shape = [];

    });
    bullets.forEach(function (pixel) {
        pixel.x = [];
        pixel.y = [];
        pixel.width = [];
        pixel.height = [];
        pixel.rotation = [];
        pixel.shape = [];
    });
}
function handleIncommingData(evt) {
    var data = evt.data;
    var view = new DataView(data);
    var dataLength = view.byteLength;
    var actionArrays = [];
    var total = 0;
    var lastSliced = 0;
    while (total * 4 < dataLength) {
        actionArrays[total] = view.getInt32(total * 4);
        // console.log(actionArrays[total - 1]);
        if (actionArrays[actionArrays.length - 1] == -1) {
            if (total > lastSliced) {

                handleSwitcher(actionArrays.slice(lastSliced, total));
                lastSliced = total + 1;
            }
        }
        total++;
    }
}

function pixel(I) {
    I.color = I.col;
    I.x = [];
    I.y = [];
    I.width = [];
    I.height = [];
    I.rotation = [];
    I.shape = [];

    I.draw = function () {
        context.fillStyle = this.color;
        var n = 0;

        while (n < this.x.length) {
            //context.fillRect(this.x[n] * smallestSquareSize + this.offsetX[n] / smallestSquareSize, this.y[n] * smallestSquareSize + this.offsetY[n] / smallestSquareSize, this.width, this.height);
            // context.fillRect(this.x[n], this.y[n], this.width[n], this.height[n]);
            if (this.x[n] >= 0) {
                drawRotatedRect(this.x[n], this.y[n], this.width[n], this.height[n], this.rotation[n] * 30);
                // drawRotatedRect(x,y,width,height,degrees)
                //    console.log("n = " + n);
                //   console.log("this.x[n] = " + this.x[n]);
            }
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
    // console.log("Called");
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    plays.forEach(function (pixel) {
        pixel.draw();
        // console.log("Called again");
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
    
    var actor = arr.shift();
    

    // var happening = -1;
    while (arr.length > 0) {

        var actInstructions = getNextActInstructions(arr);

        switch (actor) {

            case 0:
                handleGamePlan(actInstructions);
                break;
            case 1:
                handlePositioning(actInstructions, plays);
                break;
            case 2:
                console.log("bonus");
                handlePositioning(actInstructions, bonuses);
                break;
            case 3:
                handlePositioning(actInstructions, bullets);
                break;
        }
    }
}
function getNextActInstructions(arr) {
    return arr.splice(0, 7);

}
function handlePositioning(moves, actor) {


    // printArr(moves);


    var mover = moves.shift();

    actor[mover - 1].x[actor[mover - 1].x.length] = moves.shift();
    actor[mover - 1].y[actor[mover - 1].y.length] = moves.shift();
    actor[mover - 1].width[actor[mover - 1].width.length] = moves.shift();
    actor[mover - 1].height[actor[mover - 1].height.length] = moves.shift();
    actor[mover - 1].rotation[actor[mover - 1].rotation.length] = moves.shift();
    actor[mover - 1].shape[actor[mover - 1].shape.length] = moves.shift();
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


function drawRotatedRect(x, y, width, height, degrees) {
    // first save the untranslated/unrotated context
    context.save();

    context.beginPath();
    // move the rotation point to the center of the rect
    //context.translate(x + width / 2, y + height / 2);
    context.translate(x, y);
    // rotate the rect
    context.rotate(degrees * Math.PI / 180);

    // draw the rect on the transformed context
    // Note: after transforming [0,0] is visually [x,y]
    //       so the rect needs to be offset accordingly when drawn
   // context.fillStyle = "gold";
    context.fillRect(-width / 2.0, -height/ 2.0, width, height);

   // context.fill();

    // restore the context to its untranslated/unrotated state
    context.restore();

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




function printArr(array) {
    array.forEach(function (element) {
        console.log(element);
    });
    console.log("done");
}
