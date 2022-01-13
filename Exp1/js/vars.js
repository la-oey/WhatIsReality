// experiment settings
var expt = {
    saveURL: 'submit.simple.php',
    trials: 20,
    practiceTrials: 2, //how many practice trials //switch to 4
    marblesSampled: 100, //total number of marbles drawn per trial
    probRed: 0.5,
    lambdaAI: [2,4,8,16],
    roleFirst: 'sender', //roles: {'sender','receiver'}
    roles: ['sender','receiver'],
    cost: ['unif', 'linear'],
    costF: [uniformCost, linearCost],
    goal: ['over','under'],
    catchTrials: [],
    scoreTotal: {
        player: 0,
        opp: 0
    },
    sona: {
        experiment_id: 2228,
        credit_token: 'b315147ae43241ea9c65086cb510cfb7'
    },
    pilot: true,
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
        },
        compSample: 0
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
