



// TODO, Potentially: pick randomly between human/threePoints instructions.
function pageLoad() {
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
    //expt.catchTrials = distributeChecks(expt.practiceTrials, 1); // 50% of practice trials have an attention check
    if(expt.roleFirst == 'sender'){
        sender();
    } else{
        receiver();
    }
}

function clickPostPractice(){
    $('#postPractice').css('display','none');

    //expt.catchTrials = distributeChecks(expt.trials, 0.15); // 0.1 of expt trials have an attention check
    //expt.pseudo = distributePseudo(expt.trials, 0, 10);
    expt.roleFirst = sample(expt.roles);
    trial.role = expt.roleFirst;
    if(expt.role == 'sender'){
        sender();
    } else{
        receiver();
    }
}




function sender() {
    restartTrial();

    var marbleInstruct = "<p class='instructText'>You drew 100 marbles. Click on marbles to switch their color.</p>";

    $('#trialInstruct').html(marbleInstruct);
    
    trial.marbles.report = trial.marbles.drawn;
    $('#redRep').html(trial.marbles.reported.red);
    $('#blueRep').html(trial.marbles.reported.blue);
    $('#next').html("Report!");``
    $('#urnsvg').css('background-color','white');
    $('#tubesvg').css('background-color','white');
    
    
}



function receiver() {
    restartTrial();

    $('#trialInstruct').html("");
    $('#tubesvg').css('background-color','purple');
    $('#draw-button').prop('disabled',true);
    function bullshitDetectWait() {
        flickerWait();
        
        trial.waitTime = 3000 + 6000*exponential(0.75);
        setTimeout(function(){
            clearInterval(trial.timer);

            var responseInstruct = "<p>Your opponent said they drew <b id='reportMarbles'/> red marbles.</p>"
            responseInstruct += "<p>Your opponent will win <b id='oppPoints'></b> points and you will win <b id='yourPoints'/> points this round.<br><br></p>";
            responseInstruct += "<p id='responseAccRej'>Click <b style='color:green'>'Accept'</b> if you think your opponent is <b style='color:green'>telling the truth</b>, or <b style='color:red'>'Reject'</b> if you think your opponent is <b style='color:red'>lying</b>.</p>"
            
            $('#sendResponse').html(responseInstruct);
            $('#sendResponse').css('opacity','1');
            if(trial.exptPart == "trial"){
                $('#responseAccRej').css('opacity','0');
                setTimeout(function(){
                    $('#responseAccRej').css('opacity','1');
                }, 5000);    
            }
            
            computerDraw();
            $('#reportMarbles').html(trial.reportedDrawn);
            $('#oppPoints').html(trial.reportedDrawn);
            $('#yourPoints').html(expt.marblesSampled - trial.reportedDrawn);

            $('input[type=text]').on('input',
                function(){
                    trial.reportedDrawn = parseInt($(this).val());
                    if(trial.reportedDrawn >= 0 && trial.reportedDrawn <= 10){
                        $('#report-button').prop('disabled',false);
                    } else{
                        $('#report-button').prop('disabled',true);
                    }
            });
            
            $('#receiveResponse').css('display','block');
            trial.responseStartTime = Date.now();
        }, trial.waitTime);
    }
    bullshitDetectWait();
}



function toScoreboard(){
    $('#trial').css('display','none');
    $('#scoreboard').css('display','block');

    trial.catch.time = Date.now();
    if(expt.catchTrials.includes(trial.trialNumber)){
        $('#catchQ').show();
        catchTrial(trial.roleCurrent, trial.exptPart);
    } else if(trial.exptPart == 'trial' & (trial.trialNumber + 1) % 5 != 0){
        $('#totalScoreboardDiv').css('opacity',0);
    } else{
        $('#totalScoreboardDiv').css('opacity',1);
    }

    if(trial.roleCurrent == 'sender'){
        computerBSDetector();
    }

    // if(!trial.callBS){
    //     if(trial.roleCurrent == 'sender'){
    //         trial.callBStxt = "Your opponent <b style='color:green'>accepted</b> your reported answer.<br><br>";
    //         trial.playerTrialScore = trial.reportedDrawn; 
    //         trial.oppTrialScore = expt.marblesSampled - trial.reportedDrawn;
    //         if(trial.reportedDrawn == trial.drawnRed){
    //             trial.callBStxt = trial.callBStxt + "You were <b>telling the truth</b>.<br><br>";
    //             expt.stat.truth += 1;
    //             expt.stat.truth_noBS += 1;
    //         } else{
    //             trial.callBStxt = trial.callBStxt + "You were <b>lying</b>.<br>The true answer was <b>" + trial.drawnRed + "</b>.";
    //             expt.stat.lie += 1;
    //             expt.stat.lie_noBS += 1;
    //         }
    //     } else{
    //         trial.callBStxt = "You <b style='color:green'>accepted</b> your opponent's reported answer.<br><br>";
    //         expt.stat.noBS += 1;
    //         trial.oppTrialScore = trial.reportedDrawn;
    //         trial.playerTrialScore = expt.marblesSampled - trial.reportedDrawn;
    //         if(trial.reportedDrawn == trial.drawnRed){
    //             trial.callBStxt = trial.callBStxt + "Your opponent was <b>telling the truth</b>.<br><br>";
    //             expt.stat.noBS_truth += 1;
    //         } else{
    //             trial.callBStxt = trial.callBStxt + "Your opponent was <b>lying</b>.<br>The true answer was <b>" + trial.drawnRed + "</b>.";
    //             expt.stat.noBS_lie += 1;
    //         }
    //     }
    // } else{
    //     if(trial.roleCurrent == 'sender'){
    //         trial.callBStxt = "Your opponent <b style='color:red'>rejected</b> your reported answer.<br><br>";
    //         //if player is telling the truth
    //         if(trial.reportedDrawn == trial.drawnRed){
    //             trial.callBStxt = trial.callBStxt + "You were <b>telling the truth</b>.<br><br>";
    //             expt.stat.truth += 1;
    //             expt.stat.truth_BS += 1;
    //             trial.playerTrialScore = trial.reportedDrawn; //opponent gets 10 - points as reported w/ -5 penalty
    //             trial.oppTrialScore = expt.marblesSampled - trial.reportedDrawn - 5; //player gets points as reported

    //         } else{
    //             trial.callBStxt = trial.callBStxt + "You were <b>lying</b>.<br>The true answer was <b>" + trial.drawnRed + "</b>.";
    //             expt.stat.lie += 1;
    //             expt.stat.lie_BS += 1;
    //             trial.playerTrialScore = -5; //player gets -5 points
    //             trial.oppTrialScore = 5; //opponent gets +5 points
    //         }
    //     } else{
    //         trial.callBStxt = "You <b style='color:red'>rejected</b> your opponent's reported answer.<br><br>";
    //         expt.stat.BS += 1;
    //         //if player catches a liar
    //         if(trial.reportedDrawn == trial.drawnRed){
    //             trial.callBStxt = trial.callBStxt + "Your opponent was <b>telling the truth</b>.<br><br>";
    //             expt.stat.BS_truth += 1;
    //             trial.playerTrialScore = expt.marblesSampled - trial.reportedDrawn - 5; //player gets 10 - points as reported w/ -5 penalty
    //             trial.oppTrialScore = trial.reportedDrawn; //opponent gets points as reported
    //         } else{
    //             trial.callBStxt = trial.callBStxt + "Your opponent was <b>lying</b>.<br>The true answer was <b>" + trial.drawnRed + "</b>.";
    //             expt.stat.BS_lie += 1;
    //             trial.playerTrialScore = 5; //player gets +5 points
    //             trial.oppTrialScore = -5; //opponent gets -5 points
    //         }
    //     }
    // }

    expt.stat.playerTotalScore += trial.playerTrialScore;
    expt.stat.oppTotalScore += trial.oppTrialScore;
    $('.playerScore').html(expt.stat.playerTotalScore);
    $('.oppScore').html(expt.stat.oppTotalScore);

    if(trial.exptPart == "practice"){
        $('#calledBS').html(trial.callBStxt);
        $('#playerPts').html(scorePrefix(trial.playerTrialScore));
        $('#oppPts').html(scorePrefix(trial.oppTrialScore));
        //$('.playerScore').html((expt.stat.playerTotalScore - trial.playerTrialScore) + " + " + trial.playerTrialScore + " = " + expt.stat.playerTotalScore);
        //$('.oppScore').html((expt.stat.oppTotalScore - trial.oppTrialScore) + " + " + trial.oppTrialScore + " = " + expt.stat.oppTotalScore);
    } else{
        $('.scoreReport').html("Click to move on to the next round.");
        $('#trialScoreboardDiv').hide();
    }
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
        if(trial.roleCurrent == 'sender'){
            trial.roleCurrent = 'receiver';
            receiver();
        } else{
            trial.roleCurrent = 'sender';
            sender();
        }
    }
}


function experimentDone() {
    submitExternal(client);
}

