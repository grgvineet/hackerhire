// Compatibility shim
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
// PeerJS object
var peer = new Peer({host : location.hostname, port : location.port, path : "/peer", debug: 3});
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
// Click handlers setup
$(function () {
    $('#make-call').click(function () {
        // Initiate a call!
        var call = peer.call($('#callto-id').val(), window.localStream);
        step3(call);
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