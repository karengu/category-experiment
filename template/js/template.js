function make_slides(f) {
  var slides = {};

  slides.i0 = slide({
    name : "i0",
    start: function() {
      exp.startT = Date.now();
      $('#instruct-text > #1').text("some objects");
      $('#instruct-text > #2').text("3-5");
    }
  });

  slides.introduction = slide({
    name: "introduction",
    start: function() {
      $('#intrButton').hide();
      // setTimeout(function() {
        $('#intrButton').show();
      // }, 5000)
    },
    button: function() {
	exp.go();
    }
  });

  slides.instructions = slide({
    name : "instructions",
    start: function() {
      $('#instButton').hide();
      setTimeout(function() {
        $('#instButton').show();
      }, 5000);
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

  slides.drag_and_drop = slide({
    name: "drag_and_drop",
    present: exp.randomized_trials,
    present_handle: function(stim) {
      exp.type = stim.type;

      if (stim.type == "transition") {
        $('.err').hide();
        $('#ddbutton').hide();
        $('.testProb').hide();
	$('.testGeneric').hide();
        $('.testFree').hide();
        $('.explore').hide();
          $('.transition').show();
	  	  $('.testReasoning').hide();
	if (exp.config.coverStory == 'teacher') {
	  // $('#testStatement').text('Your fellow teacher '+stim.investigator+'.');
	  $('#utterance').text('Your fellow teacher '+stim.investigator+' will teach you about '+stim.objectNamePlural.toLowerCase()+'.');
	  // setTimeout(function() {
	    $('#ddbutton').show();
          // }, 2000);
        }
        else if (stim.id == 0) {
          $('#testStatement').text('First, you are going to talk with '+stim.investigator+'.');
	  $('#utterance').text(stim.investigator+' has been exploring '+stim.objectNamePlural.toLowerCase()+'.');
	  // setTimeout(function() {
	    $('#ddbutton').show();
	  // }, 2000);
	}
	else if (stim.last) {
	  $('#testStatement').text('Now you are done with the exploration.');
	  $('#utterance').text('');
	  $('#ddbutton').show();
	}
        else {
          $('#testStatement').text('Now you are done exploring '+stim.prevItem.toLowerCase()+'. Next, you are going to talk with '+stim.investigator+'.');
	  $('#utterance').text(stim.investigator+' has been exploring '+stim.objectNamePlural.toLowerCase()+'.');
	  setTimeout(function() {
	    $('#ddbutton').show();
	  }, 2000);
	}
      }

      else if (stim.type == "explore") {
        this.stim = stim;
	exp.utteranceHeader = stim.investigator+' tells you that: ';
        if (stim.utteranceType == "barePlural") {
          exp.utterance = stim.objectNamePlural+' '+stim.successfulTestResult+'.';
        }
        else if (stim.utteranceType == "specific") {
          exp.utterance = 'This '+stim.objectNameSingular.toLowerCase()+' '+stim.successfulTestResult+'s.';
        }
        else if (stim.utteranceType == "all") {
          exp.utterance = 'All '+stim.objectNamePlural.toLowerCase()+' '+stim.successfulTestResult+'.';
        }
        else if (stim.utteranceType == "some") {
          exp.utterance = 'Some '+stim.objectNamePlural.toLowerCase()+' '+stim.successfulTestResult+'.';
        }
        $('.err').hide();
        $('#ddbutton').hide();
        $('.testProb').hide();
	$('.testGeneric').hide();
          $('.testFree').hide();
	  	  $('.testReasoning').hide();
        $('.explore').show();
        $('.transition').hide();
	$('.writeNotebook').hide();
	$('.notebook').hide();
	$('#classroomIntro').text(stim.investigator+' takes you into the classroom.');
        exp.belowUtteranceBefore = 'Test the '+stim.objectNameSingular.toLowerCase()+' marked with an arrow by dragging it';
	exp.belowUtteranceAfter = ' from the blue stage to the green testing stage and clicking the green Test button.';
	var testSequence = []; // create bins with desired proportion of successes, to be randomized below
	for (i = 0; i < stim.testSequence.binSize*stim.testSequence.proportionSuccess; i++) {
	  testSequence.push(true);
	}
	for (i = stim.testSequence.binSize*stim.testSequence.proportionSuccess; i < stim.testSequence.binSize; i++) {
	  testSequence.push(false);
	}
	testSequence = _.shuffle(testSequence);
	var testSequenceIndex = 0;

        exp.events = [];
        exp.testResults = [];
	exp.proportionSuccess = stim.testSequence.proportionSuccess;

        var positiveSound = new Audio('../_shared/audio/'+stim.successfulTestResult+'.mp3');
        if (exp.config.negativeProperty) {
          var negativeSound = new Audio('../_shared/audio/'+exp.config.negativeProperty+'.mp3');
        }
	var utteranceSpoken = new Audio('../_shared/audio/'+stim.utteranceSpoken);

          var paper = new Raphael(document.getElementById('paper'), 800, 580);
	  const platformLevel = 380;
	  const labelLevel = platformLevel - 15;
        exp.paper = paper;
 	paper.customAttributes.teacher = paper.image("../_shared/images/ashley.jpg", 0, 0, 202, 400);
          drag_and_drop.makeTable(paper);
	  paper.customAttributes.start = function (x,y) {
	      console.log('call to start');
	      var i = 0;
	      paper.customAttributes.blicketPile.forEach(function(blicket) {
		  i++
	      });
	      console.log(i);
          this.odx = 0;
          this.ody = 0;
          this.animate({"fill-opacity": 0.2}, 500);
              
        };
          paper.customAttributes.move = function (dx, dy) {
	      console.log('call to move');
          this.translate(dx - this.odx, dy - this.ody);
          this.odx = dx;
          this.ody = dy;
          };
          paper.customAttributes.up = function () {

	      function clone(shape) { 
		  return paper.path(shape.attr().path).attr({fill: shape.attr().fill, "fill-opacity": 1, stroke: shape.attr().stroke}); 
}
	      if (this.id != paper.customAttributes.pickedItemId) {
		  var blicketCopy = clone(this);
		  console.log(blicketCopy)
		  blicketCopy.insertAfter(this);
		  blicketCopy.undrag();
		  paper.customAttributes.boxBack.toBack();
		  paper.customAttributes.blicketPile.push(blicketCopy);
		  paper.customAttributes.blicketPile.exclude(this);
	      exp.events.push({event: "pickUp", time: Date.now()});
		  paper.customAttributes.pickedItemId = this.id;
	      paper.customAttributes.blicketPile.forEach(function(blicket) {
		  blicket.attr({"fill": stim.greyedColor});
		  blicket.undrag();
	      });
	      }
	      console.log('call to up');
          this.animate({"fill-opacity": 1}, 500);
          var bBox = this.getBBox(); // gets top left coordinates of bounding box
          xTrans = 0;
            yTrans = 0;
          if (bBox.x < 0) {
            xTrans=-bBox.x
          }
          if (bBox.y < 0) {
            yTrans=-bBox.y
          }
          if (bBox.x > 760) {
            xTrans=760-bBox.x
          }
          if (bBox.y > 460) {
            yTrans=460-bBox.y
          }
          if (xTrans !== 0 || yTrans !== 0) {
            this.translate(xTrans,yTrans);
          }
          if (bBox.x < 700 && bBox.x > 550 && 270 < bBox.y && bBox.y <= 350) {
            this.translate(-this.odx, -this.ody);
            exp.events.push({event: "dropGarbagePrevented", time: Date.now()});
          }
          if (80 < bBox.x && bBox.x <= 170 && 270 < bBox.y && bBox.y <= 320) {
            if (paper.customAttributes.testItem) {
              console.log('item already on testing stage');
	      this.translate(-this.odx, -this.ody);
	      exp.events.push({event: "dropTestOccupied", time: Date.now()});
            }
            else {
              exp.events.push({event: "dropTest", time: Date.now()});
              this.undrag();
              paper.customAttributes.testItem = this;
              paper.customAttributes.pickedItemId = null;
            }
          }
	  else {
            exp.events.push({event: "dropLoc", time: Date.now()});
          }
        };

        // platforms: visible holders for objects of interest, testing, and garbage
        var testingPlatform = paper.path(drag_and_drop.makePlatformPath(70, platformLevel)).attr({"stroke-width":2, stroke: "black", fill: "#49e575"});
        var garbagePlatform = paper.path(drag_and_drop.makePlatformPath(570, platformLevel)).attr({"stroke-width":2, stroke: "black", fill: "#e549ae"});

        // source: items of interest to be tested
        paper.customAttributes.blicketPile = paper.set();
          drag_and_drop.makeBlicketPile(370,180,200, paper.customAttributes.blicketPile, paper, stim.greyedColor, stim.shape);
        var sourceLabel = paper.text(400, 100, stim.objectNamePlural).attr({"font-size": 18});

        // target: testing area
        var targetLabel = paper.text(120, labelLevel, "Testing Stage").attr({"font-size": 14});
        var testButton = drag_and_drop.makeButton(400, 320, "#49e575", "Test", paper);

        // garbage: items already tested
        var garbageLabel = paper.text(620, labelLevel, "Tested Items").attr({"font-size": 14});

	var demoItem = paper.path(objectPaths[stim.shape](150,320)).attr("fill", stim.objectColor);
        paper.customAttributes.testItem = demoItem;
        const demoItemId = demoItem.id;
        var arrow = paper.path("M150,250 v 40").attr({'arrow-end': 'classic-wide-long', "stroke-width": 2});
          var utterance = drag_and_drop.alert(paper, exp.utteranceHeader, exp.utterance, '', exp.belowUtteranceBefore, exp.belowUtteranceAfter, false, true, 2000, 4000);
	setTimeout(function() {
          utteranceSpoken.play(); // read utterance
	    setTimeout(function() { // allow user to test exemplar after 1.5 seconds
		testButton.buttonSet.click(onTest);
        testButton.buttonSet.mousedown(function() {
          testButton.button.animate({"fill":"#287f41"});
        });
        testButton.buttonSet.mouseup(function() {
          testButton.button.animate({"fill": "#49e575"});
        });
	  }, 1500);
        }, 2000);
	  paper.customAttributes.classroomIntro = paper.text(400, 20, stim.investigator+' takes you into the classroom.').attr({"font-size": 16});

	  exp.wroteInNotebook = false;

        var onTest = function() {
            const testItem = paper.customAttributes.testItem;
          if (!testItem) {
            console.log('no item on testing stage');
          }
            else {
              if (testItem.id == demoItemId) {
		  arrow.remove();
	      if (utterance) {
	        utterance.remove();
	      }
	      $('.writeNotebook').show();
	      $('#notebookText').text('You decide to write down what '+stim.investigator+' told you so that you can remember it.');
	      $('#notebookInstruction').text('(Please type what '+stim.investigator+' said in the text box provided.)');
	      }
		else {
		    paper.customAttributes.blicketPile.forEach(function(blicket) {
		blicket.attr({"fill": stim.objectColor});
		blicket.drag(paper.customAttributes.move, paper.customAttributes.start, paper.customAttributes.up);
	    })
		}
            if (testSequence[testSequenceIndex] || testItem.id == demoItemId) {
	      positiveSound.play();
            }
	    else if (exp.config.negativeProperty) {
              negativeSound.play();
	    }
            if (testItem.id != demoItemId) {
              exp.testResults.push(testSequence[testSequenceIndex]);
              testSequenceIndex ++;
	      if (testSequenceIndex == stim.testSequence.binSize) {
                testSequence = _.shuffle(testSequence);
                testSequenceIndex = 0;
              }
              paper.customAttributes.itemsTested ++;
	    }
            else {
              exp.startExploration = Date.now();
            }
	      if (paper.customAttributes.itemsTested == 1) {
		  setTimeout(function() { // delay showing button to leave for 2 seconds
          $('#ddbutton').show();
          $('#ddbutton').text('Leave testing area');
        }, 2000);
	      }
            var bBox = testItem.getBBox();
            drag_and_drop.moveToGarbage(testItem, bBox.x, bBox.y);
            paper.customAttributes.testItem = null;
            exp.events[Date.now()] = "testItem";
          }
        }
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
        $('#probability').text('Suppose you pick up another '+stim.objectNameSingular.toLowerCase()+' from the box. What are the chances that it '+stim.successfulTestResult+'s?');
        $('.left').text("definitely won't "+stim.successfulTestResult);
        $('.right').text("definitely will "+stim.successfulTestResult);
        this.init_sliders();
          exp.sliderPost = null;
	  	  $('.testReasoning').hide();
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
        $('#generic').text(stim.objectNamePlural+' '+stim.successfulTestResult+'.');
          $('input[name="endorsement"]').prop('checked', false);
	  	  $('.testReasoning').hide();
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
        $('#free_response_prompt').text('Please write down what you would tell your students to teach them about '+stim.objectNamePlural.toLowerCase()+'.');
          $('#free_response').val('');
	  $('.testReasoning').hide();
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
	    $('#reasoning_prompt').text('Did the '+stim.objectNamePlural.toLowerCase()+' you tested '+stim.successfulTestResult+'?');
	}
    },
    writeInNotebook: function() {
      if ($('#notebookInput').val() == '') {
        $('#error').text('Please write something in the notebook.');
      }
	else {
	    exp.wroteInNotebook = true;
        exp.paper.customAttributes.teacher.remove();
        exp.notebook = $('#notebookInput').val();
        $('.writeNotebook').hide();
        $('.notebook').show();
        $('#infoParagraph').text(exp.notebook);
            exp.paper.customAttributes.classroomIntro.remove();
        const stim = this.stim;
        setTimeout(function() {

          if (stim.id == 0) { // give reminder of how to drag items on first trial
              exp.paper.customAttributes.continueTesting = drag_and_drop.alert2(
		  exp.paper,
stim.investigator+' has to go teach her class now.',
									       'She encourages you to explore the ' + stim.objectNamePlural.toLowerCase(),
                ' so that you can plan the best lesson possible for your students.',
		  'Please explore the ' + stim.objectNamePlural.toLowerCase() + ' for as long as you want. Afterward you will answer questions about what ', 'you learned and teach children about them.',
										"Click the Blue Pick Up",
										" button to pick up blickets, then ",
										"drag them to the Green Testing Stage",
										" and ",
										"click Test ",
										"to test them.",
                ' When you are ready to answer questions and teach about them, click Leave testing area.',
                 false, false, 500, 0);
          }
          else { // no reminder on all subsequent trials
            exp.paper.customAttributes.continueTesting = drag_and_drop.alert(exp.paper, stim.investigator+' is leaving to do some other work.', 'You can continue to explore '+stim.objectNamePlural.toLowerCase()+' for as long as you want.', '', 'When you are ready to answer questions about them, click Leave testing area.', false, false, 500);
          }
	    exp.paper.customAttributes.blicketPile.forEach(function(blicket) { // allow blickets to be dragged
		blicket.attr({"fill": stim.objectColor});
		blicket.drag(exp.paper.customAttributes.move, exp.paper.customAttributes.start, exp.paper.customAttributes.up);
	    });
        }, 1000);
      }
    },
    log_responses: function() {
      if (exp.type == 'explore') {
        exp.data_trials[this.stim.id].itemsTested = exp.paper.customAttributes.itemsTested;
	exp.data_trials[this.stim.id].timeExploring = (Date.now() - exp.startExploration)/60000;
	exp.data_trials[this.stim.id].events = exp.events;
	exp.data_trials[this.stim.id].testResults = exp.testResults; // to store order of successful/unsuccessful test results, since order is randomized
	exp.data_trials[this.stim.id].attentionCheck = exp.notebook;
      }
      else if (exp.type == 'testProb') {
        exp.data_trials[this.stim.id].probabilityOfFeature = exp.sliderPost;
      }
      else if (exp.type == 'testGeneric') {
        exp.data_trials[this.stim.id].genericEndorsement = $('input[name="endorsement"]:checked').val();
      }
      else if (exp.type == 'testFree') {
        exp.data_trials[this.stim.id].freeResponse = $('#free_response').val();
      }
	else if (exp.type == 'testReasoning') {
	    exp.data_trials[this.stim.id].featureAgreement = $('input[name="agreement"]:checked').val();
	    exp.data_trials[this.stim.id].reasoning = $('#reasoning').val();
	}
    },
    init_sliders : function() {
      utils.make_slider("#prob_slider", function(event, ui) {
        exp.sliderPost = ui.value;
      });
    },
    button: function(e) { // continue or leave testing area button button
      if (exp.type == 'transition') {
        _stream.apply(this);
      }
      else if (exp.type == 'explore') {
        if (confirm('Are you sure you would like to move on to answering questions?')) { // check to make sure user wants to move on
          this.log_responses();
          exp.paper.remove();
          _stream.apply(this);
        }
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
          "sound_check": exp.check_sound,
	  "attention_check": exp.attention_check,
        "trials" : exp.data_trials,
        "system" : exp.system,
        "condition" : exp.condition,
        "subject_information" : exp.subj_data,
        "time_in_minutes" : (Date.now() - exp.startT)/60000
      };
      setTimeout(function() {turk.submit(exp.data);}, 1000);
    }
  });

  return slides;
}

/// init ///
function init() {
  exp.trials = [];
  //exp.catch_trials = [];
  exp.condition = _.sample(["single"]); //can randomize between subject conditions here
  exp.system = {
      Browser : BrowserDetect.browser,
      OS : BrowserDetect.OS,
      screenH: screen.height,
      screenUH: exp.height,
      screenW: screen.width,
      screenUW: exp.width
  };
  exp.data_trials = [];

  const objects = [
    {
      plural: "Blickets",
      singular: "Blicket",
      color: "#ff0",
      greyed: "#999937",
      sound: "squeak",
      shape: "diamond",
      investigator: "Ashley",
      pronoun: "She"
    },
    {
      plural: "Daxes",
      singular: "Dax",
      color: "#f44248",
      greyed: "#992a34",
      sound: "beep",
      shape: "cylinder",
      investigator: "Beth",
      pronoun: "She"
    },
    {
      plural: "Griffs",
      singular: "Griff",
      color: "#8b36c1",
      greyed: "#602784",
      sound: "whistle",
      shape: "hexagon",
      investigator: "James",
      pronoun: "He"
    },
    {
      plural: "Feps",
      singular: "Fep",
      color: "#f45042",
      greyed: "#c14136",
      sound: "ring",
      shape: "pyramid",
      investigator: "Julie",
      pronoun: "She"
    },
    {
      plural: "Wugs",
      singular: "Wug",
      color: "#43e8e8",
      greyed: "#2b9696",
      sound: "boom",
      shape: "cube",
      investigator: "Tom",
      pronoun: "He"
    },
    {
      plural: "Tomas",
      singular: "Toma",
      color: "#ff00cb",
      greyed: "#a80186",
      sound: "click",
      shape: "cone",
      investigator: "Paul",
      pronoun: "He"
    }
  ]
  const utteranceTypes = ['barePlural', 'specific'];
  const proportionsSuccess = [0, 0.5, 1];
  const binSize = 6;

  var fixedOrders = [
    [
      {
	utteranceType: 'barePlural',
	proportionSuccess: 1,
      },
      {
	utteranceType: 'specific',
	proportionSuccess: 0
      },
      {
        utteranceType: 'barePlural',
        proportionSuccess: .5
      },
      {
        utteranceType: 'specific',
        proportionSuccess: .5
      },
      {
        utteranceType: 'barePlural',
        proportionSuccess: 0
      },
      {
        utteranceType: 'specific',
        proportionSuccess: 1
      }
    ]
  ];

  if (exp.condition == 'random') {
    randomized_trials = drag_and_drop.randomize_trials(objects, proportionsSuccess, utteranceTypes, binSize);
    exp.randomized_trials = randomized_trials.randomized_trials;
    exp.data_trials = randomized_trials.trial_summary;
  }
  else if (exp.condition == 'single') {
    const utteranceType = 'specific';
    const proportionSuccess = 0;
    exp.data_trials.push({
      id: 0,
      objectName: objects[0].plural,
      successfulTestResult: objects[0].sound,
      utteranceType: utteranceType,
      proportionSuccess: proportionSuccess
    });
    exp.randomized_trials = [{
      type: "transition",
      id: 0,
      objectNamePlural: objects[0].plural,
      investigator: objects[0].investigator,
      pronoun: objects[0].pronoun
    }, {
      type: "explore",
      id: 0,
      objectNamePlural: objects[0].plural,
      objectNameSingular: objects[0].singular,
      utteranceType: utteranceType,
      utteranceSpoken: objects[0].plural.toLowerCase()+utteranceType+'.mp3',
      shape: objects[0].shape,
      successfulTestResult: objects[0].sound,
      investigator: objects[0].investigator,
      pronoun: objects[0].pronoun,
      testSequence: {
	binSize: binSize,
	proportionSuccess: proportionSuccess
      },
      objectColor: objects[0].color,
      greyedColor: objects[0].greyed
    }, {
      type: "testProb",
      id: 0,
      objectNamePlural: objects[0].plural,
      objectNameSingular: objects[0].singular,
      successfulTestResult: objects[0].sound
    }, {
      type: "testGeneric",
      id: 0,
      objectNamePlural: objects[0].plural,
      successfulTestResult: objects[0].sound
    }, {
      type: "testFree",
      id: 0,
      objectNamePlural: objects[0].plural
    }, {
	type: "testReasoning",
	id: 0,
	objectNamePlural: objects[0].plural,
	successfulTestResult: objects[0].sound
    }];
  }
  else {
    fixed_orders = drag_and_drop.fixed_trials(objects, fixedOrders, binSize);
    exp.randomized_trials = fixed_orders.randomized_trials;
    exp.trial_summary = fixed_orders.trial_summary;
  }

  //blocks of the experiment:
  exp.structure=[
    'i0',
    'check_sound',
    'introduction',
    // 'instructions',
    'drag_and_drop',
    'attention_check',
    'subj_info', 'thanks'
  ];

    exp.config = {
	negativeProperty: 'boom', // one of the sound files in _shared/audio or null
	coverStory: 'teacher'
    };

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

/*
TODO:
make sure events are still being logged correctly
CODE CLEANUP
*/
