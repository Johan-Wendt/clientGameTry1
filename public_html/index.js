var ws = new WebSocket("ws://127.0.0.1:8050/");
ws.binaryType = 'arraybuffer';

ws.onopen = function() {
    alert("Opened!");
    var apa = new Int8Array(2);
   // var view = new DataView(apa);
    apa[0] = 19;
    apa[1] = 87;
    ws.send(123);
};

ws.onmessage = function (evt) {
    if(evt.data.constructor.name == "ArrayBuffer") {
        var s   = evt.data;
        var view   = new DataView(s);
        console.log("Message: " + view.getUint8(0));
    }
};

ws.onclose = function() {
    alert("Closed!");
};

ws.onerror = function(err) {
    alert("Error: " + err);
};

