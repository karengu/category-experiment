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

  slides.practice = slide({
    name: "practice",
    start: function() {
      $('#practiceFinished').hide();
      $('#practicePaper').show();
      var paper = new Raphael(document.getElementById('practicePaper'), 800, 700);
      exp.practicePaper = paper;
	paper.customAttributes.goldMachine = paper.rect(200, 400, 400, 100).attr({fill:"#FFDF00"});
	paper.text(400, 385, "Gold machine").attr("font-size", 16);
      var testButtonGold = drag_and_drop.makeButton(400, 450, "#49e575", "Transform", paper, 90, 30);
	paper.customAttributes.silverMachine = paper.rect(200, 550, 400, 100).attr({fill:"#C0C0C0"});
	paper.text(400, 535, "Silver machine").attr("font-size", 16);
      var testButtonSilver = drag_and_drop.makeButton(400, 600,"#e549ae", "Transform", paper, 90, 30);
      var onClick = function() {
        if (paper.customAttributes.testItem) {
          paper.customAttributes.glow.remove();
        }
	if (paper.customAttributes.arrow) {
          paper.customAttributes.arrow.remove();
        }
        paper.customAttributes.testItem = this;
        paper.customAttributes.glow = this.glow();
      }
      var onTestGold = function() {
        const testItem = paper.customAttributes.testItem;
          if (testItem) {
	    if (testItem.data("id") < 2) {
              if (testItem.data("id") == 0) {
                  testItem.animate(drag_and_drop.makeGold(testItem.data("x") - 25, testItem.data("y")), 2000, "linear");
	      }
		else {
		    testItem.animate({opacity:0}, 1000, function() {this.hide()});
		}
	      demoIndex ++;
		setTimeout(function() {demo(demoIndex)}, 2000);
              paper.customAttributes.testItem = null;
	      paper.customAttributes.glow.remove();
	    }
          }
	};
        var onTestSilver = function() {
          const testItem = paper.customAttributes.testItem;
          if (testItem) {
	    if (testItem.data("id") > 1) {
              if (testItem.data("id") == 2) {
                  testItem.animate(drag_and_drop.makeSilver(testItem.data("x") - 25, testItem.data("y")), 2000, "linear");
	      }
		else {
		    testItem.animate({opacity:0}, 1000, function() {this.hide()});
		}
	      if (testItem.data("id") < 3) {
	        demoIndex ++;
	          setTimeout(function() {demo(demoIndex)}, 2000);
	      }
	      else {
	        $('#practiceFinished').show();
	        if (paper.customAttributes.demoText) {
	          paper.customAttributes.demoText.remove();
	        }
	        paper.customAttributes.demoText = paper.set();
	        paper.customAttributes.demoText.push(paper.rect(20, 40, 770, 140).attr({fill: "gray", "fill-opacity": 0, "stroke-width": 0}));
	        paper.customAttributes.demoText.push(paper.text(400, 80, "Now that you know how the machines work,").attr({"font-size": 16, "fill": "white", "font-weight": "bold"}));
	        paper.customAttributes.demoText.push(paper.text(400, 110, "hit the Continue button at the bottom of the screen to meet Ashley.").attr({"font-size": 16, "fill": "white", "font-weight": "bold"}));
	        paper.customAttributes.demoText.forEach(function(elem) {
	          elem.animate({"fill-opacity": 1, "stroke-opacity": 1}, 1000, "easeInOut");
	        });
              }
              paper.customAttributes.testItem = null;
	      paper.customAttributes.glow.remove();
            }
	  }
        };
        var items = [
	  drag_and_drop.objects[5],
	  drag_and_drop.objects[2],
	  drag_and_drop.objects[3],
	  drag_and_drop.objects[4]
        ];
        var createNewItem = function(i, demo) {
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
          var description = "Try testing the object by dragging it to the testing stage and clicking both buttons.";
	  var machineType = "machine";
	  if (i == 0) {
	    var description = "This object transforms to gold.";
	    var machineType = "gold";
          }
	  else if (i == 1) {
	    var description = "This object does not transform to gold.";
	    var machineType = "gold";
	  }
	  else if (i == 2) {
	    var description = "This object transforms to silver.";
	    var machineType = "silver";
	  }
	  else if (i == 3) {
	    var description = "This object does not transform to silver.";
	    var machineType = "silver";
	  }
	  if (paper.customAttributes.demoText) {
	    paper.customAttributes.demoText.remove();
	  }
	  paper.customAttributes.demoText = paper.set();
	  paper.customAttributes.demoText.push(paper.rect(20, 40, 770, 140).attr({fill: "gray", "fill-opacity": 0, "stroke-width": 0}));
	  paper.customAttributes.demoText.push(paper.text(400, 70, description).attr({"font-size": 16, "fill": "white", "font-weight": "bold"}));
	  paper.customAttributes.demoText.push(paper.text(400, 100, "Try transforming it by clicking it to select and then clicking the Transform button").attr({"font-size": 16, "fill": "white", "font-weight": "bold"}));
	  paper.customAttributes.demoText.push(paper.text(400, 130, "on the "+machineType+" machine.").attr({"font-size":16, "fill": "white", "font-weight": "bold"}));
	  paper.customAttributes.demoText.forEach(function(elem) {
	    elem.animate({"fill-opacity": 1, "stroke-opacity": 1}, 1000, "easeInOut");
	  });
	  const x = 100+200*i
	  paper.customAttributes.arrow = paper.path("M"+x+",185 v40").attr({'arrow-end': 'classic-wide-long', "stroke-width": 4});
	  createNewItem(i, true);
	}
	testButtonGold.buttonSet.click(onTestGold);
	testButtonSilver.buttonSet.click(onTestSilver);
	testButtonGold.buttonSet.mousedown(function() {
          testButtonGold.button.animate({"fill":"#287f41"});
        });
        testButtonGold.buttonSet.mouseup(function() {
          testButtonGold.button.animate({"fill": "#49e575"});
        });
	testButtonSilver.buttonSet.mousedown(function() {
          testButtonSilver.button.animate({"fill":"#841559"});
        });
        testButtonSilver.buttonSet.mouseup(function() {
          testButtonSilver.button.animate({"fill": "#e549ae"});
        });
        var demoIndex = 0;
        demo(demoIndex);
      },
      button: function() {
        exp.go();
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
	$('#testStatement').text(stim.investigator+' tells you that: ');
        if (stim.utteranceType == "barePlural") {
          $('#utterance').text(stim.objectNamePlural+' '+stim.property+'.');
        }
        else if (stim.utteranceType == "specific") {
          $('#utterance').text('This '+stim.objectNameSingular.toLowerCase()+' '+stim.propertySpecific+'.');
        }
        const paper = new Raphael(document.getElementById('demoPaper'), 800, 450);
        exp.paper = paper;
        var investigator = paper.image('../_shared/images/ashley.png', 0, 0, 192, 380);
        var demoItem = paper.path(objectPaths[stim.shape](400,100)).attr("fill", stim.color);
        demoItem.click(function() {
          paper.customAttributes.glow = this.glow();
          paper.customAttributes.selectedItem = this;
        });
        paper.customAttributes.machine = paper.rect(200, 200, 400, 100).attr({fill:"#FFDF00"});
        var testButton = drag_and_drop.makeButton(400, 250, "#49e575", "Transform", paper, 90, 30);
	if (stim.utteranceType == "barePlural") {
            paper.text(400, 380, 'She says, "'+stim.objectNamePlural + ' ' + stim.property + ' when you use this machine on them.').attr({"font-size": 16});
	}
	else if (stim.utteranceType == "specific") {
          paper.text(400, 380, 'She says, "This '+stim.objectNameSingular.toLowerCase() + ' '+stim.propertySpecific+' when you use this machine on it.').attr({"font-size": 16});
        }
        paper.text(400, 400, 'Try transforming the '+stim.objectNameSingular.toLowerCase()+' by clicking it to select it and then clicking on the Transform button."').attr({"font-size": 16});
        testButton.buttonSet.forEach(function(component) {
          component.click(function() {
              if (paper.customAttributes.selectedItem) {
		demoItem.animate(drag_and_drop.makeGold(375, 100), 2000, "linear");
		paper.customAttributes.glow.remove();
		;
	    }
          });
        });
        paper.customAttributes.testItem = demoItem;
        const demoItemId = demoItem.id;
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

        var onClick = function() {
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

        var onTest = function() {
          const testItem = paper.customAttributes.testItem;
          if (testItem) {
            if (paper.customAttributes.itemsTested == 0) { // first item
              setTimeout(function() { // delay showing button to leave for 2 seconds
                $('#ddbutton').show();
                $('#ddbutton').text('Switch machine');
              }, 2000);
            }
	    if (testSequence[testSequenceIndex]) {
		testItem.animate(drag_and_drop.makeGold(testItem.data("x") - 25, testItem.data("y")), 2000, "linear");
              paper.customAttributes.result = "Congratulations! You earned a gold bar!";
	      exp.moreReward ++;
	    }
	      else {
		  testItem.animate({opacity:0}, 1000, function() {this.remove()});
              paper.customAttributes.result = "Sorry! That one didn't transform to gold.";
	    }
            if (paper.customAttributes.resultText) {
	      paper.customAttributes.resultText.animate({"fill-opacity": 0,"stroke-opacity":0},1000,"easeInOut");
	      paper.customAttributes.resultText.remove();
            }
            paper.customAttributes.resultText = paper.text(400, 570, paper.customAttributes.result).attr({"font-size": 20, "font-weight": "bold"}).animate({"fill-opacity": 0,"stroke-opacity":0},5000,"easeInOut");
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
	  
	// DATA COLLECTION SETUP
        exp.events = [];
        exp.testResults = [];
        exp.proportionSuccess = stim.proportionSuccess;
        exp.startExploration = Date.now();
        exp.moreReward = 0;

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
        paper.customAttributes.machine = paper.rect(200, 450, 400, 100).attr({fill:"#FFDF00"});
        paper.customAttributes.testButton = drag_and_drop.makeButton(400, 500, "#49e575", "Transform", paper, 90, 30);
        paper.customAttributes.testButton.buttonSet.forEach(function(component) {
          component.click(onTest);
        });
	// task information
        $('#infoParagraph').html(stim.investigator+' gives you the '+stim.objectNamePlural.toLowerCase()+' and leaves to go do some other work. Test as many '+stim.objectNamePlural.toLowerCase()+' as you would like using the gold machine. When you are done using the gold machine and want to move on to the silver machine, hit the <b>Switch machine</b> button at the bottom of the screen. You must use the gold machine on at least one blicket.')
      }
      else if (stim.type == 'end') {
        $('#ddbutton').text('Leave lab');
	  
        var paper = exp.paper; // use same paper from previous trial
        paper.customAttributes.machine.remove();
        $('#infoParagraph').html('Test as many '+stim.objectNamePlural.toLowerCase()+' as you would like using the silver machine. When you are done using the silver machine and want to move on, hit the <b>Leave lab</b> button at the bottom of the screen.')

        exp.lessReward = 0;
        exp.events = [];
        paper.customAttributes.itemsTested = 0;
        paper.customAttributes.machine = paper.rect(200, 450, 400, 100).attr({fill:"#C0C0C0"});
	paper.customAttributes.resultText.remove();
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
            if (testSequence[testSequenceIndex]) {
		testItem.animate(drag_and_drop.makeSilver(testItem.data("x") - 25, testItem.data("y")), 2000, "linear");
	      paper.customAttributes.result = "Congratulations! You earned a silver bar!";
	      exp.lessReward ++;
	    }
	      else {
		  testItem.animate({opacity:0}, 1000, function() {this.remove()});
              paper.customAttributes.result = "Sorry! That one didn't transform to silver.";
	    } 
            if (paper.customAttributes.resultText) {
	      paper.customAttributes.resultText.animate({"fill-opacity": 0,"stroke-opacity":0},1000,"easeInOut");
	      paper.customAttributes.resultText.remove();
            }
            paper.customAttributes.resultText = paper.text(400, 570, paper.customAttributes.result).attr({"font-size": 20, "font-weight": "bold"}).animate({"fill-opacity": 0,"stroke-opacity":0},5000,"easeInOut");
            paper.customAttributes.testItem = null;
            paper.customAttributes.glow.remove();
	    paper.customAttributes.itemsTested ++;
            exp.events.push({time:Date.now(), event:"testRemainder"});
          }
	};
	var remainderButton = drag_and_drop.makeButton(400, 500,"#e549ae", "Transform", paper, 90, 30);
        remainderButton.buttonSet.forEach(function(component) {
          component.click(onTest);
	});
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
        $('#probability').text('Suppose you get another '+stim.objectNameSingular.toLowerCase()+'.  What are the chances that it '+stim.propertySpecific+'?');
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
        $('#generic').text(stim.objectNamePlural+' '+stim.property+'.');
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
        $('#free_response_prompt').text('Please write down what you know about '+stim.objectNamePlural.toLowerCase()+' for your fellow alchemists.');
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
        $('#reasoning_prompt').text('Did the '+stim.objectNamePlural.toLowerCase()+' that you tested after Ashley left '+stim.property+'?');
      }
    },
    log_responses: function() {
      if (exp.type == 'explore') {
        exp.data_trials[0].itemsTested = exp.paper.customAttributes.itemsTested;
	exp.data_trials[0].timeExploring = (Date.now() - exp.startExploration)/60000;
	exp.data_trials[0].events = exp.events;
	exp.data_trials[0].testResults = exp.testResults; // to store order of successful/unsuccessful test results, since order is randomized
      }
      else if (exp.type == 'end') {
        exp.data_trials[0].remainderEvents = exp.events;
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
        if (confirm('Are you sure you would like to move on to the next machine?')) { // check to make sure user wants to move on
          this.log_responses();
          _stream.apply(this);
        }
      }
      else if (exp.type == 'end') {
        this.log_responses();
        exp.paper.remove();
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
	"moreReward": exp.moreReward,
	"lessReward": exp.lessReward
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

  //blocks of the experiment:
  exp.structure=[
    'i0',
    'introduction',
    'practice',
    'drag_and_drop',
    'attention_check',
    'subj_info', 'thanks'
  ];

  const utteranceType = "barePlural";
  const proportionSuccess = 0;
  const propertyMore = " transform to gold";
  const propertySpecificMore = " transforms to gold";
  const propertyLess = " transform to silver";

  exp.data_trials[0].proportionSuccess = proportionSuccess;
  exp.data_trials[0].utteranceType = utteranceType;

  exp.randomized_trials = [{
      type: "transition",
      investigator: drag_and_drop.objects[0].investigator,
      utteranceType: utteranceType,
      objectNamePlural: drag_and_drop.objects[0].plural,
      objectNameSingular: drag_and_drop.objects[0].singular,
      property: propertyMore,
      propertySpecificMore: propertySpecificMore,
      color: drag_and_drop.objects[0].color,
      shape: drag_and_drop.objects[0].shape
    }, {
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
      numRows: 4
    }, {
      type: "end",
      binSize: 6,
      proportionSuccess: 1,
      objectNamePlural: drag_and_drop.objects[0].plural
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
