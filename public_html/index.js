var ws = new WebSocket("ws://127.0.0.1:9024/");
ws.binaryType = 'arraybuffer';

var leftCode = 37;
var upCode = 38;
var rightCode = 39;
var downCode = 40;
var spaceCode = 32;
var shootCode = 67;
//p
var pauseCode = 80;
//j
var joinCode = 74;
//n
var createCode = 78;


//w
var messageCode = 87;

var playerNumber = 1;


var CANVAS_WIDTH = 1000;
var CANVAS_HEIGHT = 500;
//var padding = 20;
//var borderThickness = 6;
//var frameColor = "#000000";
var context;

var bonuses = [];
var plays = [];
var bullets = [];

var instructionsSentPerActor = 7;

var fps = 60;

var pistolBonus;
var shotgunBonus;
var player1;
var player2;
var fastBonus;
var growBonus;
var bullet;

var playerName;



window.onload = windowReady;

function windowReady() {
    context = document.getElementById('canvasId').getContext("2d");
    window.addEventListener("keydown", this.check, false);
    loadImages();
    createPlayers();
    createBonuses();
    createBullets();
    setInterval(draw, 1000 / fps);

    enterName();
}

ws.onopen = function () {
    //alert("Opened!");
};

ws.onmessage = function (evt) {
    // if (evt.data.constructor.name == "ArrayBuffer") {
    // clearOldPositions();
    handleIncommingData(evt);
    // draw();
    //  }
};

ws.onclose = function () {
    sendAction(92);

};

ws.onerror = function (err) {
    alert("Error: " + err);
};
window.onbeforeunload = function () {
    sendAction(92);
    sleep(1000);
}

function loadImages() {
    bullet = new Image(20, 9);
    bullet.src = 'Pictures/AppleSeed.png';
    growBonus = new Image(44, 59);
    growBonus.src = 'Pictures/Mushroom.png';
    fastBonus = new Image(46, 53);
    fastBonus.src = 'Pictures/Coffee.png';
    pistolBonus = new Image(40, 51);
    pistolBonus.src = 'Pictures/Apple.png';
    shotgunBonus = new Image(60, 33);
    shotgunBonus.src = 'Pictures/Watermelon.png';
    player1 = new Image(18, 23);
    player1.src = 'Pictures/Player1.png';
    player2 = new Image(18, 23);
    player2.src = 'Pictures/Player2.png';
}

function check(e) {
    var code = e.keyCode;

    // 1 = turn (1 = up, 2 = right, 3 = down, 4 = right) 
    // 7 = text (1 = Name, 
    // 9 = Join game (2:nd 


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
        case pauseCode:
            sendAction(25);
            break;
        case spaceCode:
            sendAction(35);
            break;
        case shootCode:
            sendAction(45);
            break;

        case joinCode:
            sendAction(91);
            break;
        case createCode:
            sendAction(81);
            break;
    }
}

function sendAction(actionNumber) {

    var action = playerNumber + "" + actionNumber;
    ws.send(action);
}
function clearOldPositions(actor) {
    actor.forEach(function (pixel) {
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

    if (data instanceof ArrayBuffer) {
        var view = new DataView(data);

        var dataLength = view.byteLength;
        var actionArrays = [];
        var total = 0;
        var lastSliced = 0;
        while (total * 4 < dataLength) {
            actionArrays[total] = view.getInt32(total * 4);
            if (actionArrays[actionArrays.length - 1] == -1) {
                if (total > lastSliced) {

                    handleSwitcher(actionArrays.slice(lastSliced, total));
                    lastSliced = total + 1;
                }
            }
            total++;
        }
    }
    else {
        handleGameMetaInfo(data);
    }
}

function pixel(I) {
    //   I.color = I.col;
    I.image = I.image;
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
            if (this.x[n] >= 0) {
                drawRotatedRect(this.image, this.x[n], this.y[n], this.image.width, this.image.height, this.rotation[n] * 30);

            }
            n++;

        }
    };
    return I;
}

function drawRotatedRect(image, x, y, width, height, degrees) {
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
    // context.fillRect(-width / 2.0, -height / 2.0, width, height);
    context.drawImage(image, -width / 2.0, -height / 2.0, width, height);

    // context.fill();

    // restore the context to its untranslated/unrotated state
    context.restore();

}



function draw() {
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    plays.forEach(function (pixel) {
        pixel.draw();
    });
    bonuses.forEach(function (pixel) {
        pixel.draw();
    });
    bullets.forEach(function (pixel) {
        pixel.draw();
    });

}

function handleSwitcher(arr) {

    var type = arr.shift();

    switch (type) {


        case 0:
            playerNumber = arr.shift();
            break;
        case 1:
            clearOldPositions(plays);
            handlePositioning(arr, plays);
            break;
        case 2:
            clearOldPositions(bonuses);
            handlePositioning(arr, bonuses);
            break;
        case 3:
            clearOldPositions(bullets);
            handlePositioning(arr, bullets);
            break;
        case 4:
            handleWeaponInfo(arr);
            break;
        case 5:
            handleGameMetaInfo(arr);
            break;
    }
    //}
}
function getNextActInstructions(arr) {
    return arr.splice(0, 7);

}
function handlePositioning(moves, type) {

    // printArr(moves);
    while (moves.length > 6) {

        // printArr(moves);
        var subType = moves.shift();

        type[subType - 1].x[type[subType - 1].x.length] = moves.shift();
        type[subType - 1].y[type[subType - 1].y.length] = moves.shift();
        type[subType - 1].width[type[subType - 1].width.length] = moves.shift();
        type[subType - 1].height[type[subType - 1].height.length] = moves.shift();
        type[subType - 1].rotation[type[subType - 1].rotation.length] = moves.shift();
        type[subType - 1].shape[type[subType - 1].shape.length] = moves.shift();
    }
}

function handleWeaponInfo(instructions) {
    // printArr(instructions);
    while (instructions.length > 2) {
        var thePlayer = instructions.shift();
        var theWeapon = instructions.shift();
        var theAmmo = instructions.shift();

        if (thePlayer == playerNumber) {
            var weapon = getWeaponName(theWeapon);
            //setWeaponInfo(theWeapon, theAmmo);
            var theDiv = document.getElementById("weaponInfo");
            // var content = document.createTextNode("WEAPON\n" + theAmmo);
            theDiv.innerHTML = weapon + "<br>" + theAmmo;
        }


    }
}
function handleGameMetaInfo(instructions) {


    var type = instructions.substring(0,1);
    console.log(type);
    switch (type) {


        case "p":
            //  playerNumber = arr.shift();
            console.log(instructions);
            //setWeaponInfo(theWeapon, theAmmo);
         //   var playerDiv = document.getElementById("playerInfo");
          //  playerDiv.innerHTML = "dd";
            // var content = document.createTextNode("WEAPON\n" + theAmmo);
            //if(playerDiv) {
            var playerDiv = document.getElementById("playerInfo");
            playerDiv.innerHTML = "<br>" + instructions.substring(1,instructions.length) + "<br>";
    //    }
            break;
    }
}

function createPlayers() {
    pistolBonus
    plays.push(pixel({image: player1}));
    plays.push(pixel({image: player2}));
    plays.push(pixel({image: player1}));
    plays.push(pixel({image: player1}));
}

function createBonuses() {
    bonuses.push(pixel({image: growBonus}));
    bonuses.push(pixel({image: fastBonus}));
    bonuses.push(pixel({image: pistolBonus}));
    bonuses.push(pixel({image: shotgunBonus}));
    bonuses.push(pixel({image: shotgunBonus}));
    bonuses.push(pixel({image: shotgunBonus}));

}
function createBullets() {
    bullets.push(pixel({image: bullet}));
    bullets.push(pixel({image: bullet}));
    bullets.push(pixel({image: bullet}));
    bullets.push(pixel({image: shotgunBonus}));
    bullets.push(pixel({image: shotgunBonus}));
    bullets.push(pixel({image: shotgunBonus}));

}
function getWeaponName(weaponInt) {
    switch (weaponInt) {
        case 1:
            return "Knife";
        case 2:
            return "Mine";
        case 3:
            return "Pistol";
        case 4:
            return "Shotgun";
    }
}



function printArr(array) {
    array.forEach(function (element) {
        console.log(element);
    });
    console.log("done printing array");
}

function enterName() {
    var playerName = prompt("Please enter your name", "New Player");
    sendAction(71 + playerName);


}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}
