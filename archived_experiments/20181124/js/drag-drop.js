var objectPaths = {
  "diamond": function(startX, startY) {
    return "M "+startX+","+startY+"m -20,0 l 20,-20 l 20,20 l -20,20 l -20,-20 m 20,20 l -7.5,-20 l 7.5,-20 l 7.5,20 l -7.5,20"
  },
  "pyramid": function(startX, startY) {
    return "M"+startX+","+startY+" m0,-20 l20,40 l-40,0 l20,-40 l20,17 l0,23 m0,-23 l-40,23"
  },
  "cylinder": function(startX, startY) {
    return "M"+startX+","+startY+"m-15,10 a 15,8 0 0,0 30,0 v-20 a 15,8 0 0,0 -30,0 v20 m30,0 a 15,8, 0 0,0 -30,0 m0,-20 a 15,8 0 0,0 30,0"
  },
  "cube": function(startX, startY) {
    return "M"+startX+","+startY+"m-12.5,-12.5 l12.5,-5 h 22.5 v22.5  l-12.5,5  h-22.5v -22.5 h22.5 l12.5,-5 v22.5 m-12.5,5 m-22.5,0 l12.5,-5 h22.5 m-22.5,0 v-22.5 m10,5 v 22.5"
  },
  "hexagon": function(startX, startY) {
    return "M "+startX+","+startY+"m-15,-5 l10,-10 l5,-3 h10 l10,10 v10 l-10,10 l-5,3 h-10 l-10,-10 v-10 l10,-10 h10 l10,10 v10 l-10,10 h-10 l-10,-10 v-10 l5,-3 l10,-10 l-5,3 m5,-3 h10 l-5,3 m5,-3 l10,10 l-5,3 m5,-3 v10 l-5,3 m5,-3 l-10,10 l-5,3 m5,-3 h-10 l-5,3 m5,-3 l-10,-10 l-5,3 m5,-3 v-10"
  },
  "cone": function(startX, startY) {
    return "M"+startX+","+startY+"m-20,15 a 20,10 0 0,0 40,0 l-20,-30 l-20,30 m40,0 a20,10 0 0,0 -40,0"
  }
}

var makeSphere = function(startX, startY, paper) {
  const sphere = paper.circle(startX, startY, 20).attr({fill: "#8642f4"});
  paper.path("M"+startX+","+startY+" m20,0 a 40,40, 0 0 1 -40,0");
  paper.path("M"+startX+","+startY+" m-20,0 a 40,40, 0 0 1 40,0");
  return sphere;
};

var makeTrials = function(trialTypes, objects, binSize) {
  objects = _.shuffle(objects);
  var result = [];
  var resultSummary = []
  for (i=0; i<trialTypes.length; i++) {
    resultSummary.push({
      id: i,
      objectName: objects[i].plural,
      successfulTestResult: objects[i].sound,
      proportionSuccess: trialTypes[i].proportionSuccess,
      utteranceType: trialTypes[i].utteranceType
    });
    if (i == 0) {
      result.push({
        id: i,
        type: "transition",
        objectNamePlural: objects[i].plural,
        investigator: objects[i].investigator,
        pronoun: objects[i].pronoun
      });
    }
    else {
      result.push({
        id: i,
        type: "transition",
        objectNamePlural: objects[i].plural,
        investigator: objects[i].investigator,
        pronoun: objects[i].pronoun,
        prevItem: objects[i-1].plural,
        prevInvestigator: objects[i-1].investigator,
        prevPronoun: objects[i-1].investigator
      });
    }
    result.push({
      id: i,
      type: "explore",
      objectNamePlural: objects[i].plural,
      objectNameSingular: objects[i].singular,
      utteranceType: trialTypes[i].utteranceType,
      utteranceSpoken: objects[i].plural.toLowerCase()+trialTypes[i].utteranceType+'.mp3',
      shape: objects[i].shape,
      successfulTestResult: objects[i].sound,
      investigator: objects[i].investigator,
      pronoun: objects[i].pronoun,
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
      successfulTestResult: objects[i].sound
    });
    result.push({
      id: i,
      type: "testGeneric",
      objectNamePlural: objects[i].plural,
      successfulTestResult: objects[i].sound
    });
    result.push({
      id: i,
      type: "testFree",
      objectNamePlural: objects[i].plural
    });
    if (i == trialTypes.length - 1) {
      result.push({
        id: i,
        type: "transition",
        last: true
      });
    }
  }
  return {
    randomized_trials: result,
    trial_summary: resultSummary
  };
}

var drag_and_drop = {

  fixed_trials: function(objects, fixedOrders, binSize) {
    objects = _.shuffle(objects);
    fixedOrder = _.sample(fixedOrders);
    return makeTrials(fixedOrder, objects, binSize);
  },
    
  randomize_trials: function(objects, proportionsSuccess, utteranceTypes, binSize) {
    var trialTypes = [];
    for (i=0; i<proportionsSuccess.length; i++) {
      for (j=0; j<utteranceTypes.length; j++) {
        trialTypes.push({
          utteranceType: utteranceTypes[j],
	  proportionSuccess: proportionsSuccess[i]
        });
      }
    }
    trialTypes = _.shuffle(trialTypes);
    return makeTrials(trialTypes, objects, binSize);
  },
  makePlatformPath: function(startX, startY) {
    return "M "+startX+","+startY+"h 100 v -30 h -100 v 30 m 0,-30 l 60,-40 h 100 l -60,40 m 0,30 l 60,-40 v -30 l -60,40"
  },
  makeBlicketPile: function(startX, startY, numberBlickets, blicketPile, paper, greyedColor, type) {
    paper.path("M "+startX+","+startY+"m -70,-25 l 65,-25 h 140 l -65,25, h-140").attr({"stroke-width":2, stroke: "black", fill: "#f4aa42"}); // back part of box
    for (i = 0; i < numberBlickets; i++) {
      if (type =='sphere') {
        var newBlicket = makeSphere(startX+160*Math.random()-50, startY+60*Math.random()-30, paper);
      }
      else {
        var newBlicket = paper.path(objectPaths[type](startX+160*Math.random()-50, startY+80*Math.random()-40)).attr({fill: greyedColor});
      }
      blicketPile.push(newBlicket);
    }
    paper.path("M "+startX+","+startY+"m-70,85 v -110 h 140 v 110 h -140").attr({"stroke-width": 2, stroke: "black", fill: "#f4aa42"}); // front part of box
    paper.path("M "+startX+","+startY+"m70,85 l 65,-25 v -110 l-65,25 v 110").attr({"stroke-width": 2, stroke: "black", fill: "#f4aa42"}); // front part of box
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
  alert: function(paper, headerText, text, belowTextBefore, belowTextAfter, fadeOut, wait, fadeInTime) {
    var alert = paper.set();
      paper.customAttributes.startReading = Date.now();
      alert.push(paper.rect(20,300,770,200).attr({fill:"gray","fill-opacity":0,"stroke-width":0}));
      alert.push(paper.text(400, 330, headerText).attr({fill: "white", "stroke-opacity": 0, "font-size": 14}));
      alert.push(paper.text(400,375, text).attr({fill: "white","stroke-opacity":0, "font-size": 20, "font-weight": "bold"}));
      alert.push(paper.text(400, 420, belowTextBefore).attr({fill: "white", "stroke-opacity": 0, "font-size": 14}));
      alert.push(paper.text(400, 435, belowTextAfter).attr({fill: "white", "stroke-opacity": 0, "font-size": 14}));
      alert.push(paper.text(400, 480, 'Click anywhere inside the box to continue.').attr({fill: "white", "stroke-opacity": 0, "font-size": 10}));
    alert.click(function() {
      if (Date.now() - paper.customAttributes.startReading >= 5000 || !wait) {
        alert.remove();
      }
    });
    if (fadeOut) {
      var fadeOutFunc = Raphael.animation({"fill-opacity":0,"stroke-opacity":0},500, "easeInOut", function() {alert.remove()});
      alert.forEach(function(elem) {
        elem.animate({"fill-opacity": 1,"stroke-opacity":1},500,"easeInOut", function() {elem.animate(fadeOutFunc.delay(500))})
      });
    }
    else {
      alert.forEach(function(elem) {
        elem.animate({"fill-opacity": 1, "stroke-opacity":1}, fadeInTime, "easeInOut");
      });
    }
    return alert;
  }
}