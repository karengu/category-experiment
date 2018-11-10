var makeBlicketPath = function(startX, startY) {
  return "M "+startX+","+startY+"m -20,0 l 20,-20 l 20,20 l -20,20 l -20,-20 m 20,20 l -7.5,-20 l 7.5,-20 l 7.5,20 l -7.5,20"
};

var makeSphere = function(startX, startY, paper) {
  const sphere = paper.circle(startX, startY, 20).attr({fill: "#8642f4"});
  paper.path("M"+startX+","+startY+" m20,0 a 40,40, 0 0 1 -40,0");
  paper.path("M"+startX+","+startY+" m-20,0 a 40,40, 0 0 1 40,0");
  return sphere;
};

var makeTrials = function(trialTypes, objects, sounds, binSize) {
  objects = _.shuffle(objects);
  sounds = _.shuffle(sounds);
  trialTypes = _.shuffle(trialTypes);
  var result = [];
  var resultSummary = []
  for (i=0; i<trialTypes.length; i++) {
    resultSummary.push({
      id: i,
      objectName: objects[i].plural,
      successfulTestResult: sounds[i],
      proportionSuccess: trialTypes[i].proportionSuccess,
      utteranceType: trialTypes[i].utteranceType
    });
    result.push({
      id: i,
      type: "explore",
      objectNamePlural: objects[i].plural,
      objectNameSingular: objects[i].singular,
      utteranceType: trialTypes[i].utteranceType,
      successfulTestResult: sounds[i],
      testSequence: {
        binSize: binSize,
        proportionSuccess: trialTypes[i].proportionSuccess
      },
      objectColor: objects[i].color,
      greyedColor: objects[i].greyed
    });
    result.push({
      id: i,
      type: "testProb",
      objectNamePlural: objects[i].plural,
      objectNameSingular: objects[i].singular,
      successfulTestResult: sounds[i]
    });
    result.push({
      id: i,
      type: "testGeneric",
      objectNamePlural: objects[i].plural,
      successfulTestResult: sounds[i]
    });
    result.push({
      id: i,
      type: "testFree",
      objectNamePlural: objects[i].plural
    });
  }
  return {
    randomized_trials: result,
    trial_summary: resultSummary
  };
}

var drag_and_drop = {

  fixed_trials: function(objects, sounds, fixedOrders, binSize) {
    objects = _.shuffle(objects);
    sounds = _.shuffle(sounds);
    fixedOrder = _.sample(fixedOrders);
    return makeTrials(fixedOrder, objects, sounds, binSize);
  },
    
  randomize_trials: function(objects, sounds, proportionsSuccess, utteranceTypes, binSize) {
    var trialTypes = [];
    for (i=0; i<proportionsSuccess.length; i++) {
      for (j=0; j<utteranceTypes.length; j++) {
        trialTypes.push({
          utteranceType: utteranceTypes[j],
	  proportionSuccess: proportionsSuccess[i]
        });
      }
    }
    return makeTrials(trialTypes, objects, sounds, binSize);
  },
  makePlatformPath: function(startX, startY) {
    return "M "+startX+","+startY+"h 100 v -30 h -100 v 30 m 0,-30 l 60,-40 h 100 l -60,40 m 0,30 l 60,-40 v -30 l -60,40"
  },
  makeBlicketPath: makeBlicketPath,
  makeBlicketPile: function(startX, startY, numberBlickets, blicketPile, paper, greyedColor, type) {
    paper.path("M "+startX+","+startY+"m -70,-25 l 60,-20 h 140 l -60,20, h-140").attr({"stroke-width":2, stroke: "black", fill: "#f4aa42"});
    for (i = 0; i < numberBlickets; i++) {
      if (type == 'diamond') {
        var newBlicket = paper.path(makeBlicketPath(startX+160*Math.random()-50, startY+100*Math.random()-50)).attr({fill: greyedColor});
      }
      else if (type =='sphere') {
        var newBlicket = makeSphere(startX+160*Math.random()-50, startY+100*Math.random()-50, paper);
      }
      blicketPile.push(newBlicket);
    }
    paper.path("M "+startX+","+startY+"m-70,85 v -110 h 140 v 110 h -140").attr({"stroke-width": 2, stroke: "black", fill: "#f4aa42"});
    paper.path("M "+startX+","+startY+"m70,85 l 60,-20 v -110 l-60,20 v 110").attr({"stroke-width": 2, stroke: "black", fill: "#f4aa42"});
  },
  moveToGarbage: function(blicket, x, y) {
    const finalX = 60*Math.random()-30+630
    const finalY = 20*Math.random()-10+220
    blicket.translate(finalX-x,finalY-y)
  },
  makeButton: function(startX, startY, color, buttonText, paper) {
    var button = paper.rect(startX -35, startY-15, 70, 30, 8).attr("fill", color);
    var buttonLabel = paper.text(startX, startY, buttonText).attr({"font-weight": "bold", "font-size": 16});
    var buttonSet = paper.set();
    buttonSet.push(button, buttonLabel).attr({"cursor": "pointer"});
    return ({button: button, buttonSet: buttonSet});
  },
  makeTable: function(paper) {
    paper.path("M 100,140 v 200 A 20,10 0 0,0 120,340 v-200").attr({"stroke-width": 2, stroke: "black", fill: "#75551f"});
    paper.path("M 780,140 v 200 A 20,10 0 0,0 800,340 v-200").attr({"stroke-width": 2, stroke: "black", fill: "#75551f"});
    paper.path("M 0,320 h 700 l 100,-180 h -700 l -100,180").attr({"stroke-width": 2, stroke: "black", fill: "#75551f"});
    paper.path("M 0,320 v 200 A 20,10 0 0,0 20,520 v-200").attr({"stroke-width": 2, stroke: "black", fill: "#75551f"});
    paper.path("M 680,320 v 200 A 20,10 0 0,0 700,520 v-200").attr({"stroke-width": 2, stroke: "black", fill: "#75551f"});
  },
    makeSphere: makeSphere,
  alert: function(paper, headerText, text, belowTextBefore, belowTextAfter, fadeOut) {
    var alert = paper.set();
    alert.push(paper.rect(30,100,750,200).attr({fill:"gray","fill-opacity":0,"stroke-width":0}));
    alert.push(paper.text(400, 130, headerText).attr({fill: "white", "stroke-opacity": 0, "font-size": 14}));
    alert.push(paper.text(400,175, text).attr({fill: "white","stroke-opacity":0, "font-size": 18, "font-weight": "bold"}));
    alert.push(paper.text(400, 220, belowTextBefore).attr({fill: "white", "stroke-opacity": 0, "font-size": 14}));
    alert.push(paper.text(400, 235, belowTextAfter).attr({fill: "white", "stroke-opacity": 0, "font-size": 14}));
    alert.push(paper.text(400, 280, 'Click anywhere inside the box to continue.').attr({fill: "white", "stroke-opacity": 0, "font-size": 12}));
    alert.click(function() {
      alert.remove();
    });
    if (fadeOut) {
      var fadeOutFunc = Raphael.animation({"fill-opacity":0,"stroke-opacity":0},500, "easeInOut", function() {alert.remove()});
      alert.forEach(function(elem) {
        elem.animate({"fill-opacity": 1,"stroke-opacity":1},500,"easeInOut", function() {elem.animate(fadeOutFunc.delay(500))})
      });
    }
    else {
      alert.forEach(function(elem) {
        elem.animate({"fill-opacity": 1, "stroke-opacity":1}, 500, "easeInOut");
      });
    }
    return alert;
  }
}
