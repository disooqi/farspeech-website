// Global UI elements:
//  - log: event log
//  - trans: transcription window

// Global objects:
//  - tt: simple structure for managing the list of hypotheses
//  - dictate: dictate object with control methods 'init', 'startListening', ...
//       and event callbacks onResults, onError, ...
var tt = new Transcription();

var dictate = new Dictate({
		//server : "wss://bark.phon.ioc.ee:8443/dev/duplex-speech-api/ws/speech",
		//serverStatus : "wss://bark.phon.ioc.ee:8443/dev/duplex-speech-api/ws/status",
		server : "ws://45.55.56.40:8888/client/ws/speech",
		serverStatus : "ws://45.55.56.40:8888/client/ws/status",
    	referenceHandler: 'http://45.55.56.40:8888/dev/duplex-speech-api/dynamic/reference',
		// recorderWorkerPath : '../lib/recorderWorker.js',
		recorderWorkerPath : 'dictatejs/lib/recorderWorker.js',
		onReadyForSpeech : function() {
			__message("READY FOR SPEECH");
			__status("Kuulan ja transkribeerin...");
		},
		onEndOfSpeech : function() {
			__message("END OF SPEECH");
			__status("Transkribeerin...");
		},
		onEndOfSession : function() {
			__message("END OF SESSION");
			__status("");
		},
		onServerStatus : function(json) {
			__serverStatus(json.num_workers_available + ':' + json.num_requests_processed);
			if (json.num_workers_available == 0) {
				$("#buttonStart").prop("disabled", true);
				$("#serverStatusBar").addClass("highlight");
			} else {
				$("#buttonStart").prop("disabled", false);
				$("#serverStatusBar").removeClass("highlight");
			}
		},
		onPartialResults : function(hypos) {
			// TODO: demo the case where there are more hypos
			tt.add(hypos[0].transcript, false);
			__updateTranscript(tt.toString());
		},
		onResults : function(hypos) {
			// TODO: demo the case where there are more results
			tt.add(hypos[0].transcript, true);
			__updateTranscript(tt.toString());
			// diff() is defined only in diff.html
			if (typeof(diff) == "function") {
				diff();
			}
		},
		onError : function(code, data) {
			__error(code, data);
			__status("Viga: " + code);
			dictate.cancel();
		},
		onEvent : function(code, data) {
			__message(code, data);
		}
	});

// Private methods (called from the callbacks)
function __message(code, data) {
	log.innerHTML = "msg: " + code + ": " + (data || '') + "\n" + log.innerHTML;
}

function __error(code, data) {
	log.innerHTML = "ERR: " + code + ": " + (data || '') + "\n" + log.innerHTML;
}

function __status(msg) {
	statusBar.innerHTML = msg;
}

function __serverStatus(msg) {
	serverStatusBar.innerHTML = msg;
}

function __updateTranscript(text) {
	// $("#trans").val(text);
	$("#trans").text(text);
	// $("#seg").val(text);




    var segmenter = $.post('https://farasa-api.qcri.org/msa/webapi/segmenter', {text: text})
        .done(function (data) {
            //alert(data.output);
            $("#seg").empty().append(data.segtext.join(" "));
        })
        .fail(function () {
            console.log("segmenter error");
        });


    var ner = $.post('http://qatsdemo.cloudapp.net/farasa/requestExecuter.php', {
        query:text, task:5})
        .done(function (data) {
            // alert(data);
            $("#ner").empty().append(data);
        })
        .fail(function () {
            console.log("NER error");
        });

    //     var xhttp = new XMLHttpRequest();
    // 	//xhttp.withCredentials = true;
    //     xhttp.onreadystatechange = function() {
    //         if (this.readyState == 4 ) {
    //             document.getElementById("ner").innerHTML = this.responseText;
    //         }
    //     };
    //     xhttp.open("POST", "http://qatsdemo.cloudapp.net/farasa/requestExecuter.php", true);
    //     xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	//
	//
    // var data = "query=%D9%85%D8%AD%D9%85%D8%AF%20%D9%81%D9%8A%20%D9%82%D8%B7%D8%B1&task=5";
    //     xhttp.send(data);

// # payload_ner = urlencode({'query': pg, 'task':5})
// # conn_ner.request("POST", "/farasa/requestExecuter.php", payload_ner, headers_ner)
// # response_ner = conn_ner.getresponse()
// # data_ner = response_ner.read().decode("utf-8")
// # data_ner = data_ner.replace('<p class="form-control-static" style="direction:rtl;font-size: 25px;">','').replace('</p>', '')
// # ner_pgs.append(data_ner)
}

// Public methods (called from the GUI)
function toggleLog() {
	$(log).toggle();
}
function clearLog() {
	log.innerHTML = "";
}

function clearTranscription() {
	tt = new Transcription();
	$("#trans").val("");
}

function startListening() {
	dictate.startListening();
}

function stopListening() {
	dictate.stopListening();
}

function cancel() {
	dictate.cancel();
}

function init() {
	dictate.init();
}

function showConfig() {
	var pp = JSON.stringify(dictate.getConfig(), undefined, 2);
	log.innerHTML = pp + "\n" + log.innerHTML;
	$(log).show();
}

window.onload = function() {
	init();
};
