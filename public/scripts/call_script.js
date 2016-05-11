// Compatibility shim
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
// PeerJS object

var peer , MyId = null , flagCaller = false;
var dataConnection;
var rec_dataArray = '' , flag = 0;
var movesArray = [];

function initPeer(){
  peer = new Peer({host : location.hostname, port : location.port, path : "/peer", debug: 3});

  peer.on('open', function () {
      $('#my-id').text(peer.id);
      console.log("My id : " + peer.id);
      MyId = peer.id;
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
      //console.log("File id:" + fileId);
      //console.log("Sending api id");
      //loadDocument(fileId);
  });

  $('#make-call').click(function(){
      
      callPeer($('#callto-id').val());
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
}



function callPeer(peer1){
    // Initiate a call!
    var call = peer.call(peer1 , window.localStream);
    console.log("Call : ");
    console.log(call);
    step3(call);
    console.log("peer id : " + peer1);
    dataConnection = peer.connect(peer1);
    connectionChanges(peer1);
    flagCaller = true;
    loadDocument(fileId);
    // peer1 is same as call.peer
}

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
    connectToPeer();
}

function step3(call) {
    console.log("Call : " + call);
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
                               channelData("chat" , msg);
                               addMessage("You" , msg);
                          }});
    console.log("chatBox created");
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
        //console.log("\n\n" + data["type"]);
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
                addMessage("Peer" , data["mssg"]); 
                break; 
            case "clear": 
                clearCanvas();  
                break;
            case "realtimeApi" :
                console.log("\n\nFile id received");
                console.log(data["mssg"]);
                loadDocument(data["mssg"]);
                break;
            default: 
                break; 
        }
    }

}

function channelData(type , text){
    var data={};
    data["type"] = type;
    data["mssg"] = text;
    var myaray = [];
    myaray.push(JSON.stringify(data));
    sendData(myaray); 
}


//// initialise canvas
// Create the canvas (Neccessary for IE because it doesn't know what a canvas element is)
var canvasWidth = 200 , canvasHeight = 100 , canvasDiv , canvas , context;

function initCanvas(){
    //console.log("CALLEDHERE:"+$('#mid-col').width());
    canvasDiv = document.getElementById('canvasDiv');
    canvas = document.createElement('canvas');

    canvasWidth = $('#mid-col').width();
    canvasHeight = $('#mid-col').height();

    canvas.setAttribute('width', $('#mid-col').width());
    canvas.setAttribute('height', canvasHeight);
    canvas.setAttribute('id', 'canvas');
    //console.log("YO");
    // canvas.setAttribute('box-sizing','border-box');
    // canvas.setAttribute('style' , 'border:5px solid #fff;');
    canvasDiv.appendChild(canvas);
    if(typeof G_vmlCanvasManager != 'undefined') {
       canvas = G_vmlCanvasManager.initElement(canvas);
    }
    context = canvas.getContext("2d"); 

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
       //console.log(JSON.stringify(data));
       clearCanvas();
       sendData(myaray); 
    });

    $('#setModeDraw').click(function(){
       mode = 'draw';
    });

    $('#setModeErase').click(function(){
       mode = 'erase';
    });
}

// Grab the 2d canvas context
// Note: The above code is a workaround for IE 8 and lower. Otherwise we could have used:
//     context = document.getElementById('canvas').getContext("2d");
//print("leaving view");
var downflag = null , prevx = null, prevy = null, erasewidth = 15 , eraseheight = 30 , mode = 'draw';
   
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
         //console.log(JSON.stringify(data));
         drawLine(prevx , prevy , xnew , ynew);
      }
      else if(mode.localeCompare('erase') == 0){
         //console.log('yup');
         var data = {};
         data["type"] = "erase";
         data["coord"] = [xnew , ynew ];
         movesArray.push(JSON.stringify(data));
         //console.log(JSON.stringify(data));
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


var clientId = '542212596111-2h05ammmko43pgtvhq974ivucp5vokt7.apps.googleusercontent.com';
var realtimeUtils , fileId = null , connected = false;

function initRealTimeApi(){
    // Create a new instance of the realtime utility with your client ID.
    realtimeUtils = new utils.RealtimeUtils({ clientId: clientId });
    //console.log("here : " + clientId);
    authorize();
}

function authorize() {
    // Attempt to authorize
    realtimeUtils.authorize(function(response){
        if(response.error){
            // Authorization failed because this is the first time the user has used your application,
            // show the authorize button to prompt them to authorize manually.
            //console.log("start1");
            realtimeUtils.authorize( function(response){  start();  } , true );
        } 
        else {
            start();
        }
    }, false);
}
/*
function setFileId(id){
    console.log("id:" + id);
    fileId = id;
}

function checkId(){
    console.log("Fileid: " + fileId);
}

*/

function start() {
    if (fileId == null) {
        var x = null;
        realtimeUtils.createRealtimeFile('New Quickstart File ' + MyId , function(createResponse) {
            fileId = createResponse.id;
            insertPermission(createResponse.id);
            //console.log(createResponse.id);
            //setFileId(createResponse.id);
            //checkId();
        });
    } 
    //checkId();
}



/**
* Insert a new permission.
*
* @param {String} fileId ID of the file to insert permission for.
* @param {String} value User or group e-mail address, domain name or
*                       {@code null} "default" type.
* @param {String} type The value "user", "group", "domain" or "default".
* @param {String} role The value "owner", "writer" or "reader".
*/
function insertPermission(fileId) {
    var body = {
      'type': "anyone",
      'role': "writer"
    };
    var request = gapi.client.drive.permissions.insert({
      'fileId': fileId,
      'resource': body
    });
    request.execute(function(resp) { 
      console.log('File made public!'); 
      console.log(resp);
      console.log("File id: " + fileId);
      initPeer();
    });
}

function loadDocument(id){
    console.log("initiating document loading process , keep patience ");
    if(connected == false){
        console.log(id);
        realtimeUtils.load(id , onFileLoaded , onFileInitialize);
        connected = true;
    }
    else{
        console.log("Already connected , reload page for new connection");
    }
}

// The first time a file is opened, it must be initialized with the
// document structure. This function will add a collaborative string
// to our model at the root.
function onFileInitialize(model) {
    var string = model.createString();
    string.setText('Welcome to HackerHire!');
    model.getRoot().set('demo_string', string);

    if(flagCaller){
      console.log("Sending api id");
      channelData("realtimeApi" , fileId);
    }
}

// After a file has been initialized and loaded, we can access the
// document. We will wire up the data model to the UI.

function onFileLoaded(doc) {
    var collaborativeString = doc.getModel().getRoot().get('demo_string');
    wireTextBoxes(collaborativeString);
}

// Connects the text boxes to the collaborative string
function wireTextBoxes(collaborativeString) {
    //var textArea = document.getElementById('secondarea');
    //var area2 = document.getElementById('inputbox');
    //gapi.drive.realtime.databinding.bindString(collaborativeString, textArea);
    //gapi.drive.realtime.databinding.bindString(collaborativeString, area2);

    var ignore_change;

    compilerView.myCodeMirror.setValue(collaborativeString.getText());

    ignore_change = false;
    compilerView.myCodeMirror.on('beforeChange', function(editor , changeObj) {

      var from, text, to;
      if (ignore_change) {
        return;
      }

      from = editor.indexFromPos(changeObj.from);
      to = editor.indexFromPos(changeObj.to);
      text = changeObj.text.join('\n');

      if (to - from > 0) {

        //console.log("markdown.removeRange(" + from + ", " + to + ")");
        collaborativeString.removeRange(from, to);

      }
      if (text.length > 0) {

        //console.log("markdown.insertString(" + from + ", '" + text + "')");
        return collaborativeString.insertString(from, text);
        
      }
    });

    collaborativeString.addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, function(e) {

      var from;
      if (e.isLocal) {
        return;
      }
      from = compilerView.myCodeMirror.posFromIndex(e.index);
      ignore_change = true;
      //console.log("editor.replaceRange('" + e.text + "', " + (pos2str(from)) + ", " + (pos2str(from)) + ")");
      compilerView.myCodeMirror.replaceRange(e.text, from, from);
      return ignore_change = false;

    });

    collaborativeString.addEventListener(gapi.drive.realtime.EventType.TEXT_DELETED, function(e) {

      var from, to;
      if (e.isLocal) {
        return;
      }
      from = compilerView.myCodeMirror.posFromIndex(e.index);
      to = compilerView.myCodeMirror.posFromIndex(e.index + e.text.length);
      ignore_change = true;
      //console.log("editor.replaceRange('', " + (pos2str(from)) + ", " + (pos2str(to)) + ")");
      compilerView.myCodeMirror.replaceRange("", from, to);
      return ignore_change = false;

    });

    console.log("All set for collaboration ! :)");

}


function connectToPeer(){

    var url = window.location.href;
    console.log(url);
    var id = url.split('?id=')[1];
    console.log(id);
    console.log("look here : " + id);
    if(id === undefined){

    }
    else{
        console.log("connecting to peer : " + id);
        callPeer(id);
    }
}
