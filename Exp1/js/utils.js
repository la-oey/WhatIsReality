var innerRedCt, innerBlueCt, innerMarbleArray, outerRedCt, outerBlueCt, outerMarbleArray;

function fillUrn(receiver=false) {
    let padding = 10;
    let marblesAcross = 10;
    let marblesDown = 10;

    if(!receiver){
        trial.marbles.drawn.red = getK(expt.marblesSampled, expt.probRed, Math.random());
        var urnRed = trial.marbles.drawn.red;
        trial.marbles.drawn.blue = expt.marblesSampled - urnRed;
        var urnBlue = trial.marbles.drawn.blue;
        trial.marbles.reported.red = trial.marbles.drawn.red;
        trial.marbles.reported.blue = trial.marbles.drawn.blue;
        var interact = true;
    } else{
        computerDraw();
        var urnRed = trial.marbles.reported.red;
        var urnBlue = trial.marbles.reported.blue;
        var interact = false;
    }

    let minUrnWidth = .05*$('#urn').width();
    let maxUrnWidth = .95*$('#urn').width();
    let minUrnHeight = .05*$('#urn').height();
    let maxUrnHeight = .95*$('#urn').height();

    let spaceWidth = (maxUrnWidth - minUrnWidth)/marblesAcross;
    let spaceHeight = (maxUrnHeight - minUrnHeight)/marblesDown;

    let marbleArray = shuffle([].concat(... new Array(urnRed).fill("red"), ... new Array(urnBlue).fill("blue")));

    for(let i=0; i<expt.marblesSampled; i++){
        let gridX = (i % marblesAcross) * spaceWidth + minUrnWidth;
        let gridY = Math.floor(i / marblesAcross) * spaceHeight + minUrnHeight;
        let locX = randomDouble(gridX+padding, gridX + spaceWidth-padding);
        let locY = randomDouble(gridY+padding, gridY + spaceHeight-padding);

        let rowNum = Math.floor(i / marblesAcross);
        let colNum =  (i % marblesAcross)
        let color = marbleArray.shift();
        marble("#urnsvg", color, 17.5, locX, locY, i, interact);
        trial.marbles.drawn.array.push(color);
        trial.marbles.reported.array.push(color);
    }
}

function marble(container, color, size, locX, locY, idx, clickable){
    d3.select(container)
      .append("circle")
      .attr("cx",locX)
      .attr("cy",locY)
      .attr("r",size)
      .attr("stroke-width",2)
      .attr("stroke","black")
      .style("fill",color)
      .on("click", function(event) {
        if (!clickable) return;
        currentColor = d3.select(this).style("fill")
        newColor = "";
        if (currentColor === "red") {
          newColor = "blue";
          trial.marbles.reported.red -= 1;
          trial.marbles.reported.blue += 1;
        } else {
          newColor = "red";
          trial.marbles.reported.red += 1;
          trial.marbles.reported.blue -= 1;
        }
        d3.select(this).style("fill", newColor);
        trial.marbles.reported.array[idx] = newColor;
        $('#redRep').html(trial.marbles.reported.red);
        $('#blueRep').html(trial.marbles.reported.blue);
        flash(); //indicate number change by flashing number
      });
}

function report(){
    trial.responseTime = Date.now() - trial.responseStartTime;
    $('#next').prop('disabled',true);
    computerInfer();

    function senderWait() {
        flickerWait("opp");

        trial.time.wait = 1000 + 3000*exponential(0.75);
        setTimeout(function(){
            clearInterval(trial.timer);
            $('#waiting').html("<p>Your opponent made a decision.</p>");
            $('#waiting').css('opacity',1);
            $('#next').html("Next!");
            $('#next').unbind("click");
            $('#next').bind("click", submitTrial);
            $('#next').prop('disabled',false);
        }, trial.time.wait);
    }
    senderWait();
}

function computerDraw(){
    // groundTruth
    trial.marbles.drawn.red = getK(expt.marblesSampled, expt.probRed);
    trial.marbles.drawn.blue = expt.marblesSampled - trial.marbles.drawn.red;

    // internalSample
    let lie = getK(expt.marblesSampled, expt.probRed); //detector's belief about the distribution
    trial.compSample = lie;
    debugLog("truth: " + trial.marbles.drawn.red);
    debugLog("lie: " + lie);
    if(lie <= trial.marbles.drawn.red){
        trial.marbles.reported.red = trial.marbles.drawn.red;
        trial.marbles.reported.blue = trial.marbles.drawn.blue;
    } else{
        trial.marbles.reported.red = lie;
        trial.marbles.reported.blue = expt.marblesSampled - lie;
    }
}

function computerInfer(){
    let sample = getK(expt.marblesSampled, expt.probRed); //detector's belief about the distribution
    trial.compSample = sample;
    debugLog("sample: " + sample);
    if(sample > trial.marbles.reported.red){
        trial.marbles.inferred.red = trial.marbles.reported.red;
        trial.marbles.inferred.blue = trial.marbles.reported.blue;
    } else{
        trial.marbles.inferred.red = sample;
        trial.marbles.inferred.blue = expt.marblesSampled - sample;
    }
}

function submitTrial(){
    trial.time.response = Date.now() - trial.time.start;
    $('#trial').css('display','none');
    score();
    if(trial.exptPart == 'practice' | (trial.exptPart == 'trial' & (trial.trialNumber + 1) % 5 == 0)){
        toScoreboard();
    } else{
        trialDone();
    }
}

function score(){
    let error = Math.abs(trial.marbles.inferred.red - trial.marbles.drawn.red);
    trial.score.player = trial.role == "sender" ? error : -error;
    trial.score.opp = trial.role == "sender" ? -error : error;

    expt.scoreTotal.player += trial.score.player;
    expt.scoreTotal.opp += trial.score.opp;
}

function restartTrial(){
    $('#trial').css('display','block');
    if(trial.role == "sender"){
        var roletxt = "marble-drawer";
    } else{
        var roletxt = "responder";
    }
    $('.trialNum').html("Round " + (trial.trialNumber+1) + ": You are the <i>" + roletxt + "</i>");
    $('#urnsvg').empty();

    trial.marbles.drawn.red = 0;
    trial.marbles.drawn.blue = 0;
    trial.marbles.reported.red = 0;
    trial.marbles.reported.blue = 0;
    trial.marbles.inferred.red = 0;
    trial.marbles.inferred.blue = 0;

    $('#sendResponse').css('display','none');
    $('#receiveResponse').css('display','none');
    $('input[type=text]').val("");
    $('#waiting').css('opacity',0);

    // if(trial.exptPart != 'practice'){
    //     trial.pseudoRound = trial.trialNumber in expt.pseudo;
    // }

    trial.catch.key = -1;
    trial.catch.response = -1;
    trial.catch.responseTime = -1;
    $('#catchQ').hide();
    $('#sliderContainer').hide();
    $('#postSlider').hide();
    $('#qInstruct').hide();
    $('#slider').addClass('inactiveSlider');
    $('#slider').removeClass('activeSlider');

    trial.startTime = Date.now();
}

function flickerWait(type){
    let op = 0.1;
    let increment = 0.1;
    if(type == "opp"){
        $('#waiting').html('<p>Waiting for your opponent...</p>');
    } else if(type == "draw"){
        $('#waiting').html('<p>Drawing marbles...</p>');
    }
    
    $('#waiting').css('opacity',0);
    trial.timer = setInterval(go, 50);
    function go(){
        op += increment;
        $('#waiting').css('opacity', op);
        if(op >= 1){
            increment = -increment;
        }
        if(op <= 0){
            increment = -increment;
        }
    }
}

function flash(){
    $('.rep').css('opacity',0);
    $('.rep').animate({'opacity':1}); 
}


function submitCatchText(){
    trial.catch.responseTime = Date.now() - trial.catch.responseStartTime;
    $('input[type=text]').prop('disabled',true);
    $('input[type=text]').css('opacity',0.7);
    $('#catch-button').prop('disabled', true);
    var timeoutTime = 0;
    if(trial.catch.key == trial.catch.response){
        $('#catchQ').append('<img src="img/yup.png" height=18 vertical-align="middle" hspace="20">');
    } else{
        $('#catchQ').append('<img src="img/nah.png" height=18 vertical-align="middle" hspace="20">');
        timeoutTime = 3000;
    }
    setTimeout(function(){
        if(trial.exptPart == 'practice' | (trial.trialNumber + 1) % 5 == 0){
            $('.scoreboardDiv').css('opacity','1');
        }
        $('.scoreReport').css('opacity','1');
        $('#nextScoreboard').css('opacity','1');
    }, timeoutTime);
}

function submitCatchSlider(){
    trial.catch.responseTime = Date.now() - trial.catch.responseStartTime;
    trial.catch.response = $('input[type=range]').val();
    $('input[type=range]').prop('disabled',true);
    $('input[type=range]').css('opacity',0.7);
    $('#catch-button').prop('disabled', true);
    var timeoutTime = 0;
    if(trial.catch.key == 'NA' || trial.catch.key >= (trial.catch.response - 25) & trial.catch.key <= (trial.catch.response + 25)){
        $('#postSlider').append('<img id="correctSlider" src="img/yup.png" height=18 vertical-align="middle" hspace="20">');
    } else{
        $('#postSlider').append('<img id="correctSlider" src="img/nah.png" height=18 vertical-align="middle" hspace="20">');
        timeoutTime = 3000;
    }
    setTimeout(function(){
        if(trial.exptPart == 'practice' | (trial.trialNumber + 1) % 5 == 0){
            $('.scoreboardDiv').css('opacity','1');
        }
        $('.scoreReport').css('opacity','1');
        $('#nextScoreboard').css('opacity','1');
    }, timeoutTime);
}



function catchTrial(role, exptPart){
    if(trial.exptPart == "practice" & trial.trialNumber == 0){
        $('#catchQ').before("<p id='qInstruct'>Throughout the experiment, you will randomly be asked questions about the task.<br>If you get the question wrong, you have to wait 3 seconds before being able to move on.<br><br></p>")
    }
    var randomCatch = Math.random();
    if(randomCatch < 0.5){
        if(randomCatch < 0.25){
            trial.catch.question = "What was the proportion of red to blue marbles from your perspective?";
            if(role == 'sender'){
                trial.catch.key = trial.prob.senderRed*100;
            } else{
                trial.catch.key = trial.prob.receiverRed*100;
            }
        } else{
            trial.catch.question = "What was the proportion of red to blue marbles from your opponent's perspective?";
            if(role == 'sender'){
                trial.catch.key = trial.prob.receiverRed*100;
            } else{
                trial.catch.key = 'NA';
            }
        }
        $('input[type=range]').prop('disabled',false);
        $('input[type=range]').css('opacity',1);
        $('input[type=range]').prop('value',50);
        $('#catchQ').html('<label>'+trial.catch.question+'</label>');
        $('#sliderContainer').css('display','block');
        $('#postSlider').html('<br><br><button class="active-button" id="catch-button" type="button" onclick="submitCatchSlider();">Submit</button>');
        $('#postSlider').css('display','block');

        $('#slider').on('click input',
        function(){
            var val = $('#slider').prop('value');
            var dynamColor = 'linear-gradient(90deg, red ' + val + '%, blue ' + val + '%)';

            $('#slider').removeClass('inactiveSlider');
            $('#slider').addClass('activeSlider');
            $('.activeSlider').css('background',dynamColor);
            $('#catch-button').prop('disabled',false);
        });

    } else{
        if(role == 'sender'){
            trial.catch.question = 'How many red marbles did you actually draw?';
            trial.catch.key = trial.drawnRed;
        } else{
            trial.catch.question = 'How many red marbles did your opponent report drawing?';
            trial.catch.key = trial.reportedDrawn;
        }
        $('#catchQ').html('<label>'+trial.catch.question+'</label>');
        var inputTxt = '<input type="text" id="reportCatch" value="" size="2" maxlength="2" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"/> ';
        inputTxt += '<button class="active-button" id="catch-button" type="button" onclick="submitCatchText();">Submit</button>';
        $('#catchQ').append(inputTxt);

        $('input[type=text]').on('input',
            function(){
                trial.catch.response = parseInt($(this).val());
                if(trial.catch.response >= 0 && trial.catch.response <= 10 ){
                    $('#catch-button').prop('disabled',false);
                } else{
                    $('#catch-button').prop('disabled',true);
                }
        });
    }

    $('#catch-button').prop('disabled',true);
    $('.scoreReport').css('opacity','0');
    $('.scoreboardDiv').css('opacity','0');
    $('#nextScoreboard').css('opacity','0');
}



// helper functions
function sample(set) {
    return (set[Math.floor(Math.random() * set.length)]);
}

function sample_without_replacement(sampleSize, sample){
    var urn = [];
    if(Number.isInteger(sample)){
        urn = [...Array(sample).keys()];
    } else {
        urn = sample.slice(0);
    }
    var return_sample = [];
    for(var i=0; i<sampleSize; i++){
        var randomIndex = Math.floor(Math.random()*urn.length);
        return_sample.push(urn.splice(randomIndex, 1)[0]);
    }
    return return_sample;
}

function randomDouble(min, max){
    return Math.random() * (max - min) + min;
}

function shuffle(set){
    var j, x, i;
    for (i = set.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = set[i];
        set[i] = set[j];
        set[j] = x;
    }
    return set;
}

function recordData(){
    trialData.push({
        exptPart: trial.exptPart,
        trialNumber: trial.trialNumber,
        roleCurrent: trial.role,
        marblesSampled: expt.marblesSampled,
        probRed: expt.probRed,
        drawnRed: trial.marbles.drawn.red,
        reportedRed: trial.marbles.reported.red,
        inferredRed: trial.marbles.inferred.red,
        playerTrialScore: trial.score.player,
        oppTrialScore: trial.score.opp,
        playerTotalScore: expt.scoreTotal.player,
        oppTotalScore: expt.scoreTotal.opp,
        waitTime: trial.time.wait,
        responseTime: trial.time.response,
        // catchQuestion: trial.catch.question,
        // catchKey: trial.catch.key,
        // catchResponse: trial.catch.response,
        // catchResponseTime: trial.catch.responseTime,
        // pseudoRound: trial.pseudoRound,
        trialTime: trial.time.trial
    })
}

function debugLog(message) {
    if(expt.debug){
        console.log(message);
    }
}

function binom(n, p, k){
    return (factorial(n)/(factorial(k)*factorial(n-k))) * p ** k * (1-p) ** (n-k);
}

function factorial(x){
    if(x == 0){
        return 1;
    } else{
        return x*factorial(x-1);
    }
}

function cbinom(n, p, k){
    if(k == 0){
        return binom(n, p, 0);
    } else{
        return binom(n, p, k) + cbinom(n, p, k-1);
    }
}

// function getK(n, p, r){
//     var i = 0;
//     while(r > cbinom(n, p, i)){
//         i += 1;
//     }
//     return i;
// }

function getK(n, p){
    let k = 0;
    for(let i=0; i<n; i++){
        if(Math.random() < p){
            k += 1;
        }
    }
    return k;
}

function exponential(lambda){
    return lambda * Math.E ** (-lambda*Math.random())
}

function calculateStats(string, numer, denom){
    if(denom == 0){
        $(string).html("N/A");
    } else{
        $(string).html(Math.round(numer * 100 / denom)+"%");
    }
}

function scorePrefix(score){
    if(score <= 0){
        return(score);
    } else{
        return("+" + score);
    }
}

function distributeChecks(totalTrials, freq){
    // var round = Math.floor(totalTrials * freq);
    // var checkRounds = [];
    // for(var i=0; i<totalTrials/round; i++){
    //     checkRounds.push(round*i + Math.floor(randomDouble(0,round)));
    // }
    var shuffled = shuffle([...Array(totalTrials).keys()]);
    return(shuffled.slice(0,Math.floor(totalTrials*freq)));
}

function distributePseudo(totalTrials, minArrPseudo, maxArrPseudo){
    var pseudoDict = {};
    var arrPseudo = [];
    var bucketOdd = [];

    for(var a=minArrPseudo; a <= maxArrPseudo; a++){
        arrPseudo.push(a);
    }
    for(var i=0; i<=totalTrials/2; i++){
        bucketOdd.push(i);
    }
    var bucketEven = bucketOdd.slice(0);

    for(var o=0; o<arrPseudo.length; o++){
        index = Math.floor(randomDouble(0, bucketOdd.length));
        pseudoDict[(2*bucketOdd.splice(index, 1)[0]+1)] = arrPseudo[o];
    }
    for(var e=0; e<arrPseudo.length; e++){
        index = Math.floor(randomDouble(0, bucketEven.length));
        pseudoDict[(2*bucketEven.splice(index, 1)[0])] = arrPseudo[e];
    }
    return(pseudoDict);
}
