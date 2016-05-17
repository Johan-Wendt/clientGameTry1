var ws = new WebSocket("ws://127.0.0.1:9025/");
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
//esc
var escCode = 27;

var playerNumber = 1;


var CANVAS_WIDTH = 800;
var CANVAS_HEIGHT = 600;
//var padding = 20;
//var borderThickness = 6;
//var frameColor = "#000000";
var context;
//var contextSecondary;

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
var gameRoomselector;
var joinedGameRoom;
var gameRoomBackground;
//var allGameRooms = [];

var gameRunning = false;

var roomContent;
var gameRooms;
var gameBackgound;










window.onload = windowReady;

function windowReady() {
    context = document.getElementById('canvasId').getContext("2d");
    window.addEventListener("keydown", this.check, false);
    roomContent = document.getElementById("joinedGameRoomText");
    gameRooms = document.getElementById("gameRoomInfoText");
    document.getElementById("escMenu").style.display = 'none';

    loadImages();
    createPlayers();
    createBonuses();
    createBullets();
    setInterval(draw, 1000 / fps);
    disableButtons();
    setOnchanges();
    setOnClicks();

    enterName();
}

ws.onopen = function () {
    //alert("Opened!");
};

ws.onmessage = function (evt) {
    handleIncommingData(evt);
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
};
window.onpopstate = function (event) {
    sendAction(92);
    sleep(1000);
};

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
    gameRoomBackground = new Image(200, 400);
    gameRoomBackground.id = "gameRoomBackground";
    gameRoomBackground.src = 'Pictures/Coffee.png';

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
            sendAction(55);
            break;
        case escCode:
            if (gameRunning) {
                var escMenu = document.getElementById("escMenu");
                if (escMenu.style.display == 'inline') {
                    escMenu.style.display = 'none';
                }
                else {
                    escMenu.style.display = 'inline';
                }
            }
            break;
    }
}

function sendAction(actionNumber) {

    var action = playerNumber + "" + actionNumber;
    console.log("action sent =" + action);
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
    if (gameRunning) {
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

}

function handleSwitcher(arr) {

    var type = arr.shift();

    switch (type) {


        case 0:
            playerNumber = arr.shift();
            gameRunning = true;
            setVisibilityMetaDivs('none');
            document.getElementById("mygameRoom").innerHTML = "";
            document.getElementById("canvasId").style.opacity = "1";
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

        case 6:
            quitGame();
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

    var type = instructions.substring(0, 1);
    var cleanInstructions = instructions.substring(1, instructions.length);
    switch (type) {


        case "p":
            var playerDiv = document.getElementById("playerInfo");
            createInfoDiv(playerDiv, "Players", cleanInstructions);

            break;

        case "r":
            var gameRooms = document.getElementById("gameRoomInfoText");
            createInfoDiv(gameRooms, "Game Rooms", cleanInstructions, function () {
                setGameRoomselector(this);
            });
            break;

        case "m":
            createInfoDiv(roomContent, "Joined Room", cleanInstructions);
            break;

        case "n":
            addText(document.getElementById("myName"), "H2", cleanInstructions);
            break;
        case "c":
            if (cleanInstructions == 0) {
                document.getElementById("startGame").disabled = true;
            }
            else {
                var element = document.getElementById("mygameRoom");
                element.innerHTML = cleanInstructions;
            }
            break;

        case "e":
            handleError(cleanInstructions);
            break;
    }
}
function createInfoDiv(div, heading, texts, onClick) {

    div.innerHTML = "";
    addText(div, "H1", heading);
    var infos = texts.split(",");
    var n = 0;
    while (n < infos.length) {

        var info = infos[n];
        if (info.length > 0) {
            addText(div, "P", info, onClick);
        }

        n++;
    }

}
function addText(div, element, text, onClick) {
    var para = document.createElement(element);

    var t = document.createTextNode(text);      // Create a text node
    para.appendChild(t);                                          // Append the text to <p>
    div.appendChild(para);

    para.id = text;
    para.onclick = onClick;
}
function handleError(type) {
    switch (type) {


        case "a":
            window.alert("The game room name is already taken");
            break;
    }
}
function setVisibilityMetaDivs(visibility) {

    // var frontdiv = document.getElementById("test");
    // frontdiv.style.zIndex = "100";


    var divsToHide = document.getElementsByClassName("outerContainer"); //divsToHide is an array
    for (var i = 0; i < divsToHide.length; i++) {
        // divsToHide[i].style.visibility = "hidden"; // or
        divsToHide[i].style.display = visibility; // depending on what you're doing
    }

    var divsToHideToo = document.getElementsByClassName("innerUpperContainer"); //divsToHide is an array
    for (var j = 0; j < divsToHideToo.length; j++) {
        // divsToHide[i].style.visibility = "hidden"; // or
        divsToHideToo[j].style.display = visibility; // depending on what you're doing
    }

    var divsToHideLastly = document.getElementsByClassName("innerLowerContainer"); //divsToHide is an array
    for (var j = 0; j < divsToHideToo.length; j++) {
        // divsToHide[i].style.visibility = "hidden"; // or
        divsToHideLastly[j].style.display = visibility; // depending on what you're doing
    }

}
function setGameRoomselector(gameRoom) {
    document.getElementById("joinRoom").disabled = false;
    if (gameRoomselector) {
        var oldHighlight = document.getElementById(gameRoomselector.id);
        if (oldHighlight) {
            oldHighlight.style.color = 'white';
        }
    }
    gameRoomselector = gameRoom;
    var newHighlight = document.getElementById(gameRoom.id);
    newHighlight.style.color = 'red';
}

function createPlayers() {
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
    sendAction(71 + playerName.trim() + ";");
}
function gamePopup() {
    var humanPlayers = document.getElementById("humanNrOfPlayers").value;
    var computerPlayers = document.getElementById("computerNrOfPlayers").value;
    var gameName = prompt("Name of the game", "New Game");
    sendAction(72 + gameName + "," + humanPlayers + "," + computerPlayers + ";");
}
function joinGameRoom() {

    joinedGameRoom = gameRoomselector;
    document.getElementById("startGame").disabled = false;
    document.getElementById("joinRoom").disabled = true;

    sendAction(73 + joinedGameRoom.id + ";");
}
function gameStart() {

    joinedGameRoom = gameRoomselector;



    sendAction(74 + joinedGameRoom.id + ";");
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}
function disableButtons() {
    document.getElementById("newGame").disabled = true;
    document.getElementById("joinRoom").disabled = true;
    document.getElementById("startGame").disabled = true;
}

function setOnchanges() {
    document.getElementById("humanNrOfPlayers").onchange = function () {
        humanChange();
    };
    document.getElementById("computerNrOfPlayers").onchange = function () {
        computerChange();
    };

}
function humanChange() {

    var human = document.getElementById("humanNrOfPlayers");
    var computer = document.getElementById("computerNrOfPlayers");

    while (parseInt(human.value) + parseInt(computer.value) > 4) {

        computer.value--;

    }
    activateNewGameButton();
}
function computerChange() {
    var human = document.getElementById("humanNrOfPlayers");
    var computer = document.getElementById("computerNrOfPlayers");

    while (parseInt(computer.value) + parseInt(human.value) > 4) {

        human.value--;
    }
    activateNewGameButton();
}
function activateNewGameButton() {
    var human = document.getElementById("humanNrOfPlayers");
    var computer = document.getElementById("computerNrOfPlayers");
    if (parseInt(human.value) && parseInt(computer.value) || parseInt(human.value) && parseInt(computer.value) == 0) {
        document.getElementById("newGame").disabled = false;
    }
}
function mainMenu() {
    setVisibilityMetaDivs('inline');
    document.getElementById("canvasId").style.opacity = "0.4";
}
function quitGame() {
    mainMenu();
    gameRunning = false;
    document.getElementById("escMenu").style.display = 'none';
}

function setOnClicks() {
    document.getElementById("quitGame").onclick = function () {
        sendAction(55);
    };
    document.getElementById("resumeGame").onclick = function () {
        document.getElementById("escMenu").style.display = 'none';
    };
}