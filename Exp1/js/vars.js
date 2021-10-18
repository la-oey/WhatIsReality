// experiment settings
var expt = {
    saveURL: 'submit.simple.php',
    trials: 100,
    practiceTrials: 2, //how many practice trials //switch to 4
    marblesSampled: 100, //total number of marbles drawn per trial
    probRed: 0.5,
    roleFirst: 'sender', //roles: {'sender','receiver'}
    catchTrials: [],
    // sona: {
    //     experiment_id: 1505,
    //     credit_token: ''
    // },
    debug: false
};
var trial = {
    exptPart: 'practice', //parts: {'practice','trial'}
    role: 'sender', //roles: {'sender','receiver'}
    trialNumber: 0,
    time: {
        start: 0,
        trial: 0,
        response: 0
    },
    marbles: {
        drawnArray: [],
        drawn: { // N/A for receiver
            red: 0,
            blue: 0
        },
        reported: {
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
        sender: 0,
        receiver: 0
    }
};
var client = parseClient();
var trialData = []; // store of all trials
var startPage = "practice";
