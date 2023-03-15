



// TODO, Potentially: pick randomly between human/threePoints instructions.
function pageLoad() {
    expt.oppDishonesty = sample(expt.oppDishonesty); //expectations about opponent dishonesty
    expt.lambdaAI = sample(expt.lambdaAI); //actual opponent dishonesty

    clicksMap[startPage]();
}

function clickConsent() {
    $('#consent').css('display','none');
    $('#instructions').css('display','block');
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
    trial.role = 'sender';
    sender();
}

function clickPostPractice(){
    if(expt.oppDishonesty == "honest"){
        $('#oppDishonesty').html("honestly");
    } else if(expt.oppDishonesty == "dishonest_small"){
        $('#oppDishonesty').html("a bit dishonestly");
    } else{
        $('#oppDishonesty').html("very dishonestly");
    }
    
    $('#postPractice').css('display','none');

    expt.catchTrials = distributeChecks(expt.trials, 0.1); // 0.1 of expt trials have an attention check
    //expt.pseudo = distributePseudo(expt.trials, 0, 10);

    expt.scoreTotal.player = 0;
    expt.scoreTotal.opp = 0;
    
    trial.role = 'receiver';
    receiver();
}




function sender() {
    restartTrial();
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

        trial.time.wait = 0; //waittime(1000 + 3000*exponential(0.75));
        setTimeout(function(){
            clearInterval(trial.timer);

            $('#waiting').css('opacity',0);
            fillUrn();
            $('#redDraw').html(trial.marbles.drawn.red);
            $('#blueDraw').html(trial.marbles.drawn.blue);
            trial.marbles.reported.red = trial.marbles.drawn.red;
            trial.marbles.reported.blue = trial.marbles.drawn.blue;
            $('#redRep').html(trial.marbles.reported.red);
            $('#blueRep').html(trial.marbles.reported.blue);
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
        catchTrial(trial.role);
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
        $('.playerScore').html(scorePrefix(expt.scoreTotal.player));
        $('.oppScore').html(scorePrefix(expt.scoreTotal.opp));
        if(expt.scoreTotal.player == expt.scoreTotal.opp){
            $('#whowon').html("You and your opponent tied!");
        } else if(expt.scoreTotal.player > expt.scoreTotal.opp){
            $('#whowon').html("You won!");
        } else{
            $('#whowon').html("Your opponent won!");
        }

        $('#finalScoreboardDiv').css('opacity',1);
        data = {client: client, expt: expt, trials: trialData};
        writeServer(data);

        $('#winner').css('display','block');
    } else {
        trial.role = 'receiver'; //switch to receiver in practice and test
        receiver();
    }

}

function clickWinner() {
    $('#winner').css('display','none');
    if(expt.pilot){
        $('#postquestions').css('display','block');
        $('#continueQs').prop('disabled',true);
        showQuestions();
    } else{
        $('#completed').css('display','block'); //if not pilot, skip ahead to end
    }
}

function clickQs() {
    submitPosttest();
    $('#postquestions').css('display','none');
    $('#completed').css('display','block');
}

function experimentDone() {
    submitExternal(client);
}
