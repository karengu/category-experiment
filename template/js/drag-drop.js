// object of functions that return the svg paths as strings for given object shapes
// the start coordinates are the coordinates at the middle of the object
var objectPaths = {
    "diamond": function(startX, startY) {
	return "M "+startX+","+startY+"m -20,0 l 20,-20 l 20,20 l -20,20 l -20,-20 m 20,20 l -7.5,-20 l 7.5,-20 l 7.5,20 l -7.5,20"
    },
    "largediamond": function(startX, startY) {
	return "M "+startX+","+startY+"m -80,0 l 80,-80 l 80,80 l -80,80 l -80,-80 m 80,80 l - 30,-80 l 30,-80 l 30,80 l -30,80";
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
    },
    "rectangle": function(startX, startY) {
	return "M"+startX+","+startY+"h50 l20,-10 l-20,10 v20 h-50 v-20 l20,-10 h50 v20 l-20,10 v-20";
    }
}

// return the svg path as a string for a speech bubble, given the start coordinates
function speech_bubble(x, y) {
    // x and y are the coordinates at the middle top of the speech bubble
    return "M"+x+","+y+"c22.108,0,40.03,12.475,40.03,27.862c0,15.387,-17.922,27.862,-40.03,27.862c-6.931,0,-13.449,-1.227,-19.134,-3.384c-11.22,4.224,-26.539,12.202,-26.539,12.202c0,0,9.989,-5.655,14.107,-12.521c1.052,-1.755,1.668,-3.595,2.021,-5.362c-6.51,-4.955,-10.485,-11.553,-10.485,-18.797c0,-15.387,17.922,-27.862,40.03,-27.862m0,2.22";
}

var drag_and_drop = {

    objects: [
	{
	    plural: "Blickets",
	    singular: "Blicket",
	    color: "#f44248",
	    greyed: "#992a34",
	    sound: "squeak",
	    shape: "diamond",
	    investigator: "Ashley",
	    pronoun: "She"
	},
	{
	    plural: "Daxes",
	    singular: "Dax",
	    color: "#ff0",
	    greyed: "#999937",
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
	}],
    // biologics are not svg paths but transparent images instead
    biologics: [
	{
	    plural: "Feps",
	    singular: "Fep",
	    image: 'animaltarget.png',
	    featurePlural: 'have white wings',
	    featureSingular: 'has white wings',
	    distractors: ['animaldistractor1.png', 'animaldistractor2.png', 'animaldistractor3.png'],
	    featureLabel: 'White wings.',
	featureLabelAccidental: 'Look at that! White wings.',
	},
	{
	    plural: "Daxes",
	    singular: "Dax",
	    image: "planttarget.png",
	    featurePlural: 'have black centers',
	    featureSingular: 'has a black center',
	    distractors: ['plantdistractor1.png', 'plantdistractor2.png', 'plantdistractor3.png'],
	    featureLabel: 'A black center.',
	    featureLabelAccidental: 'Look at that! A black center.',
	}
    ],
}
