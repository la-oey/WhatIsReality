var clicksMap = {
	"consent": function(){$('#consent').css('display','block')},
	"instruct": clickConsent,
	"prePractice": clickInstructions,
	"practice": clickPrePractice,
	"trial": clickPostPractice,
	"winner": function(){$('#winner').css('display','block')},
	"postQs": clickWinner,
	"completed": clickQs
}