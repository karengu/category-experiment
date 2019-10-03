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
		$('#demoButton').show();
		$('#demoPaper').show();
		$('.button').hide();
		$('#testStatement').text('When you enter the lab, you see that there is a scientist already working in there. He says: ');
		$('#utterance').text('This is a '+stim.singular.toLowerCase()+'. Select another '+stim.singular.toLowerCase()+' from the ones below.')

		exp.sound = new Audio('../_shared/audio/'+stim.sound+'.mp3');
		exp.distractorClicks = 0;

		const paper = new Raphael(document.getElementById('paper'), 800, 450);
		const positions = _.shuffle([[300,200],[500,200],[300,300],[500,300]])
		exp.paper = paper;
		paper.image('../_shared/images/man.png', 0,0,250,430);
		const button = paper.path();
		var demoItem = paper.path(objectPaths[stim.shape](400,100)).attr("fill", stim.color);
		var activeItem = paper.path(objectPaths[stim.shape](positions[0][0], positions[0][1])).attr("fill", stim.color);
		const distractors = paper.set();
		stim.distractors.forEach(function(distractor, i) {
		    distractors.push(paper.path(objectPaths[distractor.shape](positions[i+1][0], positions[i+1][1])).attr("fill", distractor.color).click(function() {
			exp.distractorClicks ++;
		    }));
		});
		activeItem.click(function() {
		    distractors.remove();
		    activeItem.remove();
		    if (stim.trialType == "pedagogical") {
			$('#utterance').text('Good work! Now I have something to show you.');
			const speech = paper.set();
			speech.push(paper.path(speech_bubble(600, 120)).attr({"stroke": 2, "fill": '#fcfac2'}));
			speech.push(paper.text(600,150, "I'm ready!").attr({"font-size": 14}));
			speech.mouseover(function() {
			    speech.attr('cursor', 'pointer');
			})
			speech.click(function() {
			    speech.remove();
			    $('#utterance').text("This is a "+stim.singular.toLowerCase()+". Check it out!");
			    setTimeout(function() {
				const pointer = paper.image('../_shared/images/pointer.png', 600, 100, 100, 100);
				pointer.animate({x:360, y:110}, 1000, 'linear');
				setTimeout(function() {
				    paper.customAttributes.glow = demoItem.glow();
				    exp.sound.play();
				    $('.button').show();
				    setTimeout(function() {
					paper.customAttributes.glow.remove();
				    },1000);
				}, 1000);
			    }, 1500
				      )
			});	
		    } else {
			$('#utterance').text('Good work! Now I have something to tell you.');
			const speech = paper.set();
			speech.push(paper.path(speech_bubble(600, 120)).attr({"stroke": 2, "fill": '#fcfac2'}));
			speech.push(paper.text(600,150, "I'm ready!").attr({"font-size": 14}));
			speech.mouseover(function() {
			    speech.attr('cursor', 'pointer');
			})
			speech.click(function() {
			    speech.remove();
			    $('.button').show();
			    $('#utterance').text(stim.plural+' '+stim.sound+'!');
			});
		    }
		});
	    } else if (stim.type == "response") {
		$('#trial').hide();
		$('#response').show();
		$('.prompt').html('Imagine that you have another '+stim.singular.toLowerCase()+'. What are the chances that it '+stim.sound+'s?');
		this.init_sliders();
		exp.sliderPost = null;
	    } },
	init_sliders : function() {
	    utils.make_slider("#single_slider", function(event, ui) {
		exp.sliderPost = ui.value;
	    });
	},
	button: function() {
	    if (exp.paper) {
		exp.paper.remove();
	    }
	    if (this.stim.type == "response") {
		if (exp.sliderPost === null) {
		    $('.err').show();
		} else {
		    exp.data_trials.push(_.extend(this.stim, {response: exp.sliderPost, distractorClicks: exp.distractorClicks}));
		    _stream.apply(this);
		}
	    } else if (this.stim.type == "trial") {
		_stream.apply(this);
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
    exp.condition = _.sample(["pedagogical","generic"]); //can randomize between subject conditions here
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

    exp.trials_data = [
	_.extend(
	    {
		trialType: exp.condition,
		type: "trial",
		distractors: drag_and_drop.objects.slice(1,4)
	    },
	    drag_and_drop.objects[0],
	),
	_.extend(
	    {type: "response"},
	    drag_and_drop.objects[0],
	)
    ]

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
