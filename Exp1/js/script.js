



// TODO, Potentially: pick randomly between human/threePoints instructions.
function pageLoad() {
    // expt.cost = sample(expt.cost);
    expt.goal = sample(expt.goal);
    expt.cost = 'linear';
    expt.costF = expt.cost == 'linear' ? linearCost : uniformCost;
    // if(expt.cost == 'linear'){
        // let flipTxt = "Click each marble <b id='flipThresh' class='repflips'></b> time(s) to switch its color. ";
        // flipTxt += "You have <b id='clickCount' class='repflips'></b> clicks left.";
        // $('#sendText').append(flipTxt);
    // }

    clicksMap[startPage]();
}

function clickConsent() {
    $('#consent').css('display','none');
    $('#instructions').css('display','block');
    $('#instructGoal').html(expt.goal);
    let exEst = expt.goal == "over" ? 48 : 42;
    $('#exEst').html(exEst);
    let instrCost = "";
    if(expt.cost == 'linear') {
        instrCost = "Click each marble to switch its color. The number of clicks needed to switch will go up with each marble.";
    } else {
        instrCost = "Click each marble once to switch its color."
    }
    $('#instructCost').html(instrCost);
    $('#instructPractice').html(expt.practiceTrials);
    $('#instructRounds').html(expt.trials);
}

function clickInstructions() {
    $('#instructions').css('display','none');
    $('#prePractice').css('display','block');
}

function clickPrePractice(){
    $('#prePractice').css('display','none');
    expt.catchTrials = distributeChecks(expt.practiceTrials, 1); // 50% of practice trials have an attention check
    if(expt.roleFirst == 'sender'){
        sender();
    } else{
        receiver();
    }
}

function clickPostPractice(){
    $('#postPractice').css('display','none');

    expt.catchTrials = distributeChecks(expt.trials, 1); // 0.1 of expt trials have an attention check
    //expt.pseudo = distributePseudo(expt.trials, 0, 10);
    
    // expt.roleFirst = sample(expt.roles); // REMOVE LATER
    trial.role = expt.roleFirst;
    if(trial.role == 'sender'){
        sender();
    } else{
        receiver();
    }
}




function sender() {
    restartTrial();
    $('#trialInstruct').html("<p class='instructText'><br></p>");
    $('#next').html("Report!");
    $('#next').prop('disabled',true);
    $('#next').unbind("click");
    $('#next').bind("click", report);
    $('#sendResponse').css({'display':'block', 'opacity':0});
    
    if(expt.cost == 'unif'){
        $('#progressInstr').css('display','none');
        $('#progress').css('display','none');
    } else{
        $('#progressInstr').css('display','block');
        $('#progress').css('display','block');
    }

    function drawingWait(){
        flickerWait("draw");

        trial.time.wait = waittime(1000 + 3000*exponential(0.75));
        setTimeout(function(){
            clearInterval(trial.timer);

            $('#waiting').css('opacity',0);
            fillUrn();
            var marbleInstruct = "<p class='instructText'>You drew 100 marbles. Click on marbles to switch their color.</p>";
            $('#trialInstruct').html(marbleInstruct);
            trial.marbles.reported.red = trial.marbles.drawn.red;
            trial.marbles.reported.blue = trial.marbles.drawn.blue;
            $('#redRep').html(trial.marbles.reported.red);
            $('#blueRep').html(trial.marbles.reported.blue);
            $('#flipThresh').html(trial.flipThresh);
            $('#clickCount').html(trial.flipThresh - trial.numClicks);
            $('#sendResponse').css('opacity',1);
            $('#next').prop('disabled',false);
            trial.responseStartTime = Date.now();
        }, trial.time.wait);
    }
    drawingWait();
}



function receiver() {
    restartTrial();
    $('#next').prop('disabled',true);
    $('#next').unbind("click");
    $('#next').bind("click", submitTrial);

    $('#trialInstruct').html("<p class='instructText'><br></p>");
    $('#receiveResponse').css({'display':'block', 'opacity':0});
    $('#progressInstr').css('display','none');
    $('#progress').css('display','none');
    function receiverWait() {
        flickerWait("opp");

        trial.time.wait = waittime(3000 + 6000*exponential(0.75));
        setTimeout(function(){
            clearInterval(trial.timer);
            $('#waiting').css('opacity',0);
            fillUrn(true);
            $('#reportedMarbles').html(trial.marbles.reported.red);

            $('#reportTruth').on('input',
                function(){
                    trial.marbles.inferred.red = parseInt($('#reportTruth').val());
                    trial.marbles.inferred.blue = expt.marblesSampled - trial.marbles.inferred.red;
                    if(trial.marbles.inferred.red >= 0 && trial.marbles.inferred.red <= 100){
                        $('#next').prop('disabled',false);
                    } else{
                        $('#next').prop('disabled',true);
                    }
            });
            $('#receiveResponse').css('opacity',1);

            trial.responseStartTime = Date.now();
        }, trial.time.wait);
    }
    receiverWait();
}



function toScoreboard(){
    $('#scoreboard').css('display','block');

    trial.catch.time = Date.now();
    if(expt.catchTrials.includes(trial.trialNumber)){
        $('#catchQ').show();
        catchTrial(trial.role, trial.exptPart);
    } else if(trial.exptPart == 'trial' & (trial.trialNumber + 1) % 5 != 0){
        $('#totalScoreboardDiv').css('opacity',0);
    } else{
        $('#totalScoreboardDiv').css('opacity',1);
    }

    $('.playerScore').html(expt.scoreTotal.player);
    $('.oppScore').html(expt.scoreTotal.opp);

    if(trial.exptPart == "practice"){
        let practiceReport = "The marble-drawer's goal is to have the guesser " + expt.goal + "estimate. ";
        practiceReport += "The true number of red marbles drawn was " + trial.marbles.drawn.red + ". ";
        practiceReport += "The guess was " + trial.marbles.inferred.red + ", so the guesser ";
        if(trial.marbles.inferred.red == trial.marbles.drawn.red){
            practiceReport += "was accurate!";
        } else {
            if(trial.marbles.inferred.red > trial.marbles.drawn.red){
                practiceReport += "over";
            } else{
                practiceReport += "under";
            }
            let err = Math.abs(trial.marbles.inferred.red - trial.marbles.drawn.red);
            practiceReport += "estimated by " + err + "."
        }
        $('#scoreReport').html(practiceReport);
        $('#playerPts').html(scorePrefix(trial.score.player));
        $('#oppPts').html(scorePrefix(trial.score.opp));
        //$('.playerScore').html((expt.stat.playerTotalScore - trial.playerTrialScore) + " + " + trial.playerTrialScore + " = " + expt.stat.playerTotalScore);
        //$('.oppScore').html((expt.stat.oppTotalScore - trial.oppTrialScore) + " + " + trial.oppTrialScore + " = " + expt.stat.oppTotalScore);
    } else{
        $('#trialScoreboardDiv').hide();
    }
    $('#scoreReport').hide();
}

function trialDone() {
    // hide trial.
    $('#scoreboard').css('display','none');
    trial.trialTime = Date.now() - trial.startTime;
    trial.trialNumber += 1;
    recordData();

    if(trial.exptPart == "practice" & trial.trialNumber >= expt.practiceTrials){
        trial.trialNumber = 0;
        trial.exptPart = 'trial';
        $('#trial').css('display','none');
        $('#postPractice').css('display','block');
    } else if(trial.trialNumber >= expt.trials){
        // if(expt.stat.playerTotalScore == expt.stat.oppTotalScore){
        //     $('#whowon').html("You and your opponent tied!");
        // } else if(expt.stat.playerTotalScore > expt.stat.oppTotalScore){
        //     $('#whowon').html("You won!");
        // } else{
        //     $('#whowon').html("Your opponent won!");
        // }

        $('.scoreboardDiv').show();

        // expt done
        data = {client: client, expt: expt, trials: trialData};
        writeServer(data);

        $('#completed').css('display','block');
    } else {
        if(trial.role == 'sender'){
            trial.role = 'receiver';
            receiver();
        } else{
            trial.role = 'sender';
            sender();
        }
    }
}


function experimentDone() {
    submitExternal(client);
}
