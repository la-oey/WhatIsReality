

var postResponse = {};
var postQhtml = "";



  ///////////////////////
 // Posttest questions//
///////////////////////

function showQuestions(){
	for(i in postQs){
		let qNum = parseInt(i) + 1;
		postQhtml += "<b style='font-size:18px'>" + qNum + ". </b>";
		switch(postQs[i]["type"]) {
			case "free":
				postQhtml += addFree(postQs[i]);
				break;
		}
		postQhtml += "<br><br><br><br>";
	}
	$("#posttestSurvey").html(postQhtml);
}

function addFree(qi){
	let id = qi["id"];
	let questionHTML = "<label id=" + id + ">" + qi["question"] + "</label><br><br>";
	let responseHTML = "<textarea id=" + id + "Textbox rows='3' cols='60' onkeyup='checkResponses();'></textarea>";
	return(questionHTML + responseHTML);
}

function checkResponses(){
	let filled = [];
	for(i in postQs){
		let id = postQs[i]["id"];
		if($("#"+id+"Textbox").val() == ''){
			filled.push(false);
		} else{
			filled.push(true);
		}
	}
	if(filled.includes(false)){
		$('#continueQs').prop('disabled', true);
	} else{
		$('#continueQs').prop('disabled', false);
	}
}

function submitPosttest(){
	for(i in postQs){
		let id = postQs[i]["id"];
		switch(postQs[i]["type"]) {
			case "free":
				postResponse[id] = $("#"+id+"Textbox").val();
				break; 
		}
	}
	client.posttest = postResponse;
}










