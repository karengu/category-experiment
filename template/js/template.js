function make_slides(f) {
    var slides = {};

    slides.i0 = slide({
	name : "i0",
	start: function() {
	    exp.startT = Date.now();
	    $('#instruct-text > #1').text("some objects");
	    $('#instruct-text > #2').text("5");
	}
    });

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

    slides.sound_check = slide({
	name: "sound_check",
	start: function() {
	    exp.sound_word = _.sample(['tiger', 'evergreen']);
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

    slides.trials = slide({
	name: "trials",
	present: exp.trials_data,
	present_handle: function(stim) {
	    this.stim = stim;
	    function speech_bubble(x, y) {
		return "M"+x+","+y+"c22.108,0,40.03,12.475,40.03,27.862c0,15.387,-17.922,27.862,-40.03,27.862c-6.931,0,-13.449,-1.227,-19.134,-3.384c-11.22,4.224,-26.539,12.202,-26.539,12.202c0,0,9.989,-5.655,14.107,-12.521c1.052,-1.755,1.668,-3.595,2.021,-5.362c-6.51,-4.955,-10.485,-11.553,-10.485,-18.797c0,-15.387,17.922,-27.862,40.03,-27.862m0,2.22";
	    }
	    
	    if (stim.type == "trial") {
		$('#trial').show();
		$('#response').hide();
		$('#identification').hide();
		$('.err').hide();

		$('.button').hide();
		$('#testStatement').text('When you enter the lab, you see that there is a scientist already working in there. He says: ');
		if (stim.sound) {
		    exp.sound = new Audio('../_shared/audio/'+stim.sound+'.mp3');
		}

		const paper = new Raphael(document.getElementById('paper'), 800, 450);
		exp.paper = paper;
		const man = paper.image('../_shared/images/man.png', 0,0,250,430);
		
		let demoItem;
		if (stim.singular.toLowerCase() === 'blicket') {
		    demoItem = paper.path(objectPaths[stim.shape](270,80)).attr("fill", stim.color);
		}
		else {
		    demoItem = paper.image('../_shared/images/'+stim.image, 230, 30, 80, 80);
		}

		function demo(accidental) {
		    if (!accidental) {
			const pedagogical = new Audio('../_shared/audio/pedagogical.m4a');
			pedagogical.play();
			$('#utterance').text('Look at this!');
		    }
		    if (stim.sound) {
			if (accidental) {
			    demoItem.animate({path:objectPaths[stim.shape](270,380)}, 1000, 'linear', function() {
				exp.sound.play();
				$('.button').show();
			    });
			} else {
			    setTimeout(function() {
				const pointer = paper.image('../_shared/images/pointer.png', 600, 100, 100, 100);
				pointer.animate({x:230, y:90}, 1000, 'linear');
				setTimeout(function() {
				    exp.sound.play();
				    $('.button').show();
				}, 1000);
			    }, 1500);
			}
		    } else {
			man.remove();
			let x;
			if (stim.singular.toLowerCase() == 'dax') {
			    x = 300;
			} else {
			    x = 230;
			}
			demoItem.animate({width: 320, height: 320, x: x}, 1000, 'linear', function() {
			    const pointer = paper.image('../_shared/images/pointer.png', 600, 100, 100, 100).rotate(270);
			    function animatePointer() {
				$('.button').show();
				pointer.animate({x:600, y:0}, 500, 'linear', function() {
				    pointer.animate({x:600, y:100}, 500, 'linear', animatePointer);
				});
				
			    }
			    animatePointer();
			});
		    }
		}
		
		if (stim.trialType == "pedagogical") {
		    $('#utterance').text('This is a '+stim.singular.toLowerCase()+'.')
		    const button = paper.path();
		    const bubbleText = '(Click on the speech bubble when you are ready.)';
		    const itemId = new Audio('../_shared/audio/'+stim.singular.toLowerCase()+'Id.m4a');
		    itemId.play();
		    setTimeout(function() {
			$('#utterance').text('Now I have something to show you. Are you ready?');
			$('#instruct').show();
			const readyPedagogical = new Audio('../_shared/audio/readyPedagogical.m4a');
			readyPedagogical.play();
			const speech = paper.set();
			setTimeout(function() {
			    speech.push(paper.path(speech_bubble(600, 120)).attr({"stroke": 2, "fill": '#fcfac2'}));
			    speech.push(paper.text(600,150, "I'm ready!").attr({"font-size": 14}));
			    speech.mouseover(function() {
				speech.attr('cursor', 'pointer');
			    })
			    $('#instruct').text(bubbleText);
			    speech.click(function() {
				speech.remove();
				demo(false);
				$('#instruct').hide();
			    });
			}, 4000);
		    }, 2000);
		}
		else if (stim.trialType == "pedageneric") {
		    $('#utterance').text('This is a '+stim.singular.toLowerCase()+'.')
		    const button = paper.path();
		    const bubbleText = '(Click on the speech bubble when you are ready.)';
		    const itemId = new Audio('../_shared/audio/'+stim.singular.toLowerCase()+'Id.m4a');
		    itemId.play();
		    setTimeout(function() {
			$('#utterance').text('Now I have something to tell you. Are you ready?');
			const readyGeneric = new Audio('../_shared/audio/readyGeneric.m4a');
			readyGeneric.play();
			const speech = paper.set();
			setTimeout(function() {
			    $('#instruct').text(bubbleText);
			    speech.push(paper.path(speech_bubble(600, 120)).attr({"stroke": 2, "fill": '#fcfac2'}));
			    speech.push(paper.text(600,150, "I'm ready!").attr({"font-size": 14}));
			    speech.mouseover(function() {
				speech.attr('cursor', 'pointer');
			    })
			    $('#instruct').text(bubbleText);

			    speech.click(function() {
				speech.remove();
				setTimeout(function() {
				    $('.button').show();
				}, 2000);
				if (stim.sound) {
				    $('#utterance').text(stim.plural+' '+stim.sound+'!');
				} else {
				    $('#utterance').text(stim.plural+' '+stim.featurePlural+'!');
				}
				$('#instruct').hide();
				const genericUtterance = new Audio('../_shared/audio/'+stim.singular.toLowerCase()+'Generic.m4a');
				genericUtterance.play();
			    });
			}, 4000);
		    }, 2000);
		} else if (stim.trialType == "accidental") {
		    $('#utterance').text('Oh! This is a '+stim.singular.toLowerCase()+'.')
		    const accidentalUtterance = new Audio('../_shared/audio/'+stim.singular.toLowerCase()+'Accidental.m4a');
		    accidentalUtterance.play();
		    const cover = paper.rect(230, 30, 90, 90).attr({"fill": '#a3a399'});
		    const label = paper.set();
		    label.push(paper.rect(315, 50, 50, 25).attr({"fill": '#fcfac2'}));
		    label.push(paper.text(340, 65, stim.singular));
		    setTimeout(function() {
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
			cover.remove();
			label.remove();
			setTimeout(function() {
			    demo(true);
			}, 1000);
		    }, 3000);
		} else if (stim.trialType == "generic") {
		    if (stim.sound) {
			$('#utterance').text(stim.plural+' '+stim.sound+'!');
		    } else {
			$('#utterance').text(stim.plural+' '+stim.featurePlural+'!');
		    }
		    $('#paper').hide();
		    const genericUtterance = new Audio('../_shared/audio/'+stim.singular.toLowerCase()+'Generic.m4a');
		    genericUtterance.play();
		    setTimeout(function() {
			$('.button').show();
		    }, 1000)
		}
	    } else if (stim.type == "response") {
		$('#trial').hide();
		$('#response').show();
		$('#identification').hide();
		if (stim.sound) {
		    $('.prompt').html('Imagine that you have another '+stim.singular.toLowerCase()+'. What are the chances that it '+stim.sound+'s?');
		}
		else {
		    $('.prompt').html('Imagine that you have another '+stim.singular.toLowerCase()+'. What are the chances that it '+stim.featureSingular+'?');
		}
		this.init_sliders();
		exp.sliderPost = null;
	    } else if (stim.type == "id") {
		$('#trial').hide();
		$('#response').hide();
		$('#identification').show();
		$('.err').hide();
		$('.button').show();
		$('#instructId').text('Which one of these other ones is a '+stim.singular.toLowerCase()+'?');
		const paper = new Raphael(document.getElementById('paperId'), 800, 450);
		exp.distractorPaper = paper;
		const distractors = paper.set();
		const positions = _.shuffle([[300,200],[500,200],[300,300],[500,300]])
		let activeItem;
		exp.correctId = false;
		exp.distractorClicks = 0;
		exp.selected = null;
		const expScope = this;
		let selection = null;

		stim.distractors.forEach(function(distractor, i) {
		    if (stim.image) {
			distractors.push(paper.image('../_shared/images/'+distractor, positions[i+1][0]-50, positions[i+1][1]-50, 80, 80).click(function() {
			    exp.distractorClicks ++;
			    exp.correctId = false;
			    exp.selected = distractor;
			    if (selection !== null) {
				selection.remove();
			    }
			    selection = paper.rect(positions[i+1][0]-50, positions[i+1][1]-50, 90, 90);
			}));
		    } else {
			distractors.push(paper.path(objectPaths[distractor.shape](positions[i+1][0], positions[i+1][1])).attr("fill", distractor.color).click(function() {
			    exp.distractorClicks ++;
			    exp.correctId = false;
			    exp.selected = distractor;
			    if (selection !== null) {
				selection.remove();
			    }
			    selection = paper.rect(positions[i+1][0]-50, positions[i+1][1]-50, 90, 90);			}));
		    }
		});
		if (stim.image) {
		    activeItem = paper.image('../_shared/images/'+stim.image, positions[0][0]-50, positions[0][1]-50, 80, 80);
		} else {
		    activeItem = paper.path(objectPaths[stim.shape](positions[0][0], positions[0][1])).attr("fill", stim.color);
		}
		activeItem.click(function() {
		    exp.correctId = true;
		    exp.selected = "correct";
		    if (selection !== null) {
			selection.remove();
		    }
		    selection = paper.rect(positions[0][0]-50, positions[0][1]-50, 90, 90);		});
	    }
	},
	init_sliders : function() {
	    utils.make_slider("#single_slider", function(event, ui) {
		exp.sliderPost = ui.value;
	    });
	},
	button: function() {
	    if (this.stim.type == "response") {
		if (exp.sliderPost === null) {
		    $('.err').show();
		} else {
		    exp.data_trials.push(_.extend(this.stim, {response: exp.sliderPost}));
		    _stream.apply(this);
		}
	    } else if (this.stim.type == "trial") {
		_stream.apply(this);
		if (exp.paper) {
		    exp.paper.remove();
		}
	    } else if (this.stim.type == "id") {
		if (exp.selected === null) {
		    $('.err').text('Please select a choice above.')
		    $('.err').show();
		} else {
		    exp.data_trials.push(_.extend(this.stim, {distractorClicks: exp.distractorClicks, selected: exp.selected, correctId: exp.correctId}));
		    _stream.apply(this);
		    if (exp.distractorPaper) {
			exp.distractorPaper.remove();
		    }
		}
	    }
	}
    })

    slides.attention_check = slide({
	name: "attention_check",
	start: function() {
	    $('.err').hide();
	},
	button: function() {
	    if ($('#attention_check_response').val() == '') {
		$('.err').show()
	    }
	    else {
		exp.attention_check = $('#attention_check_response').val();
		exp.go();
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
		"trials" : exp.data_trials,
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

/// init ///
function init() {
    exp.condition = _.sample(["accidental", "pedagogical", "pedageneric", "generic"]); //can randomize between subject conditions here
    exp.system = {
	Browser : BrowserDetect.browser,
	OS : BrowserDetect.OS,
	screenH: screen.height,
	screenUH: exp.height,
	screenW: screen.width,
	screenUW: exp.width
    };
    exp.data_trials = [];

    //blocks of the experiment:
    exp.structure=[
	'i0',
	'sound_check',
	'introduction',
	'trials',
	'subj_info', 'thanks'
    ];

    const trials = _.shuffle([
	_.extend(
	    {
		distractors: drag_and_drop.objects.slice(1,4)
	    },
	    drag_and_drop.objects[0]
	),
	drag_and_drop.biologics[0],
	drag_and_drop.biologics[1]    
    ])

    exp.trials_data = [];
    trials.forEach(function(trial) {
	exp.trials_data = exp.trials_data.concat([ 
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
	if (exp.condition != "generic") {
	    exp.trials_data = exp.trials_data.concat([
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
