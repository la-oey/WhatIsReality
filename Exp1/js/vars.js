// experiment settings
var expt = {
    saveURL: 'submit.simple.php',
    trials: 100,
    practiceTrials: 2, //how many practice trials //switch to 4
    marblesSampled: 100, //total number of marbles drawn per trial
    probRed: 0.5,
    roleFirst: 'sender', //roles: {'sender','receiver'}
    roles: ['sender','receiver'],
    catchTrials: [],
    scoreTotal: {
        player: 0,
        opp: 0
    },
    // sona: {
    //     experiment_id: 1505,
    //     credit_token: ''
    // },
    debug: false
};
var trial = {
    exptPart: 'trial', //parts: {'practice','trial'}
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
    numClicks: 0,
    flipThresh: 1
};
var client = parseClient();
var trialData = []; // store of all trials
var startPage = "practice";
