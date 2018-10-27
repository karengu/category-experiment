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
    button: function() {
      exp.go();
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
    present: [
      {
          type: "utterance",
	  objectName: "Blickets"
      },
      {
          type: "test",
	  objectName: "Blickets",
	  objectColor: "#ff0",
	  testSequence: "111000011101110000110101100110011110001011110000001101010010011111001101101000111000111000001111010101101100011001110110011001101100010101110100110001011010001100110110000101110101101011010001101110000011001100101110011010101100011000110101",
	  successfulTestResult: "squeak"
      }
    ],
    present_handle: function(stim) {

      if (stim.type == "utterance") {
        $('.utterance').show();
          $('.test').hide();
	  $('#testStatement').text('Your colleague has already tested the '+stim.objectName.toLowerCase()+', and he tells you that: ');
	  $('#utterance').text(stim.objectName+' squeak.');
      }
      else if (stim.type == "test") {
        $('.test').show();
          $('.utterance').hide();
	  $('#info').text('You can test the '+stim.objectName.toLowerCase()+' below.');
      }

      exp.startExploration = Date.now();
      exp.events = [];
	  
      var makePlatformPath = function(startX, startY) {
        return "M "+startX+","+startY+"h 100 v -30 h -100 v 30 m 0,-30 l 60,-40 h 100 l -60,40 m 0,30 l 60,-40 v -30 l -60,40"
      }

      var makeBlicketPath = function(startX, startY) {
        return "M "+startX+","+startY+"m -20,0 l 20,-20 l 20,20 l -20,20 l -20,-20 m 20,20 l -7.5,-20 l 7.5,-20 l 7.5,20 l -7.5,20"
      }

      var makeBlicketPile = function(startX, startY, numberBlickets, blicketPile) {
	paper.path("M "+startX+","+startY+"m -70,-25 l 60,-20 h 140 l -60,20, h-140").attr({"stroke-width":2, stroke: "black", fill: "#f4aa42"})
        for (i = 0; i < numberBlickets; i++) {
          var newBlicket = paper.path(makeBlicketPath(startX+160*Math.random()-50, startY+100*Math.random()-50)).attr({fill: stim.objectColor});
          blicketPile.push(newBlicket);
        }
	paper.path("M "+startX+","+startY+"m-70,85 v -110 h 140 v 110 h -140").attr({"stroke-width": 2, stroke: "black", fill: "#f4aa42"});
	paper.path("M "+startX+","+startY+"m70,85 l 60,-20 v -110 l-60,20 v 110").attr({"stroke-width": 2, stroke: "black", fill: "#f4aa42"});
      }

      var moveToGarbage = function(blicket, x, y) {
        const finalX = 60*Math.random()-30+630
        const finalY = 20*Math.random()-10+220
        blicket.translate(finalX-x,finalY-y)
      }

      var makeButton = function(startX, startY, color, buttonText) {
	var button = paper.rect(startX -25, startY-10, 50, 20, 8).attr("fill", color);
        var buttonLabel = paper.text(startX, startY, buttonText).attr({"font-weight": "bold"});
        var buttonSet = paper.set();
	buttonSet.push(button, buttonLabel).attr({"cursor": "pointer"});
	return ({button: button, buttonSet: buttonSet});
      }

      var makeTable = function() {
	paper.path("M 100,140 v 200 A 20,10 0 0,0 120,340 v-200").attr({"stroke-width": 2, stroke: "black", fill: "#75551f"});
	paper.path("M 780,140 v 200 A 20,10 0 0,0 800,340 v-200").attr({"stroke-width": 2, stroke: "black", fill: "#75551f"});
	paper.path("M 0,320 h 700 l 100,-180 h -700 l -100,180").attr({"stroke-width": 2, stroke: "black", fill: "#75551f"});
	paper.path("M 0,320 v 200 A 20,10 0 0,0 20,520 v-200").attr({"stroke-width": 2, stroke: "black", fill: "#75551f"});
	paper.path("M 680,320 v 200 A 20,10 0 0,0 700,520 v-200").attr({"stroke-width": 2, stroke: "black", fill: "#75551f"});
      }

      var squeak = new Audio('../_shared/audio/squeak.mp3');

      var paper = new Raphael(document.getElementById('paper'), 800, 530);
      exp.paper = paper;
      makeTable();
	
      // platforms: visible holders for objects of interest, testing, and garbage
      var sourcePlatform = paper.path(makePlatformPath(70,300)).attr({"stroke-width": 2, stroke: "black", fill: "#4985e5"});
      var testingPlatform = paper.path(makePlatformPath(320, 300)).attr({"stroke-width":2, stroke: "black", fill: "#49e575"});
      var garbagePlatform = paper.path(makePlatformPath(570, 300)).attr({"stroke-width":2, stroke: "black", fill: "#e549ae"});

      // source: items of interest to be tested
      var blicketPile = paper.set();
      makeBlicketPile(370,100,200, blicketPile);
      var sourceLabel = paper.text(400, 25, stim.objectName);
      var pickUpButton = makeButton(370, 130, "#4985e5", "Pick up");
	
      // target: testing area
      var targetLabel = paper.text(370, 285, "Testing Stage");
      var testButton = makeButton(400, 340, "#49e575", "Test");

      // garbage: items already tested
      var garbageLabel = paper.text(620, 285, "Tested Items");
      // var itemsTestedCounter = paper.text(600, 50, "Number of items tested: 0");

      // paper.customAttributes.itemsTestedCounterId = itemsTestedCounter.id;
      paper.customAttributes.itemsTested = 0;
	paper.customAttributes.logResultDepth = 250;
	
      var onPickUp = function() {
        if (paper.customAttributes.pickedItemId) {
          console.log('You cannot pick up more than one item.')
        }
        else {
          var newItem = paper.path(makeBlicketPath(150,240)).attr("fill", stim.objectDolor);
          paper.customAttributes.pickedItemId = newItem.id;
          newItem.drag(move, start, up);
          blicketPile.forEach(function(blicket) {
            blicket.attr({"fill": "#999937"});
	  });
          exp.events.push({event: "newItem", time: Date.now()});
        }
      }
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
        var bBox = this.getBBox();
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
        if (340 < bBox.x && bBox.x <= 410 && 190 < bBox.y && bBox.y <= 240) {
          console.log('item moved to testing area')
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
	    blicketPile.forEach(function(blicket) {
	      blicket.attr({"fill": "#ff0"});
	    })
          }
        }
	else {
          exp.events.push({event: "dropLoc", time: Date.now()});
        }
      };
      var onButtonClick = function() {
        const testItem = paper.customAttributes.testItem;
        if (!testItem) {
          console.log('no item on testing stage');
        }
        else {
          if (stim.testSequence.charAt(paper.customAttributes.itemsTested) == '1') {
            if (stim.successfulTestResult == 'squeak') {
              squeak.play();
            }
            else {
              var alert = paper.set();
              alert.push(paper.rect(100,100,600,200).attr({fill:"gray","fill-opacity":0,"stroke-width":0}));
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
          var bBox = testItem.getBBox();
          moveToGarbage(testItem, bBox.x, bBox.y);
          paper.customAttributes.testItem = null;
          paper.customAttributes.itemsTested ++;
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
      testButton.buttonSet.click(onButtonClick);
      testButton.buttonSet.mousedown(function() {
         testButton.button.animate({"fill":"#287f41"});
      });
      testButton.buttonSet.mouseup(function() {
        testButton.button.animate({"fill": "#49e575"});
      });
    },
    log_responses: function() {
      exp.data_trials.push({
        trial_type: "drag_and_drop",
        itemsTested: exp.paper.customAttributes.itemsTested,
        timeExploring: (Date.now() - exp.startExploration)/60000,
        events: exp.events
      })
    },
    button: function(e) {
      this.log_responses();
      exp.paper.remove();
      _stream.apply(this);
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
    exp.structure=[
	//"i0",
	"introduction",
		   "instructions",
		   //"single_trial", "one_slider", "multi_slider", "vertical_sliders",
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
