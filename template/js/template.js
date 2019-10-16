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
		const bubbleText = '(Click on the speech bubble when you are ready.)';

		
		let demoItem;
		if (stim.singular.toLowerCase() === 'blicket') {
		    demoItem = paper.path(objectPaths[stim.shape](270,100)).attr("fill", stim.color);
		}
		else {
		    demoItem = paper.image('../_shared/images/'+stim.image, 250, 60, 80, 80);
		}

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
			item.animate({width: 320, height: 320, x: xcoord, y:30}, 1000, 'linear', function() {
			    if (!accidental) {
				if (pointerLeft) {
				    paper.pointer = paper.image('../_shared/images/pointer.png', 320, 100, 100, 100).rotate(90);
				    function animatePointer() {
					paper.pointer.animate({x:320, y:0}, 500, 'linear', function() {
					    paper.pointer.animate({x:320, y:100}, 500, 'linear', animatePointer);
					});
					
				    }
				    animatePointer();
				} else {
				    paper.pointer = paper.image('../_shared/images/pointer.png', 600, 100, 100, 100).rotate(270);
				    function animatePointer() {
					paper.pointer.animate({x:600, y:0}, 500, 'linear', function() {
					    paper.pointer.animate({x:600, y:100}, 500, 'linear', animatePointer);
					});
					
				    }
				    animatePointer();
				}
			    }
			});
		    }
		}

		function showPedagogical(item, xcoord, callback, pointerLeft) {
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
			    demo(false, item, xcoord, pointerLeft);
			    $('#instruct').hide();
			    setTimeout(function() {
				callback();
			    }, 4000);
			});
		    }, 4000);
		}

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
		
		if (stim.trialType == "pedagogical") {
		    $('#utterance').text('This is a '+stim.singular.toLowerCase()+'.')
		    const button = paper.path();
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
				let x;
				if (stim.singular.toLowerCase() == 'dax') {
				    x = 300;
				} else {
				    x = 230;
				}
				demo(false, demoItem, x);
				$('#instruct').hide();
			    });
			}, 4000);
		    }, 2000);
		}
		else if (stim.trialType == "pedageneric") {
		    $('#utterance').text('This is a '+stim.singular.toLowerCase()+'.')
		    const button = paper.path();
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
		    const cover = paper.image('../_shared/images/cover.png', 210, -40, 150, 230);
		    const label = paper.set();
		    label.push(paper.rect(305, 50, 50, 25).attr({"fill": '#fcfac2'}));
		    label.push(paper.text(330, 65, stim.singular));
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
			    let x;
			    if (stim.sound) {
				x = 270;
			    } else if (stim.singular.toLowerCase() == 'dax') {
				x = 300;
			    } else {
				x = 230;
			    }
			    demo(true, demoItem, x);
			}, 1000);
		    }, 3000);
		} else if (stim.trialType == "2accidental") {
		    const accidentalUtterance = new Audio('../_shared/audio/'+stim.plural.toLowerCase()+'Accidental.m4a');
		    accidentalUtterance.play();
		    let demoItem2;
		    $('.button').hide();
		    if (stim.singular.toLowerCase() === 'blicket') {
			demoItem2 = paper.path(objectPaths[stim.shape](450,100)).attr("fill", stim.color);
		    }
		    else {
			demoItem2 = paper.image('../_shared/images/'+stim.image, 410, 60, 80, 80);
		    }

		    
		    $('#utterance').text('Oh! These are two '+stim.plural.toLowerCase()+'.');
		    const cover1 = paper.image('../_shared/images/cover.png', 210, -40, 150, 230);
		    const label1 = paper.set();
		    label1.push(paper.rect(305, 50, 50, 25).attr({"fill": '#fcfac2'}));
		    label1.push(paper.text(330, 65, stim.singular));
		    const cover2 = paper.image('../_shared/images/cover.png', 390, -40, 150, 230);
		    const label2 = paper.set();
		    label2.push(paper.rect(485, 50, 50, 25).attr({"fill": '#fcfac2'}));
		    label2.push(paper.text(510, 65, stim.singular));
		    setTimeout(function() {
			let x;
			let item;
			if (stim.sound) {
			    item = demoItem;
			    cover1.remove();
			    label1.remove();
			    x = 270;
			} else {
			    item = demoItem2;
			    cover2.remove();
			    label2.remove();
			    if (stim.singular.toLowerCase() == 'dax') {
				x = 330;
			    } else {
				x = 350;
			    }
			}
			showAccidental(item, x, function() {
			    let x;
			    let item;
			    if (stim.sound) {
				item = demoItem2;
				setTimeout(function() {
				    man.animate({x:150}, 1000, 'linear');
				    demoItem.remove();
				}, 2000);
				setTimeout(function() {
				    cover2.remove();
				    label2.remove();
				}, 3000);
				x = 460;
			    } else {
				item = demoItem;
				setTimeout(function() {
				    cover1.remove();
				    label1.remove();
				    demoItem2.remove();
				}, 3000);
				if (stim.singular.toLowerCase() == 'dax') {
				    x = 330;
				} else {
				    x = 350;
				}
			    }
			    setTimeout(function() {
				showAccidental(item, x, function() {
				    $('.button').show();
				});
			    }, 3000);
			});
		    }, 3000);
		} else if (stim.trialType == "2pedagogical") {
		    const pedagogicalUtterance = new Audio('../_shared/audio/'+stim.plural.toLowerCase()+'Id.m4a');
		    pedagogicalUtterance.play();
		    let demoItem2;
		    if (stim.singular.toLowerCase() === 'blicket') {
			demoItem2 = paper.path(objectPaths[stim.shape](370,100)).attr("fill", stim.color);
		    }
		    else {
			demoItem2 = paper.image('../_shared/images/'+stim.image, 330, 60, 80, 80);
		    }
		    $('#utterance').text('These are two '+stim.plural.toLowerCase()+'.');
		    $('.button').hide();
		    setTimeout(function() {
			let x;
			let item;
			if (stim.sound) {
			    item = demoItem;
			    x = 270;
			} else {
			    item = demoItem2
			    if (stim.singular.toLowerCase() == 'dax') {
				x = 330;
			    } else {
				x = 350;
			    }
			}
			showPedagogical(item, x, function() {
			    let x;
			    let item;
			    if (stim.sound) {
				item = demoItem2;
				if (paper.pointer) {
				    paper.pointer.remove();
				}
				demoItem.remove();
				man.animate({x:80}, 1000, 'linear');
				x = 370;
			    } else {
				item = demoItem;
				if (paper.pointer) {
				    paper.pointer.remove();
				}
				demoItem2.remove();
				if (stim.singular.toLowerCase() == 'dax') {
				    x = 330;
				} else {
				    x = 350;
				}
			    }
			    showPedagogical(item, x, function() {
				$('.button').show();
			    }, stim.singular.toLowerCase() === 'fep');
			}, stim.singular.toLowerCase() === 'fep');
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
		    }, 2000)
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
		    exp.data_trials.push(_.extend(this.stim, {response: exp.sliderPost, condition: exp.condition}));
		    _stream.apply(this);
		}
	    } else if (this.stim.type == "trial") {
		_stream.apply(this);
		if (exp.paper) {
		    if (exp.paper.pointer) {
			exp.paper.pointer.remove();
		    }
		    exp.paper.remove();
		}
	    }
	}
    });

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
	    if (exp.selected === null) {
		$('.err').show();
	    } else {
		exp.data_trials.push(_.extend(this.stim, {distractorClicks: exp.distractorClicks, selected: exp.selected, correctId: exp.correctId, condition: exp.condition}));
		_stream.apply(this);
	    }
	}
    });

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
    exp.condition = _.sample(["2pedagogical", "2accidental"]); //can randomize between subject conditions here
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
	'identification',
	'subj_info', 'thanks'
    ];

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
    });

    exp.id_trials = [];
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
