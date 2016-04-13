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

var smallestSquareSize = 10;

var CANVAS_WIDTH = 1100;
var CANVAS_HEIGHT = 500;
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
    createPlayers(2);
    createBonuses();
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


function play(I) {
    I.color = I.col;
    I.x = [];
    I.y = [];
    I.width = smallestSquareSize;
    I.height = smallestSquareSize;
    I.draw = function () {
        context.fillStyle = this.color;
        var n = 0;

        while (n < this.x.length) {
            context.fillRect(this.x[n] * smallestSquareSize, this.y[n] * smallestSquareSize, this.width, this.height);
            n++;
        }
    };
    return I;
}
function bonus(I) {
    I.color = I.col;
    I.x = [];
    I.y = [];
    I.width = smallestSquareSize;
    I.height = smallestSquareSize;
    I.draw = function () {
        context.fillStyle = this.color;
        var n = 0;

        while (n < this.x.length) {
            context.fillRect(this.x[n] * smallestSquareSize, this.y[n] * smallestSquareSize, this.width, this.height);
            n++;
        }
    };
    return I;
}
/**
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
 **/
var bullet = {
    color: "#3F9",
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
function bul(I) {
    I.color = I.col;
    I.x = [];
    I.y = [];
    I.width = smallestSquareSize;
    I.height = smallestSquareSize;
    I.draw = function () {
        context.fillStyle = this.color;
        var n = 0;

        while (n < this.x.length) {
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
    plays.forEach(function (play) {
        play.draw();
    });
    bonuses.forEach(function (bonus) {
        bonus.draw();
    });
    //speedBonus.draw();
    bullet.draw();
    //  bullet.draw();
    gameBorders.draw();

}

function handleSwitcher(arr) {
    var happening = -1;
    while (happening == -1 && arr.length > 1) {
        var happening = arr.shift();

    }
    // console.log(happening);


    switch (happening) {

        case 0:
            handleGamePlan(arr);
            break;
        case 1:
            handlePlayPositioning(arr);
            break;
        case 2:
            handleBonusPositioning(arr);
            break;
        case 3:
            handleProjectilePositioning(arr);
            break;
    }

}

function handlePlayPositioning(arr) {

    var totalNumberOFObjects = arr.shift();
    var moved = 0;

    while (moved < totalNumberOFObjects) {
        var happening = arr.shift();
        var numberOfHappening = arr.shift();
        var n = 0;

        //var n = arr.length;
        switch (happening) {
            case 1:
                plays[0].x = [];
                plays[0].y = [];
                while (n < numberOfHappening) {

                    plays[0].x[plays[0].x.length] = arr.shift();
                    plays[0].y[plays[0].y.length] = arr.shift();
                    n++;
                }
                break;
            case 2:
                plays[1].x = [];
                plays[1].y = [];
                while (n < numberOfHappening) {
                    plays[1].x[plays[1].x.length] = arr.shift();
                    plays[1].y[plays[1].y.length] = arr.shift();
                    n++;
                }
                break;
        }
        moved++;
    }
}
function handleBonusPositioning(arr) {
    var totalNumberOFObjects = arr.shift();
    var moved = 0;
    bonuses.forEach(function (bonus) {
        bonus.x = [];
        bonus.y = [];
    });

    while (moved < totalNumberOFObjects) {
        var happening = arr.shift();
        var numberOfHappening = arr.shift();

        var n = 0;

        //var n = arr.length;
        switch (happening) {
            case 1:
                bonuses[0].x = [];
                bonuses[0].y = [];
                while (n < numberOfHappening) {

                    bonuses[0].x[bonuses[0].x.length] = arr.shift();
                    bonuses[0].y[bonuses[0].y.length] = arr.shift();
                    //  console.log("bonuses bonuses[0].x.length = " + bonuses[0].x[bonuses[0].x.length - 1]);
                    n++;
                }
                break;
            case 2:
                bonuses[1].x = [];
                bonuses[1].y = [];

                while (n < numberOfHappening) {
                    bonuses[1].x[bonuses[1].x.length] = arr.shift();
                    bonuses[1].y[bonuses[1].y.length] = arr.shift();
                    n++;
                }
                break;
            case 3:
                bonuses[2].x = [];
                bonuses[2].y = [];
                while (n < numberOfHappening) {

                    bonuses[2].x[bonuses[2].x.length] = arr.shift();
                    bonuses[2].y[bonuses[2].y.length] = arr.shift();
                    //  console.log("bonuses bonuses[0].x.length = " + bonuses[0].x[bonuses[0].x.length - 1]);
                    n++;
                }
                break;
            case 4:
                bonuses[3].x = [];
                bonuses[3].y = [];

                while (n < numberOfHappening) {
                    bonuses[3].x[bonuses[3].x.length] = arr.shift();
                    bonuses[3].y[bonuses[3].y.length] = arr.shift();
                    n++;
                }
                break;
                case 5:
                bonuses[4].x = [];
                bonuses[4].y = [];

                while (n < numberOfHappening) {
                    bonuses[4].x[bonuses[4].x.length] = arr.shift();
                    bonuses[4].y[bonuses[4].y.length] = arr.shift();
                    n++;
                }
                break;
        }
        moved++;
    }

}
/**
 function handleBonusPositioning(arr) {
 var totalNumberOFDifferentObjects = arr.shift();
 
 
 
 var k = 0;
 
 while (k < totalNumberOFDifferentObjects) {
 var happening = arr.shift();
 var numberOfHappening = arr.shift();
 var n = 0;
 
 switch (happening) {
 case 1:
 speedBonus.x = [];
 speedBonus.y = [];
 while (n < numberOfHappening) {
 
 
 speedBonus.x[n] = arr.shift();
 speedBonus.y[n] = arr.shift();
 n++;
 }
 break;
 default:
 while (n < numberOfHappening) {
 n++;
 }
 }
 k++;
 
 }
 
 }
 **/

function handleProjectilePositioning(arr) {
    var totalNumberOFObjects = arr.shift();

    bullet.x = [];
    bullet.y = [];

    while (arr.length > 0) {
        var happening = arr.shift();
        var numberOfHappening = arr.shift();
        console.log("happening" + happening);
        console.log("numberOfHappening" + numberOfHappening);
        var n = 0;

        switch (happening) {
            case 1:
                while (n < numberOfHappening) {

                    bullet.x[n] = arr.shift();
                    bullet.y[n] = arr.shift();
                    console.log("bullet.x[n]" + bullet.x[n]);
                    console.log("bullet.y[n]" + bullet.y[n]);
                    n++;
                }
        }

    }

}

function handleGamePlan(arr) {

    var totalNumberOFObjects = arr.shift();
    //for now
    var totalNumberOFObjects = 165;

    while (arr.length > 0) {
        console.log("Called");
        var happening = arr.shift();

        var numberOfHappening = arr.shift();
        //For now
        numberOfHappening = 165;
        var n = 0;
        //var n = arr.length;
        // var n = 0;
        switch (happening) {
            case 1:
                while (n < numberOfHappening) {
                    gameBorders.x[gameBorders.x.length] = arr.shift();
                    gameBorders.y[gameBorders.y.length] = arr.shift();
                    console.log(gameBorders.x[gameBorders.x.length - 1]);
                    n++;
                }
        }

    }

}
function createPlayers(n) {
    switch (n) {
        case 2:
            plays.unshift(play({col: "#00A"}));
        case 1:
            plays.unshift(play({col: "#AAA"}));
    }
}

function createBonuses() {
    bonuses.push(bonus({col: "#F5A"}));
    bonuses.push(bonus({col: "#FFA"}));
    bonuses.push(bonus({col: "#123"}));
    bonuses.push(bonus({col: "#987"}));
    bonuses.push(bonus({col: "#555"}));

}
