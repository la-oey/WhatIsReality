// experiment settings
var expt = {
    saveURL: 'submit.simple.php',
    trials: 100,
    practiceTrials: 2, //how many practice trials //switch to 4
    marblesSampled: 100, //total number of marbles drawn per trial
    probRed: 0.5,
    practiceLambdaAI: 5,
    lambdaAI: [0.3,8.1,21.9],
    roles: ['sender','receiver'],
    cost: 'unif',
    costF: uniformCost,
    goal: 'over',
    oppDishonesty: ['honest','dishonest_small','dishonest_big'],
    catchTrials: [],
    scoreTotal: {
        player: 0,
        opp: 0
    },
    sona: {
        experiment_id: 2488,
        credit_token: '79d15902e9034cb6b65a542be205401c'
    },
    pilot: false,
    debug: false
};
var trial = {
    exptPart: 'practice', //parts: {'practice','trial'}
    role: 'sender', //roles: {'sender','receiver'}
    trialNumber: 0,
    time: {
        start: 0,
        trial: 0,
        response: 0,
        wait: 0
    },
    marbles: {
        drawn: { // N/A for receiver
            red: 0,
            blue: 0,
            array: []
        },
        reported: {
            red: 0,
            blue: 0,
            array: []
        },
        inferred: {
            red: 0,
            blue: 0
        }
    },
    catch: {
        question: '',
        response: 0,
        key: 0,
        time: 0
    },
    score: {
        player: 0,
        opp: 0
    },
    numFlips: 0,
    numClicks: 0,
    flipThresh: 1,
    prevMarble: -1
};

var client = parseClient();
var trialData = []; // store of all trials
var startPage = "consent";
var alphabeta = 3;
