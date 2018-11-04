function make_slides(f) {
  var slides = {};

  slides.i0 = slide({
    name : "i0",
    start: function() {
      exp.startT = Date.now();
    }
  });

  slides.introduction = slide({
    name: "introduction",
    start: function() {
      exp.startT = Date.now();
      $('#intrButton').hide();
      setTimeout(function() {
        $('#intrButton').show();
      }, 5000)
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
	exp.pretzel = new Audio('../_shared/audio/pretzel.mp3');
	$('.err').hide();
    },
    test_sound: function() {
      exp.pretzel.play();
    },
      button: function() {
	  if ($('#sound_response').val() == '') {
	      $('.err').show();
	  }
	  else {
      response = $('#sound_response').val();
      exp.data_trials.push({
	"trial_type": "check_sound",
	"response": response
      });
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

      if (stim.type == "utterance") {
        $('.err').hide();
        $('#ddbutton').hide();
        setTimeout(function() {
          $('#ddbutton').show();
	  $('#ddbutton').text('Continue');
        }, 2000);
        $('.utterance').show();
        $('.explore').hide();
	$('.test').hide();
        if (stim.id == 0) { // first item needs to say "first"
	  $('#testStatement').text('First, you are going to explore '+stim.objectNamePlural.toLowerCase()+'. Your colleague has been studying '+stim.objectNamePlural.toLowerCase()+', and he tells you that: ');
        }
        else { // other items say "next"
          $('#testStatement').text('Next, you are going to explore '+stim.objectNamePlural.toLowerCase()+'. Your colleague has been studying '+stim.objectNamePlural.toLowerCase()+', and he tells you that: ');
        }
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
        exp.utteranceType = stim.utteranceType;
        $('#utterance').text('"'+exp.utterance+'"');
      }
	
      else if (stim.type == "explore") {
        $('.err').hide();
        $('#ddbutton').hide();
        $('.test').hide();
        $('.explore').show();
        $('.utterance').hide();
        $('#info').html('Try testing the '+stim.objectNameSingular.toLowerCase()+' by dragging it from the blue stage to the green testing stage and clicking the <b>Test</b> button.');
	var testSequence = []; // create bins with desired proportion of successes, to be randomized below
	for (i = 0; i < stim.testSequence.binSize*stim.testSequence.proportionSuccess; i++) {
	  testSequence.push(true);
	}
	for (i = stim.testSequence.binSize*stim.testSequence.proportionSuccess; i < stim.testSequence.binSize; i++) {
	  testSequence.push(false);
	}
	testSequence = _.shuffle(testSequence);
	var testSequenceIndex = 0;

        exp.startExploration = Date.now();
        exp.events = [];
        exp.testResults = [];
	exp.proportionSuccess = stim.testSequence.proportionSuccess;

	var start = function (x,y) {
          this.odx = 0;
          this.ody = 0;
          this.animate({"fill-opacity": 0.2}, 500);
          exp.events.push({event: "pickUp", time: Date.now()});
        };
        var move = function (dx, dy) {
          this.translate(dx - this.odx, dy - this.ody);
          this.odx = dx;
          this.ody = dy;
        };
        var up = function () {
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
          if (bBox.x < 700 && bBox.x > 550 && 190 < bBox.y && bBox.y <= 270) {
            this.translate(-this.odx, -this.ody);
            exp.events.push({event: "dropGarbagePrevented", time: Date.now()});
          }
          if (330 < bBox.x && bBox.x <= 410 && 190 < bBox.y && bBox.y <= 240) {
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

        var squeak = new Audio('../_shared/audio/squeak.mp3');
	var beep = new Audio('../_shared/audio/beep.mp3');
        var ring = new Audio('../_shared/audio/ring.mp3');
        var whistle = new Audio('../_shared/audio/whistle.mp3');
        var click = new Audio('../_shared/audio/click.mp3');
        var boom = new Audio('../_shared/audio/boom.mp3');

        var paper = new Raphael(document.getElementById('paper'), 800, 530);
        exp.paper = paper;
        drag_and_drop.makeTable(paper);

        // platforms: visible holders for objects of interest, testing, and garbage
        var sourcePlatform = paper.path(drag_and_drop.makePlatformPath(70,300)).attr({"stroke-width": 2, stroke: "black", fill: "#4985e5"});
        var testingPlatform = paper.path(drag_and_drop.makePlatformPath(320, 300)).attr({"stroke-width":2, stroke: "black", fill: "#49e575"});
        var garbagePlatform = paper.path(drag_and_drop.makePlatformPath(570, 300)).attr({"stroke-width":2, stroke: "black", fill: "#e549ae"});

        // source: items of interest to be tested
        var blicketPile = paper.set();
        drag_and_drop.makeBlicketPile(370,100,200, blicketPile, paper, stim.greyedColor, 'diamond');
        var sourceLabel = paper.text(400, 20, stim.objectNamePlural).attr({"font-size": 18});
        var pickUpButton = drag_and_drop.makeButton(370, 130, "#4985e5", "Pick up", paper);

        // target: testing area
        var targetLabel = paper.text(370, 285, "Testing Stage").attr({"font-size": 14});
        var testButton = drag_and_drop.makeButton(400, 210, "#49e575", "Test", paper);

        // garbage: items already tested
        var garbageLabel = paper.text(620, 285, "Tested Items").attr({"font-size": 14});
        // var itemsTestedCounter = paper.text(600, 50, "Number of items tested: 0");

	var firstItem = paper.path(drag_and_drop.makeBlicketPath(150,240)).attr("fill", stim.objectColor);
        paper.customAttributes.pickedItemId = firstItem.id;
        const firstItemId = firstItem.id;
        firstItem.drag(move, start, up);
        // paper.customAttributes.itemsTestedCounterId = itemsTestedCounter.id;
        paper.customAttributes.itemsTested = 0;
        paper.customAttributes.logResultDepth = 250;

        var onPickUp = function() {
          if (paper.customAttributes.pickedItemId || paper.customAttributes.testItem) {
            console.log('You cannot pick up more than one item.')
          }
          else {
            var newItem = paper.path(drag_and_drop.makeBlicketPath(150,240)).attr("fill", stim.objectColor);
            paper.customAttributes.pickedItemId = newItem.id;
            newItem.drag(move, start, up);
            blicketPile.forEach(function(blicket) {
              blicket.attr({"fill": stim.greyedColor});
	    });
            exp.events.push({event: "newItem", time: Date.now()});
          }
        }
        var onTest = function() {
          const testItem = paper.customAttributes.testItem;
          if (!testItem) {
            console.log('no item on testing stage');
          }
          else {
            blicketPile.forEach(function(blicket) {
	      blicket.attr({"fill": stim.objectColor});
	    })
            if (testItem.id == firstItemId) {
	      $('#info').html('You can continue to explore '+stim.objectNamePlural.toLowerCase()+' for as long as you want. When you are ready to answer questions about them, click <b>Leave testing area</b>.');
	      setTimeout(function() {
                $('#ddbutton').show();
	        $('#ddbutton').text('Leave testing area');
              }, 5000);
	    }
            if (testSequence[testSequenceIndex] || testItem.id == firstItemId) {
              if (stim.successfulTestResult == 'squeak') {
                squeak.play();
              }
	      else if (stim.successfulTestResult == 'beep') {
	        beep.play();
	      }
	      else if (stim.successfulTestResult == 'ring') {
	        ring.play();
	      }
	      else if (stim.successfulTestResult == 'whistle') {
	        whistle.play();
	      }
	      else if (stim.successfulTestResult == 'boom') {
	        boom.play();
	      }
	      else if (stim.successfulTestResult == 'click') {
	        click.play();
	      }
              else {
                var alert = paper.set();
                alert.push(paper.rect(150,100,500,200).attr({fill:"gray","fill-opacity":0,"stroke-width":0}));
                alert.push(paper.text(400,200, "Squeak!").attr({fill: "white","stroke-opacity":0}));
                alert.click(function() {
                  alert.remove();
                });
                var fadeOut = Raphael.animation({"fill-opacity":0,"stroke-opacity":0},500, "easeInOut", function() {alert.remove()});
                alert.forEach(function(elem) {
                  elem.animate({"fill-opacity": 1,"stroke-opacity":1},500,"easeInOut", function() {elem.animate(fadeOut.delay(500))})
                });
              }
            }
            if (testItem.id != firstItemId) {
              exp.testResults.push(testSequence[testSequenceIndex]);
              testSequenceIndex ++;
	      if (testSequenceIndex == stim.testSequence.binSize) {
                testSequence = _.shuffle(testSequence);
                testSequenceIndex = 0;
              }
              paper.customAttributes.itemsTested ++;
	    }
            var bBox = testItem.getBBox();
            drag_and_drop.moveToGarbage(testItem, bBox.x, bBox.y);
            paper.customAttributes.testItem = null;
            // var itemsTestedCounter = paper.text(600, 50, "Number of items tested: "+paper.customAttributes.itemsTested);
            // paper.customAttributes.itemsTestedCounterId = itemsTestedCounter.id;
            exp.events[Date.now()] = "testItem";
          }
        }
        pickUpButton.buttonSet.click(onPickUp);
        pickUpButton.buttonSet.mousedown(function() {
          pickUpButton.button.animate({"fill": "#2d528e"});
        });
        pickUpButton.buttonSet.mouseup(function() {
          pickUpButton.button.animate({"fill": "#4985e5"});
        });
        testButton.buttonSet.click(onTest);
        testButton.buttonSet.mousedown(function() {
          testButton.button.animate({"fill":"#287f41"});
        });
        testButton.buttonSet.mouseup(function() {
          testButton.button.animate({"fill": "#49e575"});
        });
      }
      else if (stim.type == 'test') {
        $('.err').hide();
        $('#ddbutton').hide();
        setTimeout(function() {
          $('#ddbutton').show();
	  $('#ddbutton').text('Continue');
        }, 2000);
        $('.explore').hide();
        $('.utterance').hide();
        $('.test').show();
        $('#probability').text('What do you think is the probability that '+stim.objectNamePlural.toLowerCase()+' '+stim.successfulTestResult+'?');
        this.init_sliders();
        exp.sliderPost = null;
        $('#generic').text(stim.objectNamePlural+' '+stim.successfulTestResult+'.');
        $('#free_response_prompt').text('Please provide information about '+stim.objectNamePlural.toLowerCase()+' below.');
        $('#free_response').val('');
        $('input[name="endorsement"]').prop('checked', false);
      }
    },
    log_responses: function() {
      if (exp.type == 'utterance') {
        exp.data_trials.push({
          trial_type: "utterance",
            utteranceType: exp.utteranceType,
	    utterance: exp.utterance
        });
      }
      else if (exp.type == 'explore') {
        exp.data_trials.push({
          trial_type: "explore",
          itemsTested: exp.paper.customAttributes.itemsTested,
          timeExploring: (Date.now() - exp.startExploration)/60000,
          events: exp.events,
          testResults: exp.testResults, // to store order of successful/unsuccessful test results, since order is randomized
          proportionSuccess: exp.proportionSuccess
        })
      }
      else if (exp.type == 'test') {
        exp.data_trials.push({
          trial_type: "test",
          probabilityOfFeature: exp.sliderPost,
	  genericEndorsement: $('input[name="endorsement"]:checked').val(),
	  freeResponse: $('#free_response').val()
        });
      }
    },
    init_sliders : function() {
      utils.make_slider("#prob_slider", function(event, ui) {
        exp.sliderPost = ui.value;
      });
    },
    button: function(e) { // continue or leave testing area button button
      if (exp.type == 'explore') {
        if (confirm('Are you sure you would like to move on to answering questions?')) {
          this.log_responses();
          exp.paper.remove();
          _stream.apply(this);
        }
      }
      else if (exp.type == 'test') {
        if (exp.sliderPost == null || $('input[name="endorsement"]:checked').val() == null || $('#free_response').val() == '') {
          $('.err').show();
        }
        else {
          this.log_responses();
          _stream.apply(this);
        }
      }
      else {
        this.log_responses();
        _stream.apply(this);
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
          "trials" : exp.data_trials,
          //"catch_trials" : exp.catch_trials,
          "system" : exp.system,
          //"condition" : exp.condition,
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
  //exp.condition = _.sample(["CONDITION 1", "condition 2"]); //can randomize between subject conditions here
  exp.system = {
      Browser : BrowserDetect.browser,
      OS : BrowserDetect.OS,
      screenH: screen.height,
      screenUH: exp.height,
      screenW: screen.width,
      screenUW: exp.width
  };

  const objectNames = [
    {
      plural: "Blickets",
      singular: "Blicket",
      color: "#ff0",
      greyed: "#999937",
    },
    {
      plural: "Daxes",
      singular: "Dax",
      color: "#f44248",
      greyed: "#992a34"
    },
    {
      plural: "Griffs",
      singular: "Griff",
      color: "#8b36c1",
      greyed: "#602784"
    },
    {
      plural: "Feps",
      singular: "Fep",
      color: "#f45042",
      greyed: "#c14136"
    },
    {
      plural: "Wugs",
      singular: "Wug",
      color: "#43e8e8",
      greyed: "#2b9696"
    },
    {
      plural: "Tomas",
      singular: "Toma",
      color: "#ff00cb",
      greyed: "#a80186"
    }
  ]
  const sounds = ['squeak', 'beep', 'whistle', 'ring', 'boom', 'click'];
  const utteranceTypes = ['barePlural', 'specific'];
  const proportionsSuccess = [0, 0.5, 1];
  const binSize = 6;

  exp.randomized_trials = drag_and_drop.randomize_trials(objectNames, sounds, proportionsSuccess, utteranceTypes, binSize);
    
  //blocks of the experiment:
  exp.structure=[
    'introduction', 'check_sound', 'instructions', 'drag_and_drop', 'subj_info', 'thanks'
  ];

  exp.data_trials = [];
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
}
