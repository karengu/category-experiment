function make_slides(f) {
  var   slides = {};

  slides.i0 = slide({
     name : "i0",
     start: function() {
      exp.startT = Date.now();
     }
  });

  slides.instructions = slide({
    name : "instructions",
    button : function() {
      exp.go(); //use exp.go() if and only if there is no "present" data.
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
    start: function() {

      // TODO: look at Python scripts for parsing JSON data

      exp.startExploration = Date.now();
      exp.events = {};
	  
      var makePlatformPath = function(startX, startY) {
        return "M "+startX+","+startY+"h 100 v -30 h -100 v 30 m 0,-30 l 60,-40 h 100 l -60,40 m 0,30 l 60,-40 v -30 l -60,40"
      }

      var makeBlicketPath = function(startX, startY) {
        return "M "+startX+","+startY+"m -20,0 l 20,-20 l 20,20 l -20,20 l -20,-20 m 20,20 l -7.5,-20 l 7.5,-20 l 7.5,20 l -7.5,20"
      }

      var makeBlicketPile = function(startX, startY, numberBlickets, blicketPile) {
        for (i = 0; i < numberBlickets; i++) {
          var newBlicket = paper.path(makeBlicketPath(startX+100*Math.random()-50, startY+100*Math.random()-50)).attr({fill: "#ff0"});
          blicketPile.push(newBlicket);
        }
      }

      var moveToGarbage = function(blicket, x, y) {
        const finalX = 50*Math.random()-25+550
        const finalY = 20*Math.random()-10+80
        blicket.translate(finalX-x,finalY-y)
      }

      var squeak = new Audio('../_shared/audio/squeak.mp3');

      var paper = new Raphael(document.getElementById('paper'), 700, 500);
	exp.paper = paper;

      // platforms: visible holders for objects of interest, testing, and garbage
      var sourcePlatform = paper.path(makePlatformPath(0,150)).attr({"stroke-width": 2, stroke: "black", fill: "#4985e5"});
      var testingPlatform = paper.path(makePlatformPath(250, 150)).attr({"stroke-width":2, stroke: "black", fill: "#49e575"});
      var garbagePlatform = paper.path(makePlatformPath(500, 150)).attr({"stroke-width":2, stroke: "black", fill: "#e549ae"});

      // source: items of interest to be tested
      var blicketPile = paper.set();
      makeBlicketPile(80,250,200, blicketPile);
      var sourceLabel = paper.text(75, 330, "Blickets");
      var pickUp = paper.rect(55, 180, 50, 20).attr("fill", "#4985e5"); // button to pick up item
      var pickUpLabel = paper.text(80, 190, "Pick up").attr({"font-weight": "bold"});
      var pickUpButton = paper.set();
      pickUpButton.push(pickUp, pickUpLabel).attr({"cursor": "pointer"});
	
      // target: testing area
      var targetLabel = paper.text(330, 50, "Testing Stage");
      var button = paper.rect(305, 180, 50, 20).attr("fill", "#49e575"); // test button
      var buttonLabel = paper.text(330, 190, "Test").attr({"font-weight": "bold"});
      var testButton = paper.set();
      testButton.push(button, buttonLabel).attr({"cursor": "pointer"});
	

      // garbage: items already tested
      var garbageLabel = paper.text(580, 50, "Tested Items");
      // var itemsTestedCounter = paper.text(600, 50, "Number of items tested: 0");

      // items of interest (single)
      //var blicket = paper.path(makeBlicketPath(80,100)).attr("fill", "#ff0");
	
      //paper.customAttributes.pickedItemId = blicket.id;
      // paper.customAttributes.itemsTestedCounterId = itemsTestedCounter.id;
      paper.customAttributes.itemsTested = 0;
      paper.customAttributes.logResultDepth = 250;
	
      var onPickUp = function() {
        if (paper.customAttributes.pickedItemId) {
          console.log('You cannot pick up more than one item.')
        }
        else {
          var newItem = paper.path(makeBlicketPath(80,100)).attr("fill", "#ff0");
          paper.customAttributes.pickedItemId = newItem.id;
          newItem.drag(move, start, up);
          blicketPile.forEach(function(blicket) {
            blicket.attr({"fill": "#999937"});
	  });
        }
      }
      var start = function () {
        this.odx = 0;
        this.ody = 0;
        this.animate({"fill-opacity": 0.2}, 500);
        exp.events[Date.now()] = "pickUp";
      };
      var move = function (dx, dy) {
        this.translate(dx - this.odx, dy - this.ody);
        this.odx = dx;
        this.ody = dy;
      };
      var up = function () {
        this.animate({"fill-opacity": 1}, 500);
        var bBox = this.getBBox();
        if (260 < bBox.x && bBox.x <= 360 && 10 < bBox.y && bBox.y <= 90) {
          console.log('item moved to testing area')
          if (paper.customAttributes.testItem) {
            console.log('item already on testing stage');
	    this.translate(-this.odx, -this.ody);
	    exp.events[Date.now()] = "dropTestOccupied";
          }
          else {
            exp.events[Date.now()] = "dropTest";
            this.undrag();
            paper.customAttributes.testItem = this;
            paper.customAttributes.pickedItemId = null;
	    blicketPile.forEach(function(blicket) {
	      blicket.attr({"fill": "#ff0"});
	    })
          }
        }
	else {
          exp.events[Date.now()] = "dropLoc";
        }
      };
      var onButtonClick = function() {
        const testItem = paper.customAttributes.testItem;
        if (!testItem) {
          console.log('no item on testing stage');
        }
        else {
          console.log('testing item', testItem);
          //paper.text(330, paper.customAttributes.logResultDepth, 'squeak!').animate({opacity: 0}, 1000, function() {this.hide()});
	  squeak.play();
          var bBox = testItem.getBBox();
          moveToGarbage(testItem, bBox.x, bBox.y);
          paper.customAttributes.testItem = null;
          paper.customAttributes.itemsTested ++;
          // paper.getById(paper.customAttributes.itemsTestedCounterId).remove();
          // var itemsTestedCounter = paper.text(600, 50, "Number of items tested: "+paper.customAttributes.itemsTested);
          // paper.customAttributes.itemsTestedCounterId = itemsTestedCounter.id;
          exp.events[Date.now()] = "testItem";
        }
      }
      pickUpButton.click(onPickUp);
      pickUpButton.mousedown(function() {
        pickUp.animate({"fill": "#2d528e"});
      });
      pickUpButton.mouseup(function() {
        pickUp.animate({"fill": "#4985e5"});
      });
      testButton.click(onButtonClick);
      testButton.mousedown(function() {
         button.animate({"fill":"#287f41"});
      });
      testButton.mouseup(function() {
        button.animate({"fill": "#49e575"});
      });
      //blicket.drag(move, start, up);
    },
    log_responses: function() {
      exp.data_trials.push({
        itemsTested: exp.paper.customAttributes.itemsTested,
        timeExploring: (Date.now() - exp.startExploration)/60000,
        events: exp.events
      })
    },
    button: function(e) {
      this.log_responses();
      exp.go();
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
          "catch_trials" : exp.catch_trials,
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
  exp.catch_trials = [];
  exp.condition = _.sample(["CONDITION 1", "condition 2"]); //can randomize between subject conditions here
  exp.system = {
      Browser : BrowserDetect.browser,
      OS : BrowserDetect.OS,
      screenH: screen.height,
      screenUH: exp.height,
      screenW: screen.width,
      screenUW: exp.width
    };
  //blocks of the experiment:
    exp.structure=["i0",
		   //"instructions", "single_trial", "one_slider", "multi_slider", "vertical_sliders",
		   'drag_and_drop', 'subj_info', 'thanks'];

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
