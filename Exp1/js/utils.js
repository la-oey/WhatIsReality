var innerRedCt, innerBlueCt, innerMarbleArray, outerRedCt, outerBlueCt, outerMarbleArray;

function uniformCost() {
  return;  // no change to flip threshold
}

function linearCost() {
  trial.flipThresh += 1;
}

function fillUrn(receiver=false) {
    let padding = 10;
    let marblesAcross = 10;
    let marblesDown = 10;

    if(!receiver){
        trial.prevMarble = -1; //reset prev marble clicked
        trial.flipThresh = 1; //restarts flipping threshold
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
        marble("#urnsvg", color, 17.5, locX, locY, i, interact, expt.costF);
        trial.marbles.drawn.array.push(color);
        trial.marbles.reported.array.push(color);
    }
    flipProgress("gray", 5, 360, true);
}

var progressAnimTime = 500;

function marble(container, color, size, locX, locY, idx, clickable, changeCost){
    d3.select(container)
    .append("circle")
    .attr("id","c"+idx)
    .attr("cx",locX)
    .attr("cy",locY)
    .attr("r",size)
    .attr("stroke-width",2)
    .attr("stroke","black")
    .style("fill",color)
    .on("click", function(event) {
        if (!clickable) return;

        trial.numClicks += 1;
        let m = d3.select(this);
        currentColor = m.style("fill");
        let newColor = currentColor === "red" ? "blue" : "red";
        
        m.style("filter", "drop-shadow(0 0 8px black)");

        $('#progress').empty();
        if(trial.prevMarble != -1 && idx != trial.prevMarble) { // if user switches marble
            trial.numClicks = 1;
            d3.select("#c"+trial.prevMarble).style("filter","drop-shadow(0 0 0 black)");
            trial.prevMarble = idx;
            $('#clickCount').html(trial.flipThresh - trial.numClicks);
            // flash('flips'); //indicate number change by flashing number
            flipProgress(newColor, trial.numClicks, trial.flipThresh);
            return;
        }
        trial.prevMarble = idx;
        if (trial.numClicks < trial.flipThresh) {
          $('#clickCount').html(trial.flipThresh - trial.numClicks);
          // flash('flips'); //indicate number change by flashing number
          flipProgress(newColor, trial.numClicks, trial.flipThresh);
          return;
        } else {
          flipProgress(newColor, trial.numClicks, trial.flipThresh);
          changeCost();
          $('#flipThresh').html(trial.flipThresh);
          trial.numClicks = 0;
          trial.prevMarble = -1;
          $('#clickCount').html(trial.flipThresh - trial.numClicks);
        }

        if (currentColor === "red") {
          trial.marbles.reported.red -= 1;
          trial.marbles.reported.blue += 1;
        } else {
          trial.marbles.reported.red += 1;
          trial.marbles.reported.blue -= 1;
        }

        trial.numFlips += 1;
        trial.marbles.reported.array[idx] = newColor;
        setTimeout(function(){
            m.style("filter", "drop-shadow(0 0 0 black)");
            m.style("fill", newColor);
            $('#redRep').html(trial.marbles.reported.red);
            $('#blueRep').html(trial.marbles.reported.blue);
            flash('marbles');
        }, progressAnimTime);
        
  });
}

function flipProgress(color, count, total, static=false){
    var svg = d3.select("#progress")
            .append("g")
            .attr("transform", "translate(100,100)");

    var arc = d3.arc()
            .innerRadius(60)
            .outerRadius(65)
            .startAngle(0)
            .endAngle(function(d) { return (d.count)/d.total * 2*Math.PI; });

    var g = svg.selectAll("g")
            .data(buildPerc)
            .enter().append("g")
            .attr("class", "arc");
    g.append("path")
        .style("fill", color)
        .attr("d", arc);
    g.append("text")
        .text(count + " / " + total)
        .attr("id", "progressTxt");

    selectArcs();
    $("#progressTxt").css('visibility','visible');
    if(static){
        $("#progressTxt").text("-- / --");
    }

    function buildPerc() {
        return [
            {count: count-1, total: total},
        ];  
    } 

    function selectArcs() {
          d3.selectAll("g.arc > path")
              .each(arcTween);
    }

    function arcTween(){
        d3.select(this)
            .transition().duration(progressAnimTime)
            .attrTween("d", tweenArc({ count: count, total: total}));
        d3.select("text")
            .style("visibility", "hidden");
    }

    function tweenArc(b) {
          return function(a) {
            var i = d3.interpolate(a, b);
            for (var key in b) a[key] = b[key]; // update data
            return function(t) {
                  return arc(i(t));
            };
          };
    } 
}


function report(){
    trial.responseTime = Date.now() - trial.responseStartTime;
    $('#next').prop('disabled',true);
    computerInfer();

    function senderWait() {
        flickerWait("opp");

        trial.time.wait = waittime(1000 + 3000*exponential(0.75));
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
    console.log("inferred: " + trial.marbles.inferred.red);
    console.log("drawn: " + trial.marbles.drawn.red);

    let error = trial.marbles.inferred.red - trial.marbles.drawn.red;
    let scoreReceiver = -Math.abs(error);
    let scoreSender = error <= 0 ? 0 : error; // if receiver underestimates, sender gets 0 pts
    trial.score.player = trial.role == "sender" ? scoreSender : scoreReceiver;
    trial.score.opp = trial.role == "sender" ? scoreReceiver : scoreSender;

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

function flash(v){ //v = {'marbles', 'flips'}
    $('.rep'+v).css('opacity',0);
    $('.rep'+v).animate({'opacity':1});
}


function submitCatchText(){
    trial.catch.responseTime = Date.now() - trial.catch.responseStartTime;
    $('#reportCatch').prop('disabled',true);
    $('#reportCatch').css('opacity',0.7);
    $('#catch-button').prop('disabled', true);
    let timeoutTime = 0;
    if(trial.catch.key == trial.catch.response){
        $('#catchFeedback').attr('src','img/yup.png');
    } else{
        $('#catchFeedback').attr('src','img/nah.png');
        timeoutTime = 3000;
    }
    setTimeout(function(){
        if(trial.exptPart == 'practice' | (trial.trialNumber + 1) % 5 == 0){
            $('.scoreboardDiv').css('opacity','1');
        }
        $('#nextScoreboard').css('opacity','1');
    }, timeoutTime);
}

// function submitCatchSlider(){
//     trial.catch.responseTime = Date.now() - trial.catch.responseStartTime;
//     trial.catch.response = $('input[type=range]').val();
//     $('input[type=range]').prop('disabled',true);
//     $('input[type=range]').css('opacity',0.7);
//     $('#catch-button').prop('disabled', true);
//     var timeoutTime = 0;
//     if(trial.catch.key == 'NA' || trial.catch.key >= (trial.catch.response - 25) & trial.catch.key <= (trial.catch.response + 25)){
//         $('#postSlider').append('<img id="correctSlider" src="img/yup.png" height=18 vertical-align="middle" hspace="20">');
//     } else{
//         $('#postSlider').append('<img id="correctSlider" src="img/nah.png" height=18 vertical-align="middle" hspace="20">');
//         timeoutTime = 3000;
//     }
//     setTimeout(function(){
//         if(trial.exptPart == 'practice' | (trial.trialNumber + 1) % 5 == 0){
//             $('.scoreboardDiv').css('opacity','1');
//         }
//         $('#nextScoreboard').css('opacity','1');
//     }, timeoutTime);
// }



function catchTrial(role){
    if(trial.exptPart == "practice" & trial.trialNumber == 0){
        let catchInstructTxt = "<p id='qInstruct'>"
        catchInstructTxt += "Throughout the experiment, you will randomly be asked questions about the task.<br>"
        catchInstructTxt += "If you get the question wrong, you have to wait 3 seconds before being able to move on.<br><br></p>"
        $('#catchQ').before(catchInstructTxt);
    }
    if(role == 'sender'){
        trial.catch.question = 'How many red marbles did you actually draw? ';
        trial.catch.key = trial.marbles.drawn.red;
    } else{
        trial.catch.question = 'How many red marbles did your opponent report drawing? ';
        trial.catch.key = trial.marbles.reported.red;
    }
    $('#catchQlab').html(trial.catch.question);
    $('#catchFeedback').attr('src','');
    $('#reportCatch').prop('disabled',false);

    $('#reportCatch').on('input',
        function(){
            trial.catch.response = parseInt($('#reportCatch').val());
            if(trial.catch.response >= 0 && trial.catch.response <= 100 ){
                $('#catch-button').prop('disabled',false);
            } else{
                $('#catch-button').prop('disabled',true);
            }
    });

    $('#catch-button').prop('disabled',true);
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

function waittime(time) {
    if(expt.debug){
        return 0;
    } else{
        return time;
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
