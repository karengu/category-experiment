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

  slides.instructions = slide({
    name : "instructions",
      start: function() {
	  if (exp.pass) {
	      exp.go();
	  }
	  else {
	      if (exp.pass == false) {
		  $('#failedComp').text('Sorry, you answered one or more of the questions incorrectly. Please read the instructions carefully and try again.');
	      }
      $('#instButton').hide();
      setTimeout(function() {
        $('#instButton').show();
      }, 5000);
	  }
    },
    button : function() {
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  slides.check_sound = slide({
    name: "check_sound",
    start: function() {
      exp.tiger = new Audio('../_shared/audio/tiger.mp3');
      $('.err').hide();
    },
    test_sound: function() {
      exp.tiger.play();
    },
    button: function() {
      if ($('#sound_response').val() == '') {
        $('.err').show();
      }
      else {
        response = $('#sound_response').val();
        exp.check_sound = response;
        exp.go();
      }
    }
  });

  slides.single_trial = slide({
    name: "single_trial",
    start: function() {
      $(".err").hide();
      $(".display_condition").html("You are in " + exp.condition + ".");
    },
    button : function() {
      response = $("#text_response").val();
      if (response.length == 0) {
        $(".err").show();
      } else {
        exp.data_trials.push({
          "trial_type" : "single_trial",
          "response" : response
        });
        exp.go(); //make sure this is at the *end*, after you log your data
      }
    },
  });

  slides.one_slider = slide({
    name : "one_slider",

    /* trial information for this block
     (the variable 'stim' will change between each of these values,
      and for each of these, present_handle will be run.) */
    present : [
      {subject: "dog", object: "ball"},
      {subject: "cat", object: "windowsill"},
      {subject: "bird", object: "shiny object"},
    ],

    //this gets run only at the beginning of the block
    present_handle : function(stim) {
      $(".err").hide();

      this.stim = stim; //I like to store this information in the slide so I can record it later.


      $(".prompt").html(stim.subject + "s like " + stim.object + "s.");
      this.init_sliders();
      exp.sliderPost = null; //erase current slider value
    },

    button : function() {
      if (exp.sliderPost == null) {
        $(".err").show();
      } else {
        this.log_responses();

        /* use _stream.apply(this); if and only if there is
        "present" data. (and only *after* responses are logged) */
        _stream.apply(this);
      }
    },

    init_sliders : function() {
      utils.make_slider("#single_slider", function(event, ui) {
        exp.sliderPost = ui.value;
      });
    },

    log_responses : function() {
      exp.data_trials.push({
        "trial_type" : "one_slider",
        "response" : exp.sliderPost
      });
    }
  });

  slides.multi_slider = slide({
    name : "multi_slider",
    present : _.shuffle([
      {"critter":"Wugs", "property":"fur"},
      {"critter":"Blicks", "property":"fur"}
    ]),
    present_handle : function(stim) {
      $(".err").hide();
      this.stim = stim; //FRED: allows you to access stim in helpers

      this.sentence_types = _.shuffle(["generic", "negation", "always", "sometimes", "usually"]);
      var sentences = {
        "generic": stim.critter + " have " + stim.property + ".",
        "negation": stim.critter + " do not have " + stim.property + ".",
        "always": stim.critter + " always have " + stim.property + ".",
        "sometimes": stim.critter + " sometimes have " + stim.property + ".",
        "usually": stim.critter + " usually have " + stim.property + "."
      };

      this.n_sliders = this.sentence_types.length;
      $(".slider_row").remove();
      for (var i=0; i<this.n_sliders; i++) {
        var sentence_type = this.sentence_types[i];
        var sentence = sentences[sentence_type];
        $("#multi_slider_table").append('<tr class="slider_row"><td class="slider_target" id="sentence' + i + '">' + sentence + '</td><td colspan="2"><div id="slider' + i + '" class="slider">-------[ ]--------</div></td></tr>');
        utils.match_row_height("#multi_slider_table", ".slider_target");
      }

      this.init_sliders(this.sentence_types);
      exp.sliderPost = [];
    },

    button : function() {
      if (exp.sliderPost.length < this.n_sliders) {
        $(".err").show();
      } else {
        this.log_responses();
        _stream.apply(this); //use _stream.apply(this); if and only if there is "present" data.
      }
    },

    init_sliders : function(sentence_types) {
      for (var i=0; i<sentence_types.length; i++) {
        var sentence_type = sentence_types[i];
        utils.make_slider("#slider" + i, this.make_slider_callback(i));
      }
    },
    make_slider_callback : function(i) {
      return function(event, ui) {
        exp.sliderPost[i] = ui.value;
      };
    },
    log_responses : function() {
      for (var i=0; i<this.sentence_types.length; i++) {
        var sentence_type = this.sentence_types[i];
        exp.data_trials.push({
          "trial_type" : "multi_slider",
          "sentence_type" : sentence_type,
          "response" : exp.sliderPost[i]
        });
      }
    },
  });

  slides.vertical_sliders = slide({
    name : "vertical_sliders",
    present : _.shuffle([
      {
        "bins" : [
          {
            "min" : 0,
            "max" : 10
          },
          {
            "min" : 10,
            "max" : 20
          },
          {
            "min" : 20,
            "max" : 30
          },
          {
            "min" : 30,
            "max" : 40
          },
          {
            "min" : 40,
            "max" : 50
          },
          {
            "min" : 50,
            "max" : 60
          }
        ],
        "question": "How tall is tall?"
      }
    ]),
    present_handle : function(stim) {
      $(".err").hide();
      this.stim = stim;

      $("#vertical_question").html(stim.question);

      $("#sliders").empty();
      $("#bin_labels").empty();

      $("#sliders").append('<td> \
            <div id="slider_endpoint_labels"> \
              <div class="top">likely</div> \
              <div class="bottom">unlikely</div>\
            </div>\
          </td>')
      $("#bin_labels").append('<td></td>')

      this.n_sliders = stim.bins.length;
      for (var i=0; i<stim.bins.length; i++) {
        $("#sliders").append("<td><div id='vslider" + i + "' class='vertical_slider'>|</div></td>");
        $("#bin_labels").append("<td class='bin_label'>" + stim.bins[i].min + " - " + stim.bins[i].max + "</td>");
      }

      this.init_sliders(stim);
      exp.sliderPost = [];
    },

    button : function() {
      if (exp.sliderPost.length < this.n_sliders) {
        $(".err").show();
      } else {
        this.log_responses();
        _stream.apply(this); //use _stream.apply(this); if and only if there is "present" data.
      }
    },

    init_sliders : function(stim) {
      for (var i=0; i<stim.bins.length; i++) {
        utils.make_slider("#vslider" + i, this.make_slider_callback(i), "vertical");
      }
    },
    make_slider_callback : function(i) {
      return function(event, ui) {
        exp.sliderPost[i] = ui.value;
      };
    },
    log_responses : function() {
      for (var i=0; i<this.stim.bins.length; i++) {
        exp.data_trials.push({
          "trial_type" : "vertical_slider",
          "question" : this.stim.question,
          "response" : exp.sliderPost[i],
          "min" : this.stim.bins[i].min,
          "max" : this.stim.bins[i].max
        });
      }
    },
  });

  slides.practice = slide({
    name: "practice",
    start: function() {
      $('#practiceFinished').hide();
      $('#practicePaper').show();

      exp.squeak = new Audio('../_shared/audio/squeak.mp3');
      exp.ring = new Audio('../_shared/audio/ring.mp3');
      exp.white = new Audio('../_shared/audio/white.mp3');

      var paper = new Raphael(document.getElementById('practicePaper'), 800, 550);
      exp.practicePaper = paper;
	paper.customAttributes.testButtonSqueak = drag_and_drop.makeButton(400, 450, "#49e575", "Test Squeaking", paper, 120, 30);
	paper.customAttributes.points = 0;
	paper.customAttributes.pointsDisplay = paper.text(400,400, 'Practice points: '+paper.customAttributes.points).attr({"font-size": 16});
	var onClick = function() {
	    if (paper.customAttributes.pointsExplanation) {
		paper.customAttributes.pointsExplanation.remove();
	    }
	    if (this.data("id") == demoIndex) {
        if (paper.customAttributes.testItem) {
          paper.customAttributes.glow.remove();
        }
	if (paper.customAttributes.arrow) {
          paper.customAttributes.arrow.remove();
        }
        paper.customAttributes.testItem = this;
		paper.customAttributes.glow = this.glow();
	    }
      }
      var onTestSqueak = function() {
        const testItem = paper.customAttributes.testItem;
          if (testItem) {
	      if (paper.customAttributes.arrow) {
          paper.customAttributes.arrow.remove();
        }
	  exp.squeak.pause();
	  exp.squeak.currentTime = 0;
	  exp.ring.pause();
	  exp.ring.currentTime = 0;
	  exp.white.pause();
	  exp.white.currentTime = 0;
	  if (testItem.data("id") % 2 == 0) {
              exp.squeak.play();
	      paper.customAttributes.points += 3;
	      paper.customAttributes.pointsDisplay.remove();
	      	paper.customAttributes.pointsDisplay = paper.text(400, 400, "Practice points: "+paper.customAttributes.points).attr({"font-size": 16, "opacity": 0}).animate({"opacity": 1, "font-weight": "bold"}, 1000, function() {
		      this.animate({"font-weight": "normal"}, 2000)
		  });
	      paper.customAttributes.pointsExplanation = paper.text(400, 500, "You earned 3 practice points because the object squeaked.").attr({"font-size": 14});
          }
	  else {
	      exp.white.play();
	      paper.customAttributes.pointsExplanation = paper.text(400, 500, "You did not earn any points because the object did not squeak.").attr({"font-size": 14});
	  }
	  if (demoIndex == 1) {
	    paper.customAttributes.demoText.remove();
            paper.customAttributes.demoText = paper.set();
	    paper.customAttributes.demoText.push(paper.rect(20, 40, 770, 140).attr({fill: "gray", "fill-opacity": 0, "stroke-width": 0}));
	    paper.customAttributes.demoText.push(paper.text(400, 80, "Now you will switch to testing ringing.").attr({"font-size": 18, "fill": "white", "font-weight": "bold"}));
	    paper.customAttributes.demoText.push(paper.text(400, 120, "To switch to testing ringing, click on the Switch to ringing button below.").attr({"font-size": 14, "fill": "white"}));
	    paper.customAttributes.demoText.forEach(function(elem) {
		setTimeout(function() {elem.animate({"fill-opacity": 1, "stroke-opacity": 1}, 1000, "easeInOut")}, 1200);
	    });
		paper.customAttributes.switchButton = drag_and_drop.makeButton(600, 450, "#6699ff", "Switch to Ringing", paper, 150, 30);
		paper.customAttributes.switchButton.buttonSet.forEach(function(elem) {
		    elem.click(function() {
			if (demoIndex == 1) {
		    demoIndex = 2;
			    demo(demoIndex);
			}
			paper.customAttributes.pointsExplanation.remove();
			if (paper.customAttributes.arrow) {
          paper.customAttributes.arrow.remove();
        }
		    });
		     paper.customAttributes.switchButton.buttonSet.mousedown(function() {
	paper.customAttributes.switchButton.button.animate({"fill":"#287f41"});
      });
      paper.customAttributes.switchButton.buttonSet.mouseup(function() {
	paper.customAttributes.switchButton.button.animate({"fill": "#49e575"});
      });
		});
	    }
	    else {
		demoIndex ++;
		demo(demoIndex);
	    }
	    paper.customAttributes.testItem = null;
	    testItem.remove();
	  paper.customAttributes.glow.remove();
	}
	};
      var onTestRing = function() {
	const testItem = paper.customAttributes.testItem;
	  if (testItem) {
	      if (paper.customAttributes.arrow) {
          paper.customAttributes.arrow.remove();
        }
	  exp.squeak.pause();
	  exp.squeak.currentTime = 0;
	  exp.ring.pause();
	  exp.ring.currentTime = 0;
	  exp.white.pause();
	  exp.white.currentTime = 0;
	  if (testItem.data("id") == 1 || testItem.data("id") == 2) {
	      exp.ring.play();
	       paper.customAttributes.points += 1;
	      paper.customAttributes.pointsDisplay.remove();
	      	paper.customAttributes.pointsDisplay = paper.text(400, 400, "Practice points: "+paper.customAttributes.points).attr({"font-size": 16, "opacity": 0}).animate({"opacity": 1, "font-weight": "bold"}, 1000, function() {
		      this.animate({"font-weight": "normal"}, 2000)
		});
	      paper.customAttributes.pointsExplanation = paper.text(400, 500, "You earned 1 practice point because the object rang.").attr({"font-size": 14});
	  }
	  else {
	      exp.white.play();
	      	      paper.customAttributes.pointsExplanation = paper.text(400, 500, "You did not earn any points because the object did not ring.").attr({"font-size": 14});
	  }
	    if (demoIndex == 3) {
		setTimeout(finishedPractice, 1200);;
	  }
	    else {
	      demoIndex ++;
	      demo(demoIndex);
	    }
	    paper.customAttributes.testItem = null;
	    testItem.remove();
	  paper.customAttributes.glow.remove();
	}
      };
      var finishedPractice = function() {
	$('#practiceFinished').show();
	if (paper.customAttributes.demoText) {
	  paper.customAttributes.demoText.remove();
	}
	paper.customAttributes.demoText = paper.set();
	paper.customAttributes.demoText.push(paper.rect(20, 40, 770, 140).attr({fill: "gray", "fill-opacity": 0, "stroke-width": 0}));
	paper.customAttributes.demoText.push(paper.text(400, 90, "Now that you know how the laboratory materials work,").attr({"font-size": 16, "fill": "white", "font-weight": "bold"}));
	paper.customAttributes.demoText.push(paper.text(400, 120, "hit the Continue button at the bottom of the screen to continue to the lab.").attr({"font-size": 16, "fill": "white", "font-weight": "bold"}));
	paper.customAttributes.demoText.forEach(function(elem) {
	  elem.animate({"fill-opacity": 1, "stroke-opacity": 1}, 1000, "easeInOut");
	});
      }
      var items = [
	drag_and_drop.objects[5],
	drag_and_drop.objects[2],
	drag_and_drop.objects[3],
	drag_and_drop.objects[4]
      ];
      var createNewItem = function(i) {
	var x = 100+200*i;
	var y = 250;
	var item = paper.path(objectPaths[items[i].shape](x,y)).attr("fill", items[i].color);
	item.data("id", i);
	item.data("x", x);
	item.data("y", y);
	item.click(onClick);
	return item;
      }
	var demo = function(i) {
	var description = "";
	if (i == 0) {
	  var description = "This object squeaks.";
	}
	else if (i == 1) {
	  var description = "This object does not squeak.";
	}
	else if (i == 2) {
	  var description = "This object rings.";
	}
	else if (i == 3) {
	  var description = "This object does not ring.";
	}
	if (paper.customAttributes.demoText) {
	  paper.customAttributes.demoText.remove();
	}
	paper.customAttributes.demoText = paper.set();
	  paper.customAttributes.demoText.push(paper.rect(20, 40, 770, 140).attr({fill: "gray", "fill-opacity": 0, "stroke-width": 0}));
	paper.customAttributes.demoText.push(paper.text(400, 70, description).attr({"font-size": 18, "fill": "white", "font-weight": "bold"}));
	paper.customAttributes.demoText.push(paper.text(400, 110, "Try testing it. To test an object,").attr({"font-size": 14, "fill": "white"}));
	  paper.customAttributes.demoText.push(paper.text(400, 140, "click on it to select it and then click on the test button.").attr({"font-size": 14, "fill": "white"}));
	  if (i == 0) {
	      paper.customAttributes.demoText.forEach(function(elem) {
		  elem.animate({"fill-opacity": 1, "stroke-opacity": 1}, 1000, "easeInOut");
	      });
	      const x = 100+200*i
	      paper.customAttributes.arrow = paper.path("M"+x+",185 v40").attr({'arrow-end': 'classic-wide-long', "stroke-width": 4});
	      setTimeout(function() {paper.customAttributes.arrow.remove()}, 5000);
	  }
	      else {
	paper.customAttributes.demoText.forEach(function(elem) {
	    setTimeout(function() {elem.animate({"fill-opacity": 1, "stroke-opacity": 1}, 1000, "easeInOut")}, 1200);
	});
		  setTimeout(function() {
		  const x = 100+200*i
	paper.customAttributes.arrow = paper.path("M"+x+",185 v40").attr({'arrow-end': 'classic-wide-long', "stroke-width": 4});
		  }, 1200);
		  	 setTimeout(function() {paper.customAttributes.arrow.remove()}, 5000);
	      }
	     if (i == 2) {
	      	 paper.customAttributes.testButtonSqueak.buttonSet.remove();
		 paper.customAttributes.switchButton.buttonSet.remove();
var testButtonRing = drag_and_drop.makeButton(400, 450,"#e549ae", "Test Ringing", paper, 120, 30);
	      testButtonRing.buttonSet.forEach(function(elem) {elem.click(onTestRing)});
					        testButtonRing.buttonSet.mousedown(function() {
	testButtonRing.button.animate({"fill":"#841559"});
      });
      testButtonRing.buttonSet.mouseup(function() {
	testButtonRing.button.animate({"fill": "#e549ae"});
      });
	  }
      }
	  paper.customAttributes.testButtonSqueak.buttonSet.forEach(function(elem) {elem.click(onTestSqueak)});
      paper.customAttributes.testButtonSqueak.buttonSet.mousedown(function() {
	paper.customAttributes.testButtonSqueak.button.animate({"fill":"#287f41"});
      });
      paper.customAttributes.testButtonSqueak.buttonSet.mouseup(function() {
	paper.customAttributes.testButtonSqueak.button.animate({"fill": "#49e575"});
      });
	for (i = 0; i<4; i++) {
	    createNewItem(i);
	}
      var demoIndex = 0;
      demo(demoIndex);
    },
    button: function() {
      exp.go();
    }
  });

  slides.comprehension =  slide({
      name: "comprehension",
      start: function() {
	  if (exp.pass) {
	      exp.go();
	  }
      },
      button: function(e){
      if ($('#numberTimesTest').val() == "null" || $('#orderTest').val() == "null" || $('#pointsTest').val() == "null") {
        $('.err').show();
      }
      else {
          exp.pass = ($('#numberTimesTest').val() == "1" && $('#orderTest').val() == "squeakFirst" && $('#pointsTest').val() == "squeakMore" && $('input[name="sameBlicket"]:checked').val() == "false");
          exp.comprehension.push({
          "numberTimesTest": $('#numberTimesTest').val(),
	  "orderTest":  $('#orderTest').val(),
	    "pointsTest": $('#pointsTest').val(),
	    "sameBlicket": $('input[name="sameBlicket"]:checked').val(),
	  "pass": exp.pass
	  });
	exp.go();
      }
    }
  });
    
  slides.drag_and_drop = slide({
    name: "drag_and_drop",
    present: exp.randomized_trials,
    present_handle: function(stim) {
      exp.type = stim.type;

      if (stim.type == "transition") {
        $('.err').hide();
        $('#ddbutton').show();
        $('.testProb').hide();
	$('.testGeneric').hide();
        $('.testFree').hide();
        $('.explore').hide();
        $('.testReasoning').hide();
	$('.transition').show();
	$('#demoPaper').show();
	$('#testStatement').text('When you enter the lab, you notice that there is a blicket with a note next to it. The note says: ');
        if (stim.utteranceType == "generic") {
          $('#utterance').text(stim.objectNamePlural+' '+stim.property+'.');
        }
        else if (stim.utteranceType == "specific") {
          $('#utterance').text('This '+stim.objectNameSingular.toLowerCase()+' '+stim.propertySpecific+'.');
        }
        const paper = new Raphael(document.getElementById('demoPaper'), 800, 450);
        exp.paper = paper;
        var demoItem = paper.path(objectPaths[stim.shape](400,100)).attr("fill", stim.color);
        demoItem.click(function() {
          paper.customAttributes.glow = this.glow();
          paper.customAttributes.selectedItem = this;
        });
          var testButton = drag_and_drop.makeButton(400, 250, "#49e575", "Test Squeaking", paper, 120, 30);
        paper.text(400, 400, 'Try testing the '+stim.objectNameSingular.toLowerCase()+' by clicking it to select it and then clicking on the Test Squeaking button.').attr({"font-size": 16});
        testButton.buttonSet.forEach(function(component) {
          component.click(function() {
            if (paper.customAttributes.selectedItem) {
	      exp.squeak.play();
	      paper.customAttributes.glow.remove();
	    }
          });
        });
        paper.customAttributes.testItem = demoItem;
      }

      else if (stim.type == "explore") {

        $('.err').hide();
        $('#ddbutton').hide();
        $('.testProb').hide();
	$('.testGeneric').hide();
        $('.testFree').hide();
        $('.testReasoning').hide();
        $('.transition').hide();
        $('.explore').show();
	$('.reward').hide();

        this.stim = stim;
	  
	var testSequence = []; // create bins with desired proportion of successes, to be randomized below
	for (i = 0; i < stim.binSize*stim.proportionSuccess; i++) {
	  testSequence.push(true);
	}
	for (i = stim.binSize*stim.proportionSuccess; i < stim.binSize; i++) {
	  testSequence.push(false);
	}
	testSequence = _.shuffle(testSequence);
        var testSequenceIndex = 0;

	if (stim.utteranceType == "generic") {
          exp.utterance = stim.objectNamePlural+' '+stim.property+'!';
        }
        else if (stim.utteranceType == "specific") {
          exp.utterance = 'This '+stim.objectNameSingular.toLowerCase()+' '+stim.propertySpecific+'!';
	}

          var onClick = function() {
          if (paper.customAttributes.itemsTested > 0 || this.data("id") == paper.customAttributes.firstItemId) {
            if (paper.customAttributes.demoArrow) {
	      paper.customAttributes.demoArrow.remove();
	    }
            if (paper.customAttributes.testItem) {
              paper.customAttributes.glow.remove();
            }
            paper.customAttributes.testItem = this;
            paper.customAttributes.glow = this.glow();
	    exp.events.push({
	      time: Date.now(),
	      event: "selectItem",
	      itemId: this.data("id")
	    });
	  }
        }

	  var e = this;

	  const button = function() {
	      if (confirm('Are you sure you would like to move on to testing ringing?')) { // check to make sure user wants to move on
           exp.data_trials[0].itemsTested = exp.paper.customAttributes.itemsTested - 1;
	exp.data_trials[0].timeExploring = (Date.now() - exp.startExploration)/60000;
	exp.data_trials[0].events = exp.events;
	exp.data_trials[0].testResults = exp.testResults; // to store order of successful/unsuccessful test results, since order is randomized
          _stream.apply(e);
        }
	  };

        var onTest = function() {
          const testItem = paper.customAttributes.testItem;
	  if (testItem) {
	    if (paper.customAttributes.itemsTested == 0) { // demo item
	      if (testItem.data("id") == paper.customAttributes.firstItemId) {
		exp.squeak.play();
   	        exp.points += 3;
		paper.customAttributes.pointsDisplay.remove();
		  paper.customAttributes.pointsDisplay = paper.text(400, 450, "Points: "+exp.points).attr({"font-size": 16, "opacity": 0}).animate({"opacity": 1, "font-weight": "bold"}, 1000, function() {
		      this.animate({"font-weight": "normal"}, 2000)
		  });
		testItem.remove();
	        paper.customAttributes.itemsTested ++;
	        paper.customAttributes.testItem = null;
	        paper.customAttributes.glow.remove();
		  exp.events.push({time:Date.now(), event: "testDemo"});
		  $('#infoParagraph').html("<p>These are all of the blickets you have to test. You must test at least one other blicket for squeaking.</p><p>When you want to switch to test for ringing (1 pt), click the <b>Switch to Ringing</b> button. (You will not be able to test for squeaking again.)</p>");
              }
	    }
	    else {
	      if (paper.customAttributes.itemsTested == 1) { // first item
                  paper.customAttributes.switchButton = drag_and_drop.makeButton(600, 500, "#6699ff", "Switch to Ringing", paper, 150, 30);
		  paper.customAttributes.switchButton.buttonSet.forEach(function(elem) {
		      elem.click(function() {button()});
		  })
	      }
	      exp.squeak.pause();
	      exp.squeak.currentTime = 0;
	      exp.ring.pause();
	      exp.ring.currentTime = 0;
	      exp.white.pause();
	      exp.white.currentTime = 0;
	      if (testSequence[testSequenceIndex]) {
		exp.squeak.play();
	        exp.points += 3;
		paper.customAttributes.pointsDisplay.remove();
		paper.customAttributes.pointsDisplay = paper.text(400, 450, "Points: "+exp.points).attr({"font-size": 16});
	      }
	      else {
	        exp.white.play();
	      }
	      testItem.remove();
              exp.testResults.push(testSequence[testSequenceIndex]);
              testSequenceIndex ++;
              if (testSequenceIndex == stim.binSize) {
                testSequence = _.shuffle(testSequence);
                testSequenceIndex = 0;
              }
              paper.customAttributes.testItem = null;
              paper.customAttributes.glow.remove();
	      paper.customAttributes.itemsTested ++;
	      exp.events.push({time:Date.now(), event:"testItem"});
	    }
	  }
        }

	  var displayNote = function() {
	      $('#infoParagraph').html("<p>Test the blicket with the note first. To test: click on a blicket, then click <b>Test squeaking</b>.</p>");
          paper.customAttributes.demoArrow = paper.path("M100,100 v40").attr({'arrow-end': 'classic-narrow-long', "stroke-width": 4});
          paper.customAttributes.noteDisplay = paper.set();
	  paper.customAttributes.noteDisplay.push(paper.rect(120, 40, 570, 140).attr({fill: "#ffff99", "fill-opacity": 0, "stroke-width": 0}));
	      paper.customAttributes.noteDisplay.push(paper.text(400, 100, exp.utterance).attr({"font-size": 20, "fill": "black", "font-weight": "bold", "fill-opacity": 0, "stroke-opacity": 0}));
              paper.customAttributes.noteDisplay.push(paper.text(400, 160, "Click anywhere inside this box to close.").attr({"font-size": 14, "fill": "black", "fill-opacity": 0, "stroke-opacity": 0}));
	  paper.customAttributes.noteDisplay.forEach(function(elem) {
            elem.animate({"fill-opacity": 1, "stroke-opacity": 1}, 1000, "easeInOut");
            elem.click(function(elem) {paper.customAttributes.noteDisplay.remove()});
	  });
          paper.customAttributes.note.remove();
        }
	  
	// DATA COLLECTION SETUP
        exp.events = [];
        exp.testResults = [];
        exp.proportionSuccess = stim.proportionSuccess;
        exp.startExploration = Date.now();

	// CREATE SCENE
        var paper = new Raphael(document.getElementById('paper'), 800, 580);
        paper.customAttributes.itemsTested = 0;
	const platformLevel = drag_and_drop.platformLevel;
	const labelLevel = platformLevel - 15;
        exp.paper = paper;
        drag_and_drop.makeBlicketGrid(100,50,800,500, 20, paper, stim.color, stim.shape, stim.numRows);
	paper.blickets.forEach(function(blicket) {
          blicket.click(onClick);
        });
        paper.customAttributes.testButton = drag_and_drop.makeButton(400, 500, "#49e575", "Test Squeaking", paper, 120, 30);
        paper.customAttributes.testButton.buttonSet.forEach(function(component) {
          component.click(onTest);
        });
	exp.points = 0;
	paper.customAttributes.pointsDisplay = paper.text(400, 450, "Points: "+exp.points).attr({"font-size": 16});
	paper.customAttributes.firstItemId = 5;
	paper.customAttributes.testedFirstItem = false;
	// task information
    $('#infoParagraph').html("<p>These are the 20 blickets that your colleague left for you to test. First take a look at the note she left you. (Click on the yellow note to read it.)</p>");
	paper.customAttributes.note = paper.set();
	paper.customAttributes.note.push(paper.rect(100,110,80,80).attr({"fill": "#ffff99"}));
	paper.customAttributes.note.push(paper.rect(110,130, 60, 8).attr({"fill": "gray", "stroke-width": 0}));
	paper.customAttributes.note.push(paper.rect(110, 150, 60, 8).attr({"fill": "gray", "stroke-width": 0}));
	  paper.customAttributes.note.forEach(function(elem) {
	      elem.click(displayNote);
	  });
      }
	else if (stim.type == 'end') { // RINGING PHASE
	    $('#ddbutton').show();
        $('#ddbutton').text('Leave lab');

        var paper = exp.paper; // use same paper from previous trial
        $('#infoParagraph').html('Test as many '+stim.objectNamePlural.toLowerCase()+' for ringing as you would like. When you are done testing, click the <b>Leave lab</b> button at the bottom of the screen.')

	if (paper.customAttributes.noteDisplay) {
          paper.customAttributes.noteDisplay.remove();
        }
	  if (paper.customAttributes.switchButton) {
	      paper.customAttributes.switchButton.buttonSet.remove();
	  }
            exp.events = [];
	    exp.startExploration = Date.now();
        paper.customAttributes.remainderItemsTested = 0;
	var testSequence = []; // create bins with desired proportion of successes, to be randomized below
	for (i = 0; i < stim.binSize*stim.proportionSuccess; i++) {
	  testSequence.push(true);
	}
	for (i = stim.binSize*stim.proportionSuccess; i < stim.binSize; i++) {
	  testSequence.push(false);
	}
	testSequence = _.shuffle(testSequence);
        var testSequenceIndex = 0;
        var onTest = function() {
          const testItem = paper.customAttributes.testItem;
          if (testItem) {
            exp.squeak.pause();
	    exp.squeak.currentTime = 0;
	    exp.ring.pause();
	    exp.ring.currentTime = 0;
	    exp.white.pause();
	    exp.white.currentTime = 0;
            if (testSequence[testSequenceIndex]) {
	      exp.ring.play();
	      exp.points += 1;
	      paper.customAttributes.pointsDisplay.remove();
	      paper.customAttributes.pointsDisplay = paper.text(400, 450, "Points: "+exp.points).attr({"font-size": 16});
	    }
	    else {
	      exp.white.play();
	    }
	    testItem.remove();
            paper.customAttributes.testItem = null;
            paper.customAttributes.glow.remove();
	    paper.customAttributes.remainderItemsTested ++;
	    exp.events.push({time:Date.now(), event:"testRemainder"});
	  }
	};
	var remainderButton = drag_and_drop.makeButton(400, 500,"#e549ae", "Test Ringing", paper, 120, 30);
        remainderButton.buttonSet.forEach(function(component) {
          component.click(onTest);
	});
      }
      else if (stim.type == 'reward') {
        $('.err').hide();
        $('#ddbutton').hide();
        $('#ddbutton').show();
        $('#ddbutton').text('Continue');
        $('.explore').hide();
        $('.transition').hide();
        $('.testProb').hide();
        $('.testGeneric').hide();
        $('.testFree').hide();
        $('.testReasoning').hide();
        $('.reward').show();
        if (exp.points >= 10) {
          exp.payment = '$0.'+exp.points;
	}
	else {
	  exp.payment = '$0.0'+exp.points;
	}
	$('#reward').text('Congratulations! You earned '+exp.points+' points and will receive a bonus payment of '+exp.payment+'.');
      }
      else if (stim.type == 'testProb') {
        this.stim = stim;
        $('.err').hide();
        $('#ddbutton').hide();
        setTimeout(function() {
          $('#ddbutton').show();
	  $('#ddbutton').text('Continue');
        }, 2000);
        $('.explore').hide();
        $('.transition').hide();
        $('.testProb').show();
        $('.testGeneric').hide();
        $('.testFree').hide();
        $('.testReasoning').hide();
        $('.reward').hide();
        $('#probability').html('Suppose you get another '+stim.objectNameSingular.toLowerCase()+'.  What are the chances that it <b><u>'+stim.propertySpecific+'</u></b>?');
        $('.left').text("definitely won't "+stim.property);
        $('.right').text("definitely will "+stim.property);
        this.init_sliders();
        exp.sliderPost = null;
      }
      else if (stim.type == 'testGeneric') {
        this.stim = stim;
        $('.err').hide();
        $('#ddbutton').hide();
        setTimeout(function() {
          $('#ddbutton').show();
	  $('#ddbutton').text('Continue');
        }, 2000);
        $('.explore').hide();
        $('.transition').hide();
        $('.testProb').hide();
        $('.testGeneric').show();
        $('.testFree').hide();
        $('.testReasoning').hide();
        $('.reward').hide();
        $('#generic').html(stim.objectNamePlural+' <b><u>'+stim.property+'</u></b>.');
        $('input[name="endorsement"]').prop('checked', false);
      }
      else if (stim.type == 'testFree') {
        this.stim = stim;
        $('.err').hide();
        $('#ddbutton').hide();
        setTimeout(function() {
          $('#ddbutton').show();
	  $('#ddbutton').text('Continue');
        }, 2000);
        $('.explore').hide();
        $('.transition').hide();
        $('.testProb').hide();
        $('.testGeneric').hide();
        $('.testFree').show();
        $('.testReasoning').hide();
        $('.reward').hide();
        $('#free_response_prompt').text('Please write down what you know about '+stim.objectNamePlural.toLowerCase()+' for your fellow astronaut-scientists.');
        $('#free_response').val('');
      }
      else if (stim.type == 'testReasoning') {
        this.stim = stim;
        $('.err').hide();
        $('#ddbutton').hide();
        setTimeout(function() {
          $('#ddbutton').show();
	  $('#ddbutton').text('Continue');
        }, 2000);
        $('.explore').hide();
        $('.transition').hide();
        $('.testProb').hide();
        $('.testGeneric').hide();
        $('.testFree').hide();
        $('.testReasoning').show();
        $('.reward').hide();
        $('#reasoning_prompt').text('Other than the blicket with the note on it, did the blickets you tested squeak?');
      }
    },
    log_responses: function() {
      if (exp.type == 'explore') {
        exp.data_trials[0].itemsTested = exp.paper.customAttributes.itemsTested - 1;
	exp.data_trials[0].timeExploring = (Date.now() - exp.startExploration)/60000;
	exp.data_trials[0].events = exp.events;
	exp.data_trials[0].testResults = exp.testResults; // to store order of successful/unsuccessful test results, since order is randomized
      }
      else if (exp.type == 'end') {
          exp.data_trials[0].remainderEvents = exp.events;
	  exp.data_trials[0].remainderItemsTested = exp.paper.customAttributes.remainderItemsTested,
	  exp.data_trials[0].remainderTimeExploring = (Date.now() - exp.startExploration)/60000;
      }
      else if (exp.type == 'testProb') {
        exp.data_trials[0].probabilityOfFeature = exp.sliderPost;
      }
      else if (exp.type == 'testGeneric') {
        exp.data_trials[0].genericEndorsement = $('input[name="endorsement"]:checked').val();
      }
      else if (exp.type == 'testFree') {
        exp.data_trials[0].freeResponse = $('#free_response').val();
      }
      else if (exp.type == 'testReasoning') {
        exp.data_trials[0].featureAgreement = $('input[name="agreement"]:checked').val();
        exp.data_trials[0].reasoning = $('#reasoning').val();
      }
    },
    init_sliders : function() {
      utils.make_slider("#prob_slider", function(event, ui) {
        exp.sliderPost = ui.value;
      });
    },
    button: function(e) { // continue or leave testing area button button
      if (exp.type == 'transition') {
        exp.paper.remove();
        _stream.apply(this);
      }
      else if (exp.type == 'explore') {
          if (confirm('Are you sure you would like to move on to testing ringing?')) { // check to make sure user wants to move on
          this.log_responses();
          _stream.apply(this);
        }
      }
      else if (exp.type == 'end') {
        this.log_responses();
        exp.paper.remove();
        _stream.apply(this);
      }
      else if (exp.type == 'reward') {
        _stream.apply(this);
      }
      else if (exp.type == 'testProb') {
        if (exp.sliderPost == null) { // check to make sure user answered
          $('.err').show();
        }
        else {
          this.log_responses();
          _stream.apply(this);
        }
      }
      else if (exp.type == 'testGeneric') {
        if ($('input[name="endorsement"]:checked').val() == null) { // check to make sure user answered
          $('.err').show();
        }
        else {
          this.log_responses();
	  _stream.apply(this);
        }
      }
      else if (exp.type == 'testFree') {
        if ($('#free_response').val() == '') { // check to make sure user answered
          $('.err').show();
        }
        else {
          this.log_responses();
	  _stream.apply(this);
        }
      }
      else if (exp.type == 'testReasoning') {
        if ($('input[name="agreement"]:checked').val() == null || $('#reasoning').val() == '') { // check to make sure user answered
          $('.err').show();
        }
        else {
          this.log_responses();
	  _stream.apply(this);
	}
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
      //if (e.preventDefault) e.preventDefault(); // I don't know what this means.
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
	"attention_check": exp.attention_check,
        "trials" : exp.data_trials,
        "system" : exp.system,
        "condition" : exp.condition,
        "subject_information" : exp.subj_data,
        "time_in_minutes" : (Date.now() - exp.startT)/60000,
	  "reward": exp.points,
	  "comprehension": exp.comprehension,
	  "sound_check": exp.check_sound
      };
      setTimeout(function() {turk.submit(exp.data);}, 1000);
    }
  });

  return slides;
}

/// init ///
function init() {
  exp.condition = _.sample(["v2"]); //can randomize between subject conditions here
  exp.system = {
      Browser : BrowserDetect.browser,
      OS : BrowserDetect.OS,
      screenH: screen.height,
      screenUH: exp.height,
      screenW: screen.width,
      screenUW: exp.width
  };
    exp.data_trials = [{}];
    exp.comprehension = [];
    exp.pass = null;

  //blocks of the experiment:
  exp.structure=[
      'i0',
      'check_sound',
    'introduction',
      'practice',
      'instructions',
      'comprehension',
      'instructions',
      'comprehension',
      'instructions',
      'comprehension',
      'drag_and_drop',
    'attention_check',
    'subj_info', 'thanks'
  ];

  const utteranceType = "specific";
  const proportionSuccess = 0;
  const propertyMore = "squeak";
  const propertySpecificMore = "squeaks";
  const propertyLess = "ring";

  exp.data_trials[0].proportionSuccess = proportionSuccess;
  exp.data_trials[0].utteranceType = utteranceType;

  exp.randomized_trials = [{
      type: "explore",
      numObjects: 20,
      objectNameSingular: drag_and_drop.objects[0].singular,
      binSize: 6,
      proportionSuccess: proportionSuccess,
      shape: drag_and_drop.objects[0].shape,
      investigator: drag_and_drop.objects[0].investigator,
      utteranceType: utteranceType,
      objectNamePlural: drag_and_drop.objects[0].plural,
      property: propertyMore,
      color: drag_and_drop.objects[0].color,
      greyedColor: drag_and_drop.objects[0].greyed,
	numRows: 4,
	property: propertyMore,
	propertySpecific: propertySpecificMore,
	objectNameSingular: drag_and_drop.objects[0].singular,
    }, {
      type: "end",
      binSize: 6,
      proportionSuccess: 1,
      objectNamePlural: drag_and_drop.objects[0].plural
    }, {
	type: "reward"
    }, {
      type: "testProb",
      objectNameSingular: drag_and_drop.objects[0].singular,
      property: propertyMore,
      propertySpecific: propertySpecificMore
    }, {
      type: "testGeneric",
      objectNamePlural: drag_and_drop.objects[0].plural,
      property: propertyMore
    }, {
      type: "testFree",
      objectNamePlural: drag_and_drop.objects[0].plural
    }, {
      type: "testReasoning",
      objectNamePlural: drag_and_drop.objects[0].plural,
      property: propertyMore
  }];

  //make corresponding slides:
  exp.slides = make_slides(exp);

  exp.nQs = utils.get_exp_length(); //this does not work if there are stacks of stims (but does work for an experiment with this structure)
                    //relies on structure and slides being defined

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
