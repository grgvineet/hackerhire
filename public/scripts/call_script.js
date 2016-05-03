// Compatibility shim
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
// PeerJS object
var peer = new Peer({host : location.hostname, port : location.port, path : "/peer", debug: 3});
var dataConnection;
var rec_dataArray = '' , flag = 0;
var movesArray = [];


peer.on('open', function () {
    $('#my-id').text(peer.id);
});

// Receiving a call
peer.on('call', function (call) {
    // Answer the call automatically (instead of prompting user) for demo purposes
    call.answer(window.localStream);
    step3(call);
});

peer.on('error', function (err) {
    alert(err.message);
    // Return to step 2 if error occurs
    step2();
});

peer.on('connection', function(conn) {
    console.log("Data channel connection has been setup " + conn);
    dataConnection = conn;
    connectionChanges(conn.peer);
});

// Click handlers setup
$(function () {
    $('#make-call').click(function () {
        // Initiate a call!
        var call = peer.call($('#callto-id').val(), window.localStream);
        dataConnection = peer.connect($('#callto-id').val());
        step3(call);
        connectionChanges();

    });
    $('#end-call').click(function () {
        window.existingCall.close();
        step2();
    });
    // Retry if getUserMedia fails
    $('#step1-retry').click(function () {
        $('#step1-error').hide();
        step1();
    });
    // Get things started
    step1();

});

function step1() {
    // Get audio/video stream
    navigator.getUserMedia({audio: true, video: true}, function (stream) {
        // Set your video displays
        $('#my-video').prop('src', URL.createObjectURL(stream));
        window.localStream = stream;
        step2();
    }, function () {
        $('#step1-error').show();
    });
    // console.log($('#their-video').height());
    // console.log($('#video-container').css("height")});
    $('#steps').css({"margin-top":$('#their-video').height()});
}
function step2() {
    console.log($('#video-container').height());
    $('#step1, #step3').hide();
    $('#step2').show();
    console.log($('#video-container').height());
}
function step3(call) {
    console.log($('#video-container').height());
    // Hang up on an existing call if present
    if (window.existingCall) {
        window.existingCall.close();
    }
    console.log($('#video-container').height());

    // Wait for stream on the call, then set peer video display
    call.on('stream', function (stream) {
        $('#their-video').prop('src', URL.createObjectURL(stream));
    });
    // UI stuff
    window.existingCall = call;
    $('#their-id').text(call.peer);
    call.on('close', step2);
    $('#step1, #step2').hide();
    $('#step3').show();
    console.log($('#video-container').height());

}


function connectionChanges(id){

    dataConnection.on('open', function() {
        // Receive messages
        dataConnection.on('data', function(data) {
            // Received data
            handleData(data);
        });
    });

    createChatBox();
}  

function createChatBox(){
    // to create
    $("#chat_div").chatbox({id : "chat_div",
                          title : "Message Chat",
                          user : "can be anything" ,
                          offset: 0 ,
                          width: 300 ,
                          messageSent: function(id, user, msg){
                               //alert("DOM " + id + " just typed in " + msg);
                               chat(msg);
                               addMessage("You" , msg);
                          }});
}

function addMessage(from,msg){
    // to insert a message
    $("#chat_div").chatbox("option", "boxManager").addMsg(from,msg);
} 


function sendData(arr){
    var data = arr.toString();
    dataConnection.send(data);
}

function handleData(mssg){

    mssg = '[' + mssg + ']';
    //console.log(mssg);
    var data_collection = eval('(' + mssg + ')');

    var arrayLength = data_collection.length;
    //console.log("Received : " + data_collection);
    //console.log("array length : " + arrayLength);

    for (var i = 0; i < arrayLength; i++) {
        //data = JSON.parse(data_collection[i]);
        var data = data_collection[i];
        //console.log(data["type"]);
        //console.log(typeof data);

        switch(data["type"]) { 
            case "draw":
                drawLine(data["coord"][0] , data["coord"][1] , data["coord"][2] , data["coord"][3]); 
                break; 
                //when somebody wants to call us 
            case "erase": 
                clearArea(data["coord"][0] , data["coord"][1]);
                break; 

            case "chat": 
                //chatArea.innerHTML += "Peer : " + data["mssg"] + "<br />"; 
                addMessage("Peer" , data["mssg"]); 
                break; 
            case "clear": 
                clearCanvas();  
                break; 
            default: 
                break; 
        }
    }

}

function chat(text){
    
    var data={};
    data["type"] = "chat";
    data["mssg"] = text;
    var myaray = [];
    myaray.push(JSON.stringify(data));
    //console.log(JSON.stringify(data));
    //console.log(myaray.toString());
    sendData(myaray); 
}



//// initialise canvas
// Create the canvas (Neccessary for IE because it doesn't know what a canvas element is)
/*
var canvasWidth = 590 , canvasHeight = 320;
var canvasDiv = document.getElementById('canvasDiv');
var canvas = document.createElement('canvas');

canvas.setAttribute('width', canvasWidth);
canvas.setAttribute('height', canvasHeight);
canvas.setAttribute('id', 'canvas');
canvas.setAttribute('style' , 'border:1px solid #000000;');
canvasDiv.appendChild(canvas);

if(typeof G_vmlCanvasManager != 'undefined') {
   canvas = G_vmlCanvasManager.initElement(canvas);
}
var context = canvas.getContext("2d"); 
// Grab the 2d canvas context
// Note: The above code is a workaround for IE 8 and lower. Otherwise we could have used:
//     context = document.getElementById('canvas').getContext("2d");
//print("leaving view");
var downflag = null , prevx = null, prevy = null, erasewidth = 15 , eraseheight = 30 , mode = 'draw';

$('#canvas').mousedown(function(e){
   mouseDown(e.pageX - $('#canvasDiv').offset().left , e.pageY - $('#canvasDiv').offset().top);
});

$('#canvas').mousemove(function(e){
   mouseMove(e.pageX - $('#canvasDiv').offset().left , e.pageY - $('#canvasDiv').offset().top);   
});

$('#canvas').mouseup(function(e){
   mouseMove(e.pageX - $('#canvasDiv').offset().left , e.pageY - $('#canvasDiv').offset().top);
   downflag = false;
   sendData(movesArray.toString());
   movesArray = [];
});

$('#canvas').mouseleave(function(e){
   mouseMove(e.pageX - $('#canvasDiv').offset().left , e.pageY - $('#canvasDiv').offset().top);
   if (downflag)
   {
      sendData(movesArray.toString());
      movesArray = [];
   }
   downflag = false;
});

$('#canvas').mouseenter(function(e){
   prevx = e.pageX - $('#canvasDiv').offset().left;
   prevy = e.pageY - $('#canvasDiv').offset().top;
});

$('#clearBoard').click(function(){
   var data = {};
   data["type"] = "clear";
   var myaray = [];
   myaray.push(JSON.stringify(data));
   console.log(JSON.stringify(data));
   clearCanvas();
   sendData(myaray); 
});

$('#setModeDraw').click(function(){
   mode = 'draw';
});

$('#setModeErase').click(function(){
   mode = 'erase';
});
   
function mouseDown(xnew , ynew){
   prevx = xnew;
   prevy = ynew;
   downflag = true;
}

function mouseMove(xnew , ynew){
   if(downflag){
      //console.log(Model.getMode());
      if(mode.localeCompare('draw') == 0){
         var data = {};
         data["type"] = "draw";
         data["coord"] = [prevx , prevy , xnew , ynew ];
         movesArray.push(JSON.stringify(data));
         console.log(JSON.stringify(data));
         drawLine(prevx , prevy , xnew , ynew);
      }
      else if(mode.localeCompare('erase') == 0){
         //console.log('yup');
         var data = {};
         data["type"] = "erase";
         data["coord"] = [xnew , ynew ];
         movesArray.push(JSON.stringify(data));
         console.log(JSON.stringify(data));
         clearArea(xnew,ynew);
      }
      
   }
   prevx = xnew;
   prevy = ynew;
}

function drawLine(prevx , prevy , newx , newy){
   context.beginPath();
   context.moveTo(prevx , prevy);
   context.lineTo(newx , newy);
   context.stroke();
}

function clearRectangle( xlow , ylow , wd , hd){
   if(xlow < 0) xlow = 0;
   if(ylow < 0) ylow = 0;
   //console.log(xlow + "_" + ylow);
   context.clearRect(xlow,ylow,wd,hd);
}

function clearCanvas(){
   context.clearRect(0, 0, canvasWidth, canvasHeight);
}

function clearArea(x,y){
   var hd = eraseheight;
   var wd = erasewidth;
   var xlow = x-wd;
   var ylow = y-hd;
   wd = wd*2+1;
   hd = hd*2+1;
   //console.log(x + " _ " + y);
   clearRectangle(xlow,ylow,wd,hd);
}

*/


