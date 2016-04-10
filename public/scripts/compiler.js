var Model = {
	sub_url : null,
	init : function(){
		this.sub_url = window.location.protocol + "//" + window.location.host;
	},
	getSubUrl : function(){
		return this.sub_url;
	}
};

var Controller = {
	langList : {
			"0" : [ "Text" , "text/plain"],
			"1" : [ "C" , "text/x-csrc"] ,
			"2" : [ "C++" , "text/x-c++src"],
			"3" : [ "Java" , "text/x-java"],
			"5" : [ "Python 2" , "text/x-python"],
			"6" : [ "Perl" , "text/x-perl"],
			"7" : [ "PHP" , "text/x-php"],
			"8" : [ "Ruby" , "text/x-ruby"],
			"9" : [ "C#" , "text/x-csharp"],
			"20" : [ "Javascript" , "text/javascript"]
		}, 
	init : function(){
		Model.init();
		View.init();
		this.addListeners();
	},
	runCode : function(endpoint){
		var code = View.getContent();
		var input = View.getInput();
		var lang = View.getLanguage();
		var sub_url = Model.getSubUrl() + '/hackerrank'; 
		var myData = {
		    'source': code,
		    'lang': lang,
		    'testcases': JSON.stringify([input]),
		};
		//console.log(myData);
		
		View.setStatus("Running");
		var str = '\n\n' + View.getOutput();
		View.setOutput(str);
		$.post({
			url : sub_url ,
			dataType: "json",
			data :  JSON.stringify(myData, null, '\t'),
			contentType: 'application/json;charset=UTF-8',
			success: function(data){ Controller.parseResponse(data);} 
		});
	},
	addListeners : function(){

	},
	parseResponse : function(response){
		
		//var data = JSON.parse(response);
		//alert(response);
		response = JSON.parse(response);
		//console.log(response);
		//console.log(response["result"]);
		var compileMssg = response['result']['compilemessage'];
		
		if(compileMssg.length > 0)
		{
			View.setStatus("Compilation error");
			var str = 'Compilation error ' + '\n\n' + View.getOutput();
			View.setOutput(str);
		}
		else
		{
			var statusMssg = response['result']['message'];
			var output = response['result']['stdout'][0];
			var str = output + View.getOutput();
			View.setOutput(str);
			View.setStatus(statusMssg);
			//console.log(statusMssg.length);
			//console.log(output.length);
		}
		alert('compilation finished');
	},
	changeMode : function(){
		var value = View.getLanguage();
		var modetype = this.langList[value][1];
		View.setMode(modetype);
	}
};

var View = {
	myCodeMirror : null,
	init : function(){
		this.myCodeMirror = CodeMirror.fromTextArea(document.getElementById("codeEditor"), {
			lineNumbers: true,
		    matchBrackets: true,
		    styleActiveLine: true,
		    mode : "null",
			theme: "monokai"
		});
	},
	getContent : function(){
		return this.myCodeMirror.getValue();
	},
	getInput : function(){
		return $("#inputbox").val();
	},
	getLanguage  :function(){
		return $("#languageMenu").val();
	},
	getOutput : function(){
		return $("#outputbox").val();
	},
	setContent : function(content){
		$("#codeEditor").val(content);
	},
	setOutput : function(output){
		$("#outputbox").val(output);
	},
	setStatus : function(status){
		$("#statusbox").val(status);
	},
	setMode : function(modetype){
		this.myCodeMirror.setOption("mode" , modetype);
		//CodeMirror.autoLoadMode(this.myCodeMirror , modetype);
		console.log('mode changed to : ' + modetype);
	}
};

