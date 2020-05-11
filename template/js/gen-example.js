function make_slides(f) {
    var slides = {};

    // consent slide
    slides.i0 = slide({
	name : "i0",
	start: function() {
	    exp.startT = Date.now();
	    // change information about experiment on first slide
	    $('#instruct-text > #1').text("some objects");
	    $('#instruct-text > #2').text("5"); // number of minutes experiment is expected to take
	}
    });

    // introductory information (cover story)
    slides.introduction = slide({
	name: "introduction",
	start: function() {
	    $('#intrButton').hide();
	    $('#intrButton').show();
	},
	button: function() {
	    exp.go();
	}
    });

    // check if the user is a bot using a simple reading comprehension question
    slides.botcaptcha  = slide({
	name: "botcaptcha",
	// amount of trials to enter correct response
	trial: 0,
	start: function(){
	    $("#fail").hide()
	    // define possible speaker and listener names
	    // fun fact: 10 most popular names for boys and girls
	    var speaker = _.shuffle(["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles"])[0];
	    var listener = _.shuffle(["Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Margaret"])[0];

	    var story = speaker + ' says to ' + listener + ': "It\'s a beautiful day, isn\'t it?"'

	    $("#story").html(story)
	    $("#question").html("Who is " + speaker + " talking to?" +
				"<br><strong>Note: please type your answer in lower-case.")

	    // don't allow enter press in text field
	    $('#listener-response').keypress(function(event) {
		if (event.keyCode == 13) {
		    event.preventDefault();
		}
	    });

	    // don't show any error message
	    $("#error").hide();
	    $("#error_incorrect").hide();
	    $("#error_2more").hide();
	    $("#error_1more").hide();
	    this.listener = listener, this.speaker = speaker
	},
	button:  function() {
            response = $("#listener-response").val().replace(" ","");

            // response correct
            // if (this.listener.toLowerCase() == response.toLowerCase()) {
            if (this.listener.toLowerCase() == response) {
		// exp.catch_trials.botresponse = $("#listener-response").val();
		exp.go();

		// response false
            } else {
		this.trial = this.trial + 1;
		$("#error_incorrect").show();
		if (this.trial == 1) {
                    $("#error_2more").show();
		} else if (this.trial == 2) {
                    $("#error_2more").hide();
                    $("#error_1more").show();
		} else {
                    $("#error_incorrect").hide();
                    $("#error_1more").hide();
                    $("#next").hide();
                    $('#quest-response').css("opacity", "0.2");
                    $('#listener-response').prop("disabled", true);
                    $("#error").show();
                    $("#fail").show()

		};
            };
	}
    })

    // check to make sure the user's sound works
    slides.sound_check = slide({
	name: "sound_check",
	start: function() {
	    exp.sound_word = _.sample(['tiger', 'evergreen']); // randomly choose a test word
	    exp.sound = new Audio('../_shared/audio/'+exp.sound_word+'.mp3');
	    $('.err').hide();
	},
	test_sound: function() {
	    exp.sound.play();
	},
	button: function() {
	    if ($('#sound_response').val() == '') {
		$('.err').show();
	    }
	    else {
		response = $('#sound_response').val();
		exp.sound_check = response;
		exp.go();
	    }
	}
    });

    // trials: both stimuli and response slides
    slides.trials = slide({
	name: "trials",
	present: exp.stimuli, // array containing trial data
	// called once on each element of this.present
	present_handle: function(stim) {
	    this.stim = stim; // save stim for use in methods outside of present_handle
	    
	    if (stim.type == "trial") { // stimuli slide (with speaker and novel properties)
		$('#trial').show();
		$('#response').hide();
		$('.err').hide();
		$('.button').hide(); // hide 'Continue' button until stimulus is done displaying
		
		$('#testStatement').text('When you enter the lab, you see that there is a scientist already working in there. He says: ');
		
		if (stim.sound) {
		    exp.sound = new Audio('../_shared/audio/'+stim.sound+'.mp3');
		}

		const paper = new Raphael(document.getElementById('paper'), 800, 500);
		exp.paper = paper;
		const man = paper.image('../_shared/images/man.png', 0,0,250,430);
		const bubbleText = '(Click on the speech bubble when you are ready.)';

		// function in charge of performing animations for both accidental and pedagogical trials
		function demo(accidental, item, xcoord, pointerLeft) {
		    if (!accidental) {
			const pedagogical = new Audio('../_shared/audio/pedagogical.m4a');
			pedagogical.play();
			$('#utterance').text('Look at this!');
		    }
		    if (stim.sound) {
			if (accidental) {
			    item.animate({path:objectPaths[stim.shape](xcoord,380)}, 1000, 'linear', function() {
				exp.sound.play();
			    });
			} else {
			    setTimeout(function() {
				paper.pointer = paper.image('../_shared/images/pointer.png', 600, 100, 100, 100);
				paper.pointer.animate({x:xcoord-40, y:90}, 1000, 'linear');
				setTimeout(function() {
				    exp.sound.play();
				}, 1000);
			    }, 1500);
			}
		    } else {
			item.animate({x:400}, 500, 'linear', function() {
			    item.animate({width: 320, height: 320, x: 400, y:30}, 500, 'linear', function() {
				if (!accidental) {
				    if (pointerLeft) {
					paper.pointer = paper.image('../_shared/images/pointer.png', 400, 100, 100, 100).rotate(90);
					function animatePointer() {
					    paper.pointer.animate({x:400, y:0}, 500, 'linear', function() {
						paper.pointer.animate({x:400, y:100}, 500, 'linear', animatePointer);
					    });
					    
					}
					animatePointer();
				    } else {
					paper.pointer = paper.image('../_shared/images/pointer.png', 650, 100, 100, 100).rotate(270);
					function animatePointer() {
					    paper.pointer.animate({x:650, y:0}, 500, 'linear', function() {
						paper.pointer.animate({x:650, y:100}, 500, 'linear', animatePointer);
					    });
					    
					}
					animatePointer();
				    }
				    
				}
			    });
			});
			
		    }
		}

		// function in charge of setup and animation (calling demo) for pedagogical trials
		function showPedagogical(item, xcoord, callback, pointerLeft) {
		    $('#utterance').text('Now I have something to show you. Are you ready?');
		    $('#instruct').show();
		    const readyPedagogical = new Audio('../_shared/audio/readyPedagogical.m4a');
		    readyPedagogical.play();
		    const speech = paper.set();
		    setTimeout(function() {
			speech.push(exp.paper.path(speech_bubble(600, 120)).attr({"stroke": 2, "fill": '#fcfac2'}));
			speech.push(exp.paper.text(600,150, "I'm ready!").attr({"font-size": 14}));
			speech.mouseover(function() {
			    speech.attr('cursor', 'pointer');
			})
			$('#instruct').text(bubbleText);
			speech.click(function() {
			    speech.remove();
			    demo(false, item, xcoord, pointerLeft);
			    $('#instruct').hide();
			    setTimeout(function() {
				callback();
			    }, 4000);
			});
		    }, 4000);
		}

		// function in charge of setup and animation (calling demo) for pedagogical trials
		function showAccidental(item, xcoord, callback) {
		    if (stim.sound) {
			$('#utterance').text('Oops!');
			const oops = new Audio('../_shared/audio/oops.m4a');
			oops.play();
		    }
		    else {
			$('#utterance').text("Oh! Look at that!");
			const accidental = new Audio('../_shared/audio/accidental.m4a');
			accidental.play();
		    }
		    setTimeout(function() {
			demo(true, item, xcoord);
			callback();
		    }, 1000);
		}

		// setup function: in charge of removing old items, and getting new one (plus coordinates) for next animation
		function setNextItem(i, n, timeout1, timeout2, demoItems, coverSets, startCoords, offsetX, pointerOffset, manCoord) {
		    let x;
		    let item;
		    if (stim.sound) {
			item = demoItems[i];
			setTimeout(function() {
			    if (exp.paper.pointer) {
				exp.paper.pointer.remove();
			    }
			    man.animate({x:manCoord+i*offsetX}, 1000, 'linear');
			    if (i - 1 >= 0) {
				demoItems[i-1].remove();
			    }
			}, timeout1);
			setTimeout(function() {
			    if (coverSets !== null) {
				coverSets[i].remove();
			    }
			}, timeout2);
			x = startCoords[stim.singular.toLowerCase()][0]+i*offsetX;
		    } else {
			item = demoItems[n-i-1];
			if (exp.paper.pointer) {
			    exp.paper.pointer.remove();
			}
			setTimeout(function() {
			    if (coverSets !== null) {
				coverSets[n-i-1].remove();
			    }
			    if (i > 0) {
				demoItems[n-i].remove();
			    }
			}, timeout2);
			x = startCoords[stim.singular.toLowerCase()][0]+(n-i-1)*offsetX+pointerOffset;
		    }
		    return [x, item];
		}

		// places items on page for pedagogical trials
		function setUpItemsPedagogical(totalStims, startCoords, offsetX, offsetY) {
		    const demoItems = [];
		    for (i=0;i<totalStims;i++) {
			if (stim.singular.toLowerCase() === 'blicket') {
			    demoItems.push(exp.paper.path(objectPaths[stim.shape](startCoords[stim.singular.toLowerCase()][0]+i*offsetX,startCoords['blicket'][1])).attr("fill", stim.color));
			} else {
			    demoItems.push(exp.paper.image('../_shared/images/'+stim.image, startCoords[stim.singular.toLowerCase()][0], startCoords[stim.singular.toLowerCase()][1]+i*offsetY, 80, 80).toBack());
			}
		    };
		    return demoItems;
		}

		// sets up functions for pedagogical trials; functions are nested so that they happen one after the other (via setTimeout)
		function getSetUpFuncPedagogical(n, totalStims, demoItems, coverSets, params) {
		    if (n === totalStims - 1) {
			return function() {
			    const nextItemData = setNextItem(n, totalStims, params.timeout1, params.timeout2, demoItems, coverSets, params.startCoords, params.offsetX, params.pointerOffset, params.manCoord);
			    showPedagogical(nextItemData[1], nextItemData[0], function() {
				$('button').show();
			    }, stim.singular.toLowerCase() === 'fep');
			}
		    } else {
			return function() {
			    const nextItemData = setNextItem(n, totalStims, params.timeout1, params.timeout2, demoItems, coverSets, params.startCoords, params.offsetX, params.pointerOffset, params.manCoord);
			    showPedagogical(nextItemData[1], nextItemData[0], getSetUpFuncPedagogical(n+1, totalStims, demoItems, coverSets, params), stim.singular.toLowerCase() === 'fep');
			}
		    }
		}

		// places items (and covers and labels) on page for accidental trials
		function setUpItemsAccidental(totalStims, startCoords, coverCoords, labelCoords, offsetX, offsetY) {
		    const demoItems = [];
		    for (i=0;i<totalStims;i++) {
			if (stim.singular.toLowerCase() === 'blicket') {
			    demoItems.push(exp.paper.path(objectPaths[stim.shape](startCoords[stim.singular.toLowerCase()][0]+i*offsetX,startCoords['blicket'][1])).attr("fill", stim.color));
			} else {
			    demoItems.push(exp.paper.image('../_shared/images/'+stim.image, startCoords[stim.singular.toLowerCase()][0], startCoords[stim.singular.toLowerCase()][1]+i*offsetY, 80, 80).toBack());
			}
		    };
		    const coverSets = [];
		    for (i=0;i<totalStims;i++) {
			x = startCoords[stim.singular.toLowerCase()][0]+i*offsetX;
			const set = exp.paper.set();
			if (stim.singular.toLowerCase() === 'blicket') {
			    set.push(exp.paper.image('../_shared/images/cover.png', 210+i*offsetX, -50, coverCoords[2], coverCoords[3]));
			    set.push(exp.paper.rect(labelCoords[0]+i*offsetX, labelCoords[1], labelCoords[2], labelCoords[3]).attr({"fill": '#fcfac2'}));
			    set.push(exp.paper.text(labelCoords[0]+i*offsetX+labelCoords[1]/2, labelCoords[1]+15, stim.singular));
			} else {
			    set.push(exp.paper.image('../_shared/images/cover.png', coverCoords[0], coverCoords[1]+i*offsetY, coverCoords[2], coverCoords[3]));
			    set.push(exp.paper.rect(labelCoords[0], labelCoords[1]+i*offsetY, labelCoords[2], labelCoords[3]).attr({"fill": '#fcfac2'}));
			    set.push(exp.paper.text(labelCoords[0]+labelCoords[1]/2, labelCoords[1]+15+i*offsetY, stim.singular));
			}
			coverSets.push(set);
		    }
		    return {demoItems: demoItems, coverSets: coverSets};
		}

		// sets up functions for accidental trials; functions are nested so that they happen one after the other (via setTimeout)
		function getSetUpFuncAccidental(n, totalStims, demoItems, coverSets, params) {
		    if (n === totalStims - 1) {
			return function() {
			    const nextItemData = setNextItem(n, totalStims, params.timeout1, params.timeout2, demoItems, coverSets, params.startCoords, params.offsetX, params.pointerOffset, params.manCoord);
			    setTimeout(function() {
				showAccidental(nextItemData[1], nextItemData[0], function() {
				    $('button').show();
				});
			    }, 3000);
			}
		    } else {
			return function() {
			    const nextItemData = setNextItem(n, totalStims, params.timeout1, params.timeout2, demoItems, coverSets, params.startCoords, params.offsetX, params.pointerOffset, params.manCoord);
			    setTimeout(function() {
				showAccidental(nextItemData[1], nextItemData[0], getSetUpFuncAccidental(n+1, totalStims, demoItems, coverSets, params));
			    }, 3000);
			}
		    }
		}

		// convenience object for displaying appropriate text
		const intToNum = {
		    2: 'two',
		    3: 'three',
		    4: 'four',
		}

		// makes trial for pedagogical case, taking in custom configs
		function makePedagogicalTrial(n, overrideParams) {
		    const params = Object.assign({
			startCoords: {
			    "blicket": [270, 100],
			    "dax": [250, 60],
			    "fep": [250, 60]
			},
			offsetX: 100,
			offsetY: 120,
			coverCoords: [210, -40, 150, 230],
			labelCoords: [305, 50, 50, 25],
			timeout1: 0,
			timeout2: 0,
			pointerOffset: 100,
			manCoord: 0,
		    }, overrideParams);
		    
		    const pedagogicalUtterance = new Audio('../_shared/audio/'+n+stim.plural.toLowerCase()+'Id.m4a');
		    pedagogicalUtterance.play();
		    
		    const demoItems = setUpItemsPedagogical(n, params.startCoords, params.offsetX, params.offsetY);
		    const utteranceText = n === 1 ? 'This is a '+stim.singular.toLowerCase()+'.' : 'These are '+intToNum[n]+' '+stim.plural.toLowerCase()+'.'
		    $('#utterance').text(utteranceText);
		    
		    const setUpFunc = getSetUpFuncPedagogical(0, n, demoItems, null, params);

		    setTimeout(setUpFunc, 3000);
		}

		// makes trial for accidental case, taking in custom configs (most changes should be here)
		function makeAccidentalTrial(n, overrideParams) {
		    const params = Object.assign({
			startCoords: {
			    "blicket": [270, 100],
			    "dax": [250, 60],
			    "fep": [250, 60]
			},
			offsetX: 100,
			offsetY: 120,
			coverCoords: [210, -40, 150, 230],
			labelCoords: [305, 50, 50, 25],
			timeout1: 2000,
			timeout2: 3000,
			beginningTimeout: 3000,
		    }, overrideParams);

		    const accidentalUtterance = new Audio('../_shared/audio/'+n+stim.plural.toLowerCase()+'Accidental.m4a');
		    accidentalUtterance.play();
		    
		    const utteranceText = n === 1 ? 'Oh! This is a '+stim.singular.toLowerCase()+'.' : 'Oh! These are '+intToNum[n]+' '+stim.plural.toLowerCase()+'.';
		    $('#utterance').text(utteranceText);

		    const setUpData = setUpItemsAccidental(n, params.startCoords, params.coverCoords, params.labelCoords, params.offsetX, params.offsetY);
		    const demoItems = setUpData.demoItems;
		    const coverSets = setUpData.coverSets;

		    const setUpFunc = getSetUpFuncAccidental(0, n, demoItems, coverSets, params);
		    
		    setTimeout(setUpFunc, params.beginningTimeout);
		}
		
		if (stim.trialType == "accidental") {
		    makeAccidentalTrial(1, {});
		} else if (stim.trialType == "2accidental") {
		    makeAccidentalTrial(2, {});
		} else if (stim.trialType == "3accidental") {
		    makeAccidentalTrial(3, {beginningTimeout: 4000});
		} else if (stim.trialType == "4accidental") {
		    makeAccidentalTrial(4, {
			startCoords: {
			    "blicket": [270, 100],
			    "dax": [250, 10],
			    "fep": [250, 10]
			},
			coverCoords: [210, -90, 150, 230],
			beginningTimeout: 4500,
		    });
		} else if (stim.trialType == "pedagogical") {
		    makePedagogicalTrial(1, {});
		} else if (stim.trialType == "2pedagogical") {
		    makePedagogicalTrial(2, {});
		} else if (stim.trialType == "3pedagogical") {
		    makePedagogicalTrial(3, {});
		} else if (stim.trialType == "4pedagogical") {
		    makePedagogicalTrial(4, {startCoords: {
			"blicket": [270, 100],
			"dax": [250, 0],
			"fep": [250, 0]
		    }});
		} 
	    } else if (stim.type == "response") { // response slide (with slider bar for dependent variable)
		$('#trial').hide();
		$('#response').show();
		if (stim.sound) {
		    $('.prompt').html('Imagine that you have another '+stim.singular.toLowerCase()+'. What are the chances that it '+stim.sound+'s?');
		}
		else {
		    $('.prompt').html('Imagine that you have another '+stim.singular.toLowerCase()+'. What are the chances that it '+stim.featureSingular+'?');
		}
		this.init_sliders();
		exp.sliderPost = null;
	    }
	},
	init_sliders : function() {
	    utils.make_slider("#single_slider", function(event, ui) {
		exp.sliderPost = ui.value;
	    });
	},
	button: function() {
	    if (this.stim.type == "response") { // only log data for "response" type trials
		if (exp.sliderPost === null) { // check to make sure user entered a response
		    $('.err').show();
		} else {
		    exp.responses.push(_.extend(this.stim, {response: exp.sliderPost, condition: exp.condition}));
		    _stream.apply(this);
		}
	    } else if (this.stim.type == "trial") {
		_stream.apply(this);
		if (exp.paper) {
		    if (exp.pointer) {
			exp.pointer.remove();
		    }
		    exp.paper.remove();
		}
	    }
	}
    });

    // attention check: do participants remember which stimuli they saw?
    slides.identification = slide({
	name: "identification",
	present: exp.id_trials,
	present_handle: function(stim) {
	    $('.err').hide();
	    $('.button').show();
	    $('#instructId').text('Which one of these other ones is a '+stim.singular.toLowerCase()+'?');
	    if (exp.distractorPaper) {
		exp.distractorPaper.clear();
	    } else {
		const paper = new Raphael(document.getElementById('paperId'), 800, 450);
		exp.distractorPaper = paper;
	    }
	    const distractors = exp.distractorPaper.set();
	    const positions = _.shuffle([[300,200],[500,200],[300,300],[500,300]])
	    let activeItem;
	    exp.correctId = false;
	    exp.distractorClicks = 0;
	    exp.selected = null;
	    const expScope = this;
	    let selection = null;
	    this.stim = stim;

	    stim.distractors.forEach(function(distractor, i) {
		if (stim.image) {
		    distractors.push(exp.distractorPaper.image('../_shared/images/'+distractor, positions[i+1][0]-50, positions[i+1][1]-50, 80, 80).click(function() {
			exp.distractorClicks ++;
			exp.correctId = false;
			exp.selected = distractor;
			if (selection !== null) {
			    selection.remove();
			}
			selection = exp.distractorPaper.rect(positions[i+1][0]-50, positions[i+1][1]-50, 90, 90);
		    }));
		} else {
		    distractors.push(exp.distractorPaper.path(objectPaths[distractor.shape](positions[i+1][0], positions[i+1][1])).attr("fill", distractor.color).click(function() {
			exp.distractorClicks ++;
			exp.correctId = false;
			exp.selected = distractor;
			if (selection !== null) {
			    selection.remove();
			}
			selection = exp.distractorPaper.rect(positions[i+1][0]-50, positions[i+1][1]-50, 90, 90);
		    }));
		}
	    });
	    if (stim.image) {
		activeItem = exp.distractorPaper.image('../_shared/images/'+stim.image, positions[0][0]-50, positions[0][1]-50, 80, 80);
	    } else {
		activeItem = exp.distractorPaper.path(objectPaths[stim.shape](positions[0][0], positions[0][1])).attr("fill", stim.color);
	    }
	    activeItem.click(function() {
		exp.correctId = true;
		exp.selected = "correct";
		if (selection !== null) {
		    selection.remove();
		}
		selection = exp.distractorPaper.rect(positions[0][0]-50, positions[0][1]-50, 90, 90);
	    });
	},
	button: function() {
	    if (exp.selected === null) { // check to make sure the user selected a response
		$('.err').show();
	    } else {
		exp.responses.push(_.extend(this.stim, {distractorClicks: exp.distractorClicks, selected: exp.selected, correctId: exp.correctId, condition: exp.condition}));
		_stream.apply(this);
	    }
	}
    });

    slides.subj_info =  slide({
	name : "subj_info",
	submit : function(e){
	    exp.subj_data = {
		language : $("#language").val(),
		enjoyment : $("#enjoyment").val(),
		asses : $('input[name="assess"]:checked').val(),
		age : $("#age").val(),
		gender : $("#gender").val(),
		education : $("#education").val(),
		comments : $("#comments").val(),
		problems: $("#problems").val(),
		fairprice: $("#fairprice").val()
	    };
	    exp.go(); //use exp.go() if and only if there is no "present" data.
	}
    });

    slides.thanks = slide({
	name : "thanks",
	start : function() {
	    exp.data= {
		"trials" : exp.responses,
		"system" : exp.system,
		"condition" : exp.condition,
		"subject_information" : exp.subj_data,
		"time_in_minutes" : (Date.now() - exp.startT)/60000,
		"sound_check": {
		    response: exp.sound_check,
		    test_word: exp.sound_word
		}
	    };
	    setTimeout(function() {turk.submit(exp.data);}, 1000);
	}
    });

    return slides;
}

/// init: called at the very beginning to set up slides ///
function init() {
    exp.condition = _.sample([
	// "accidental",
	// "2accidental",
	// "3accidental",
	// "4accidental",
	// "pedagogical",
	"2pedagogical",
    // 	"3pedagogical",
    // 	"4pedagogical"
     ]); //can randomize between subject conditions here
    exp.system = {
	Browser : BrowserDetect.browser,
	OS : BrowserDetect.OS,
	screenH: screen.height,
	screenUH: exp.height,
	screenW: screen.width,
	screenUW: exp.width
    };
    exp.responses = [];

    //blocks of the experiment:
    exp.structure=[
	'i0',
	'botcaptcha',
	'sound_check',
	'introduction',
	'trials',
	'identification',
	'subj_info',
	'thanks'
    ];

    // array containing possible items
    const trials = _.shuffle([
	_.extend(
	    {
		distractors: drag_and_drop.objects.slice(1,4),
		featureSingular: drag_and_drop.objects[0].sound+"s",
	    },
	    drag_and_drop.objects[0],
	),
	drag_and_drop.biologics[0],
	drag_and_drop.biologics[1]    
    ])

    exp.stimuli = []; // create stimuli by placing trials and then responses
    trials.forEach(function(trial) {
	exp.stimuli = exp.stimuli.concat([ 
	    _.extend(
		{
		    trialType: exp.condition,
		    type: "trial",
		},
		trial,
	    ),
	    _.extend(
		{type: "response"},
		trial,
	    )
	]);
    });

    exp.id_trials = []; // create identification trials
    trials.forEach(function(trial) {
	if (exp.condition != "generic") {
	    exp.id_trials = exp.id_trials.concat([
		_.extend(
		    {type: "id"},
		    trial,
		)
	    ])
	}
    });

    exp.slides = make_slides(exp);

    exp.nQs = utils.get_exp_length();

    $('.slide').hide(); //hide everything

    //make sure turkers have accepted HIT (or you're not in mturk)
    $("#start_button").click(function() {
	if (turk.previewMode) {
	    $("#mustaccept").show();
	} else {
	    $("#start_button").click(function() {$("#mustaccept").show();});
	    exp.go();
	}
    });

    exp.go(); //show first slide
    USOnly();
    uniqueTurker();
}
