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

    slides.botcaptcha  = slide({
	name: "botcaptcha",
	// amount of trials to enter correct response
	trial: 0,
	start: function(){
	    $("#fail").hide()
	    // define possible speaker and listener names
	    // fun fact: 10 most popular names for boys and girls
	    var speaker = _.shuffle(["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles"])[0];
	    var listener = _.shuffle(["Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Margaret"])[0];

	    var story = speaker + ' says to ' + listener + ': "It\'s a beautiful day, isn\'t it?"'

	    $("#story").html(story)
	    $("#question").html("Who is " + speaker + " talking to?" +
				"<br><strong>Note: please type your answer in lower-case.")

	    // don't allow enter press in text field
	    $('#listener-response').keypress(function(event) {
		if (event.keyCode == 13) {
		    event.preventDefault();
		}
	    });

	    // don't show any error message
	    $("#error").hide();
	    $("#error_incorrect").hide();
	    $("#error_2more").hide();
	    $("#error_1more").hide();
	    this.listener = listener, this.speaker = speaker
	},
	button:  function() {
            response = $("#listener-response").val().replace(" ","");

            // response correct
            // if (this.listener.toLowerCase() == response.toLowerCase()) {
            if (this.listener.toLowerCase() == response) {
		// exp.catch_trials.botresponse = $("#listener-response").val();
		exp.go();

		// response false
            } else {
		this.trial = this.trial + 1;
		$("#error_incorrect").show();
		if (this.trial == 1) {
                    $("#error_2more").show();
		} else if (this.trial == 2) {
                    $("#error_2more").hide();
                    $("#error_1more").show();
		} else {
                    $("#error_incorrect").hide();
                    $("#error_1more").hide();
                    $("#next").hide();
                    $('#quest-response').css("opacity", "0.2");
                    $('#listener-response').prop("disabled", true);
                    $("#error").show();
                    $("#fail").show()

		};
            };
	}

	//$("#next").on("click",);
	//}
    })

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
		$('#identification').hide();
		$('.err').hide();

		$('.button').hide();
		$('#testStatement').text('When you enter the lab, you see that there is a scientist already working in there. He says: ');
		if (stim.sound) {
		    exp.sound = new Audio('../_shared/audio/'+stim.sound+'.mp3');
		}

		const paper = new Raphael(document.getElementById('paper'), 800, 450);
		exp.paper = paper;
		const man = paper.image('../_shared/images/man.png', 0,0,250,430);
		const bubbleText = '(Click on the speech bubble when you are ready.)';

		function demo(accidental, item, xcoord, pointerLeft) {
		    if (!accidental) {
			const pedagogical = new Audio('../_shared/audio/pedagogical.m4a');
			pedagogical.play();
			$('#utterance').text('Look at this!');
		    }
		    if (stim.sound) {
			if (accidental) {
			    item.animate({path:objectPaths[stim.shape](xcoord,380)}, 1000, 'linear', function() {
				exp.sound.play();
			    });
			} else {
			    setTimeout(function() {
				paper.pointer = paper.image('../_shared/images/pointer.png', 600, 100, 100, 100);
				paper.pointer.animate({x:xcoord-40, y:90}, 1000, 'linear');
				setTimeout(function() {
				    exp.sound.play();
				}, 1000);
			    }, 1500);
			}
		    } else {
			item.animate({x:400}, 500, 'linear', function() {
			    item.animate({width: 320, height: 320, x: 400, y:30}, 500, 'linear', function() {
				if (!accidental) {
				    if (pointerLeft) {
					paper.pointer = paper.image('../_shared/images/pointer.png', 400, 100, 100, 100).rotate(90);
					function animatePointer() {
					    paper.pointer.animate({x:400, y:0}, 500, 'linear', function() {
						paper.pointer.animate({x:400, y:100}, 500, 'linear', animatePointer);
					    });
					    
					}
					animatePointer();
				    } else {
					paper.pointer = paper.image('../_shared/images/pointer.png', 650, 100, 100, 100).rotate(270);
					function animatePointer() {
					    paper.pointer.animate({x:650, y:0}, 500, 'linear', function() {
						paper.pointer.animate({x:650, y:100}, 500, 'linear', animatePointer);
					    });
					    
					}
					animatePointer();
				    }
				    
				}
			    });
			});
			
		    }
		}

		function showPedagogical(item, xcoord, callback, pointerLeft) {
		    $('#utterance').text('Now I have something to show you. Are you ready?');
		    $('#instruct').show();
		    const readyPedagogical = new Audio('../_shared/audio/readyPedagogical.m4a');
		    readyPedagogical.play();
		    const speech = paper.set();
		    setTimeout(function() {
			speech.push(paper.path(speech_bubble(600, 120)).attr({"stroke": 2, "fill": '#fcfac2'}));
			speech.push(paper.text(600,150, "I'm ready!").attr({"font-size": 14}));
			speech.mouseover(function() {
			    speech.attr('cursor', 'pointer');
			})
			$('#instruct').text(bubbleText);
			speech.click(function() {
			    speech.remove();
			    demo(false, item, xcoord, pointerLeft);
			    $('#instruct').hide();
			    setTimeout(function() {
				callback();
			    }, 4000);
			});
		    }, 4000);
		}

		function showAccidental(item, xcoord, callback) {
		    if (stim.sound) {
			$('#utterance').text('Oops!');
			const oops = new Audio('../_shared/audio/oops.m4a');
			oops.play();
		    }
		    else {
			$('#utterance').text("Oh! Look at that!");
			const accidental = new Audio('../_shared/audio/accidental.m4a');
			accidental.play();
		    }
		    setTimeout(function() {
			demo(true, item, xcoord);
			callback();
		    }, 1000);
		}

		function setNextItem(i, n, timeout1, timeout2, demoItems, coverSets, paper, startCoords, offsetX, pointerOffset, manCoord) {
		    let x;
		    let item;
		    if (stim.sound) {
			item = demoItems[i];
			setTimeout(function() {
			    if (paper.pointer) {
				paper.pointer.remove();
			    }
			    man.animate({x:manCoord+i*offsetX}, 1000, 'linear');
			    if (i - 1 >= 0) {
				demoItems[i-1].remove();
			    }
			}, timeout1);
			setTimeout(function() {
			    if (coverSets !== null) {
				coverSets[i].remove();
				coverSets[i].remove();
			    }
			}, timeout2);
			x = startCoords[stim.singular.toLowerCase()][0]+i*offsetX;
		    } else {
			item = demoItems[n-i-1];
			if (paper.pointer) {
			    paper.pointer.remove();
			}
			setTimeout(function() {
			    if (coverSets !== null) {
				coverSets[n-i-1].remove();
				coverSets[n-i-1].remove();
			    }
			    demoItems[n-i].remove();
			}, timeout2);
			x = startCoords[stim.singular.toLowerCase()][0]+(n-i-1)*offsetX+pointerOffset;
		    }
		    return [x, item];
		}
		
		if (stim.trialType == "pedagogical") {
		    let demoItem;
		    if (stim.singular.toLowerCase() === 'blicket') {
			demoItem = paper.path(objectPaths[stim.shape](270,100)).attr("fill", stim.color);
		    }
		    else {
			demoItem = paper.image('../_shared/images/'+stim.image, 250, 60, 80, 80);
		    }
		    $('#utterance').text('This is a '+stim.singular.toLowerCase()+'.')
		    const button = paper.path();
		    const itemId = new Audio('../_shared/audio/'+stim.singular.toLowerCase()+'Id.m4a');
		    itemId.play();
		    setTimeout(function() {
			$('#utterance').text('Now I have something to show you. Are you ready?');
			$('#instruct').show();
			const readyPedagogical = new Audio('../_shared/audio/readyPedagogical.m4a');
			readyPedagogical.play();
			const speech = paper.set();
			setTimeout(function() {
			    speech.push(paper.path(speech_bubble(600, 120)).attr({"stroke": 2, "fill": '#fcfac2'}));
			    speech.push(paper.text(600,150, "I'm ready!").attr({"font-size": 14}));
			    speech.mouseover(function() {
				speech.attr('cursor', 'pointer');
			    })
			    $('#instruct').text(bubbleText);
			    speech.click(function() {
				speech.remove();
				let x;
				let pointerLeft;
				if (stim.sound) {
				    x = 270;
				    pointerLeft = false;
				} else {
				    if (stim.singular.toLowerCase() == 'dax') {
					x = 330;
					pointerLeft = false;
				    } else {
					x = 330;
					pointerLeft = true;
				    }
				}
				demo(false, demoItem, x, pointerLeft);
				$('#instruct').hide();
				$('.button').show();
			    });
			}, 4000);
		    }, 2000);
		}
		else if (stim.trialType == "pedageneric") {
		    let demoItem;
		    if (stim.singular.toLowerCase() === 'blicket') {
			demoItem = paper.path(objectPaths[stim.shape](270,100)).attr("fill", stim.color);
		    }
		    else {
			demoItem = paper.image('../_shared/images/'+stim.image, 250, 60, 80, 80);
		    }
		    $('#utterance').text('This is a '+stim.singular.toLowerCase()+'.')
		    const button = paper.path();
		    const itemId = new Audio('../_shared/audio/'+stim.singular.toLowerCase()+'Id.m4a');
		    itemId.play();
		    setTimeout(function() {
			$('#utterance').text('Now I have something to tell you. Are you ready?');
			const readyGeneric = new Audio('../_shared/audio/readyGeneric.m4a');
			readyGeneric.play();
			const speech = paper.set();
			setTimeout(function() {
			    $('#instruct').text(bubbleText);
			    speech.push(paper.path(speech_bubble(600, 120)).attr({"stroke": 2, "fill": '#fcfac2'}));
			    speech.push(paper.text(600,150, "I'm ready!").attr({"font-size": 14}));
			    speech.mouseover(function() {
				speech.attr('cursor', 'pointer');
			    })
			    $('#instruct').text(bubbleText);

			    speech.click(function() {
				speech.remove();
				setTimeout(function() {
				    $('.button').show();
				}, 2000);
				if (stim.sound) {
				    $('#utterance').text(stim.plural+' '+stim.sound+'!');
				} else {
				    $('#utterance').text(stim.plural+' '+stim.featurePlural+'!');
				}
				$('#instruct').hide();
				const genericUtterance = new Audio('../_shared/audio/'+stim.singular.toLowerCase()+'Generic.m4a');
				genericUtterance.play();
			    });
			}, 4000);
		    }, 2000);
		} else if (stim.trialType == "accidental") {
		    let demoItem;
		    if (stim.singular.toLowerCase() === 'blicket') {
			demoItem = paper.path(objectPaths[stim.shape](270,100)).attr("fill", stim.color);
		    }
		    else {
			demoItem = paper.image('../_shared/images/'+stim.image, 250, 60, 80, 80);
		    }
		    $('#utterance').text('Oh! This is a '+stim.singular.toLowerCase()+'.')
		    const accidentalUtterance = new Audio('../_shared/audio/'+stim.singular.toLowerCase()+'Accidental.m4a');
		    accidentalUtterance.play();
		    const cover = paper.image('../_shared/images/cover.png', 210, -40, 150, 230);
		    const label = paper.set();
		    label.push(paper.rect(305, 50, 50, 25).attr({"fill": '#fcfac2'}));
		    label.push(paper.text(330, 65, stim.singular));
		    setTimeout(function() {
			if (stim.sound) {
			    $('#utterance').text('Oops!');
			    const oops = new Audio('../_shared/audio/oops.m4a');
			    oops.play();
			}
			else {
			    $('#utterance').text("Oh! Look at that!");
			    const accidental = new Audio('../_shared/audio/accidental.m4a');
			    accidental.play();
			}
			cover.remove();
			label.remove();
			setTimeout(function() {
			    let x;
			    if (stim.sound) {
				x = 270;
			    } else if (stim.singular.toLowerCase() == 'dax') {
				x = 300;
			    } else {
				x = 230;
			    }
			    demo(true, demoItem, x);
			}, 1000);
		    }, 3000);
		} else if (stim.trialType == "2accidental") {
		    const startCoords = {
			"blicket": [270, 100],
			"dax": [250, 60],
			"fep": [250, 60]
		    };
		    const offset = 180;
		    const coverCoords = [210, -40, 150, 230];
		    const labelCoords = [305, 50, 50, 25];
		    const accidentalUtterance = new Audio('../_shared/audio/'+stim.plural.toLowerCase()+'Accidental.m4a');
		    const manCoord = 0;
		    const pointerOffset = 80;
		    accidentalUtterance.play();
		    $('.button').hide();
		    
		    $('#utterance').text('Oh! These are two '+stim.plural.toLowerCase()+'.');
		    const demoItems = [];
		    for (i=0;i<2;i++) {
			x = startCoords[stim.singular.toLowerCase()][0]+i*offset;
			if (stim.singular.toLowerCase() === 'blicket') {
			    demoItems.push(paper.path(objectPaths[stim.shape](x,startCoords['blicket'][1])).attr("fill", stim.color));
			} else {
			    demoItems.push(paper.image('../_shared/images/'+stim.image, x, startCoords[stim.singular.toLowerCase()][1], 80, 80));
			}
		    };
		    const coverSets = [];
		    for (i=0;i<2;i++) {
			x = startCoords[stim.singular.toLowerCase()][0]+i*offset;
			const set = paper.set();
			set.push(paper.image('../_shared/images/cover.png', coverCoords[0]+i*offset, coverCoords[1], coverCoords[2], coverCoords[3]));
			set.push(paper.rect(labelCoords[0]+i*offset, labelCoords[1], labelCoords[2], labelCoords[3]).attr({"fill": '#fcfac2'}));
			set.push(paper.text(labelCoords[0]+i*offset+labelCoords[1]/2, labelCoords[1]+15, stim.singular));
			coverSets.push(set);
		    }
		    
		    setTimeout(function() {
			let x;
			let item;
			if (stim.sound) {
			    item = demoItems[0];
			    coverSets[0].remove();
			    coverSets[0].remove();
			    x = startCoords[stim.singular.toLowerCase()][0]+0*offset;
			} else {
			    item = demoItems[1];
			    coverSets[1].remove();
			    coverSets[1].remove();
			    x = startCoords[stim.singular.toLowerCase()][0]+1*offset;
			}
			showAccidental(item, x, function() {
			    let x;
			    let item;
			    if (stim.sound) {
				item = demoItems[1];
				setTimeout(function() {
				    man.animate({x:manCoord+1*offset}, 1000, 'linear');
				    demoItems[0].remove();
				}, 2000);
				setTimeout(function() {
				    coverSets[1].remove();
				    coverSets[1].remove();
				}, 3000);
				x = startCoords[stim.singular.toLowerCase()][0]+1*offset;
			    } else {
				item = demoItems[0];
				setTimeout(function() {
				    coverSets[0].remove();
				    coverSets[0].remove();
				    demoItems[1].remove();
				}, 3000);
				x = startCoords[stim.singular.toLowerCase()][0]+0*offset+pointerOffset;
			    }
			    setTimeout(function() {
				showAccidental(item, x, function() {
				    $('.button').show();
				});
			    }, 3000);
			});
		    }, 3000);
		} else if (stim.trialType == "3accidental") {
		    const startCoords = {
			"blicket": [270, 100],
			"dax": [250, 60],
			"fep": [250, 60]
		    };
		    const offsetX = 180;
		    const offsetY = 120;
		    const coverCoords = [210, -40, 150, 230];
		    const labelCoords = [305, 50, 50, 25];
		    const accidentalUtterance = new Audio('../_shared/audio/3'+stim.plural.toLowerCase()+'Accidental.m4a');
		    const manCoord = 0;
		    const pointerOffset = 80;
		    accidentalUtterance.play();
		    $('.button').hide();
		    
		    $('#utterance').text('Oh! These are three '+stim.plural.toLowerCase()+'.');
		    const demoItems = [];
		    for (i=0;i<3;i++) {
			if (stim.singular.toLowerCase() === 'blicket') {
			    demoItems.push(paper.path(objectPaths[stim.shape](startCoords[stim.singular.toLowerCase()][0]+i*offsetX,startCoords['blicket'][1])).attr("fill", stim.color));
			} else {
			    demoItems.push(paper.image('../_shared/images/'+stim.image, startCoords[stim.singular.toLowerCase()][0], startCoords[stim.singular.toLowerCase()][1]+i*offsetY, 80, 80));
			}
		    };
		    const coverSets = [];
		    for (i=0;i<3;i++) {
			x = startCoords[stim.singular.toLowerCase()][0]+i*offsetX;
			const set = paper.set();
			if (stim.singular.toLowerCase() === 'blicket') {
			    set.push(paper.image('../_shared/images/cover.png', coverCoords[0]+i*offsetX, coverCoords[1], coverCoords[2], coverCoords[3]));
			    set.push(paper.rect(labelCoords[0]+i*offsetX, labelCoords[1], labelCoords[2], labelCoords[3]).attr({"fill": '#fcfac2'}));
			    set.push(paper.text(labelCoords[0]+i*offsetX+labelCoords[1]/2, labelCoords[1]+15, stim.singular));
			} else {
			    set.push(paper.image('../_shared/images/cover.png', coverCoords[0], coverCoords[1]+i*offsetY, coverCoords[2], coverCoords[3]));
			    set.push(paper.rect(labelCoords[0], labelCoords[1]+i*offsetY, labelCoords[2], labelCoords[3]).attr({"fill": '#fcfac2'}));
			    set.push(paper.text(labelCoords[0]+labelCoords[1]/2, labelCoords[1]+15+i*offsetY, stim.singular));
			}
			coverSets.push(set);
		    }
		    
		    setTimeout(function() {
			const nextItemData1 = setNextItem(0, 3, 0, 0, demoItems, coverSets, paper, startCoords, offsetX, pointerOffset, manCoord);
			showAccidental(nextItemData1[1], nextItemData1[0], function() {
			    const nextItemData2 = setNextItem(1, 3, 2000, 3000, demoItems, coverSets, paper, startCoords, offsetX, pointerOffset, manCoord); 
			    setTimeout(function() {
				showAccidental(nextItemData2[1], nextItemData2[0], function() {
				    const nextItemData3 = setNextItem(2, 3, 2000, 3000, demoItems, coverSets, paper, startCoords, offsetX, pointerOffset, manCoord);
				    setTimeout(function() {
					showAccidental(nextItemData3[1], nextItemData3[0], function() {
					    $('.button').show();
					})
				    }, 3000);
				});
			    }, 3000);
			});
		    }, 4000);
		} else if (stim.trialType == "4accidental") {
		    const startCoords = {
			"blicket": [270, 100],
			"dax": [250, 10],
			"fep": [250, 10]
		    };
		    const offsetX = 120;
		    const offsetY = 100;
		    const coverCoords = [210, -90, 150, 230];
		    const labelCoords = [305, 50, 50, 25];
		    const accidentalUtterance = new Audio('../_shared/audio/4'+stim.plural.toLowerCase()+'Accidental.m4a');
		    const manCoord = 0;
		    const pointerOffset = 80;
		    accidentalUtterance.play();
		    $('.button').hide();
		    
		    $('#utterance').text('Oh! These are four '+stim.plural.toLowerCase()+'.');
		    const demoItems = [];
		    for (i=0;i<4;i++) {
			if (stim.singular.toLowerCase() === 'blicket') {
			    demoItems.push(paper.path(objectPaths[stim.shape](startCoords[stim.singular.toLowerCase()][0]+i*offsetX,startCoords['blicket'][1])).attr("fill", stim.color));
			} else {
			    demoItems.push(paper.image('../_shared/images/'+stim.image, startCoords[stim.singular.toLowerCase()][0], startCoords[stim.singular.toLowerCase()][1]+i*offsetY, 70, 70));
			}
		    };
		    const coverSets = [];
		    for (i=0;i<4;i++) {
			x = startCoords[stim.singular.toLowerCase()][0]+i*offsetX;
			const set = paper.set();
			if (stim.singular.toLowerCase() === 'blicket') {
			    set.push(paper.image('../_shared/images/cover.png', 210+i*offsetX, -50, coverCoords[2], coverCoords[3]));
			    set.push(paper.rect(labelCoords[0]+i*offsetX, labelCoords[1], labelCoords[2], labelCoords[3]).attr({"fill": '#fcfac2'}));
			    set.push(paper.text(labelCoords[0]+i*offsetX+labelCoords[1]/2, labelCoords[1]+15, stim.singular));
			} else {
			    set.push(paper.image('../_shared/images/cover.png', coverCoords[0], coverCoords[1]+i*offsetY, coverCoords[2], coverCoords[3]));
			    set.push(paper.rect(labelCoords[0], labelCoords[1]+i*offsetY, labelCoords[2], labelCoords[3]).attr({"fill": '#fcfac2'}));
			    set.push(paper.text(labelCoords[0]+labelCoords[1]/2, labelCoords[1]+15+i*offsetY, stim.singular));
			}
			coverSets.push(set);
		    }
		    
		    setTimeout(function() {
			const nextItemData1 = setNextItem(0, 4, 0, 0, demoItems, coverSets, paper, startCoords, offsetX, pointerOffset, manCoord);
			showAccidental(nextItemData1[1], nextItemData1[0], function() {
			    const nextItemData2 = setNextItem(1, 4, 2000, 3000, demoItems, coverSets, paper, startCoords, offsetX, pointerOffset, manCoord); 
			    setTimeout(function() {
				showAccidental(nextItemData2[1], nextItemData2[0], function() {
				    const nextItemData3 = setNextItem(2, 4, 2000, 3000, demoItems, coverSets, paper, startCoords, offsetX, pointerOffset, manCoord);
				    setTimeout(function() {
					showAccidental(nextItemData3[1], nextItemData3[0], function() {
					    const nextItemData4 = setNextItem(3, 4, 2000, 3000, demoItems, coverSets, paper, startCoords, offsetX, pointerOffset, manCoord);
					    setTimeout(function() {
						showAccidental(nextItemData4[1], nextItemData4[0], function() {
						    $('.button').show();
						});
					    }, 3000);
					})
				    }, 3000);
				});
			    }, 3000);
			});
		    }, 4500);
		} else if (stim.trialType == "2pedagogical") {
		    const pedagogicalUtterance = new Audio('../_shared/audio/'+stim.plural.toLowerCase()+'Id.m4a');
		    pedagogicalUtterance.play();
		    let demoItem2;
		    if (stim.singular.toLowerCase() === 'blicket') {
			demoItem2 = paper.path(objectPaths[stim.shape](370,100)).attr("fill", stim.color);
		    }
		    else {
			demoItem2 = paper.image('../_shared/images/'+stim.image, 330, 60, 80, 80);
		    }
		    $('#utterance').text('These are two '+stim.plural.toLowerCase()+'.');
		    $('.button').hide();
		    setTimeout(function() {
			let x;
			let item;
			if (stim.sound) {
			    item = demoItem;
			    x = 270;
			} else {
			    item = demoItem2
			    if (stim.singular.toLowerCase() == 'dax') {
				x = 330;
			    } else {
				x = 350;
			    }
			}
			showPedagogical(item, x, function() {
			    let x;
			    let item;
			    if (stim.sound) {
				item = demoItem2;
				if (paper.pointer) {
				    paper.pointer.remove();
				}
				demoItem.remove();
				man.animate({x:80}, 1000, 'linear');
				x = 370;
			    } else {
				item = demoItem;
				if (paper.pointer) {
				    paper.pointer.remove();
				}
				demoItem2.remove();
				if (stim.singular.toLowerCase() == 'dax') {
				    x = 330;
				} else {
				    x = 350;
				}
			    }
			    showPedagogical(item, x, function() {
				$('.button').show();
			    }, stim.singular.toLowerCase() === 'fep');
			}, stim.singular.toLowerCase() === 'fep');
		    }, 3000);
		} else if (stim.trialType == "3pedagogical") {
		    const startCoords = {
			"blicket": [270, 100],
			"dax": [250, 60],
			"fep": [250, 60]
		    };
		    const offsetX = 100;
		    const offsetY = 120;
		    const coverCoords = [210, -40, 150, 230];
		    const labelCoords = [305, 50, 50, 25];
		    const pedagogicalUtterance = new Audio('../_shared/audio/3'+stim.plural.toLowerCase()+'Id.m4a');
		    pedagogicalUtterance.play();
		    const manCoord = 0;
		    const pointerOffset = 100;
		    $('.button').hide();
		    
		    $('#utterance').text('These are three '+stim.plural.toLowerCase()+'.');
		    const demoItems = [];
		    for (i=0;i<3;i++) {
			if (stim.singular.toLowerCase() === 'blicket') {
			    demoItems.push(paper.path(objectPaths[stim.shape](startCoords[stim.singular.toLowerCase()][0]+i*offsetX,startCoords['blicket'][1])).attr("fill", stim.color));
			} else {
			    demoItems.push(paper.image('../_shared/images/'+stim.image, startCoords[stim.singular.toLowerCase()][0], startCoords[stim.singular.toLowerCase()][1]+i*offsetY, 80, 80).toBack());
			}
		    };
		    setTimeout(function() {
			const nextItemData1 = setNextItem(0, 3, 0, 0, demoItems, null, paper, startCoords, offsetX, pointerOffset, manCoord);
			showPedagogical(nextItemData1[1], nextItemData1[0], function() {
			    const nextItemData2 = setNextItem(1, 3, 0, 0, demoItems, null, paper, startCoords, offsetX, pointerOffset, manCoord);
			    showPedagogical(nextItemData2[1], nextItemData2[0], function() {
				const nextItemData3 = setNextItem(2, 3, 0, 0, demoItems, null, paper, startCoords, offsetX, pointerOffset, manCoord);
				showPedagogical(nextItemData3[1], nextItemData3[0], function() {
				    $('button').show();
				}, stim.singular.toLowerCase() === 'fep');
			    }, stim.singular.toLowerCase() === 'fep');
			}, stim.singular.toLowerCase() === 'fep');
		    }, 3000);
		} else if (stim.trialType == "4pedagogical") {
		    const startCoords = {
			"blicket": [270, 100],
			"dax": [250, 0],
			"fep": [250, 0]
		    };
		    const offsetX = 100;
		    const offsetY = 120;
		    const coverCoords = [210, -40, 150, 230];
		    const labelCoords = [305, 50, 50, 25];
		    const pedagogicalUtterance = new Audio('../_shared/audio/4'+stim.plural.toLowerCase()+'Id.m4a');
		    pedagogicalUtterance.play();
		    const manCoord = 0;
		    const pointerOffset = 100;
		    $('.button').hide();
		    
		    $('#utterance').text('These are four '+stim.plural.toLowerCase()+'.');
		    const demoItems = [];
		    for (i=0;i<4;i++) {
			if (stim.singular.toLowerCase() === 'blicket') {
			    demoItems.push(paper.path(objectPaths[stim.shape](startCoords[stim.singular.toLowerCase()][0]+i*offsetX,startCoords['blicket'][1])).attr("fill", stim.color));
			} else {
			    demoItems.push(paper.image('../_shared/images/'+stim.image, startCoords[stim.singular.toLowerCase()][0], startCoords[stim.singular.toLowerCase()][1]+i*offsetY, 80, 80).toBack());
			}
		    };
		    setTimeout(function() {
			const nextItemData1 = setNextItem(0, 4, 0, 0, demoItems, null, paper, startCoords, offsetX, pointerOffset, manCoord);
			showPedagogical(nextItemData1[1], nextItemData1[0], function() {
			    const nextItemData2 = setNextItem(1, 4, 0, 0, demoItems, null, paper, startCoords, offsetX, pointerOffset, manCoord);
			    showPedagogical(nextItemData2[1], nextItemData2[0], function() {
				const nextItemData3 = setNextItem(2, 4, 0, 0, demoItems, null, paper, startCoords, offsetX, pointerOffset, manCoord);
				showPedagogical(nextItemData3[1], nextItemData3[0], function() {
				    const nextItemData4 = setNextItem(3, 4, 0, 0, demoItems, null, paper, startCoords, offsetX, pointerOffset, manCoord);
				    showPedagogical(nextItemData4[1], nextItemData4[0], function() {
					$('button').show();
				    });
				}, stim.singular.toLowerCase() === 'fep');
			    }, stim.singular.toLowerCase() === 'fep');
			}, stim.singular.toLowerCase() === 'fep');
		    }, 3000);
		} else if (stim.trialType == "generic") {
		    if (stim.sound) {
			$('#utterance').text(stim.plural+' '+stim.sound+'!');
		    } else {
			$('#utterance').text(stim.plural+' '+stim.featurePlural+'!');
		    }
		    $('#paper').hide();
		    const genericUtterance = new Audio('../_shared/audio/'+stim.singular.toLowerCase()+'Generic.m4a');
		    genericUtterance.play();
		    setTimeout(function() {
			$('.button').show();
		    }, 2000)
		}
	    } else if (stim.type == "response") {
		$('#trial').hide();
		$('#response').show();
		$('#identification').hide();
		if (stim.sound) {
		    $('.prompt').html('Imagine that you have another '+stim.singular.toLowerCase()+'. What are the chances that it '+stim.sound+'s?');
		}
		else {
		    $('.prompt').html('Imagine that you have another '+stim.singular.toLowerCase()+'. What are the chances that it '+stim.featureSingular+'?');
		}
		this.init_sliders();
		exp.sliderPost = null;
	    }
	},
	init_sliders : function() {
	    utils.make_slider("#single_slider", function(event, ui) {
		exp.sliderPost = ui.value;
	    });
	},
	button: function() {
	    if (this.stim.type == "response") {
		if (exp.sliderPost === null) {
		    $('.err').show();
		} else {
		    exp.data_trials.push(_.extend(this.stim, {response: exp.sliderPost, condition: exp.condition}));
		    _stream.apply(this);
		}
	    } else if (this.stim.type == "trial") {
		_stream.apply(this);
		if (exp.paper) {
		    if (exp.paper.pointer) {
			exp.paper.pointer.remove();
		    }
		    exp.paper.remove();
		}
	    }
	}
    });

    slides.identification = slide({
	name: "identification",
	present: exp.id_trials,
	present_handle: function(stim) {
	    $('.err').hide();
	    $('.button').show();
	    $('#instructId').text('Which one of these other ones is a '+stim.singular.toLowerCase()+'?');
	    if (exp.distractorPaper) {
		exp.distractorPaper.clear();
	    } else {
		const paper = new Raphael(document.getElementById('paperId'), 800, 450);
		exp.distractorPaper = paper;
	    }
	    const distractors = exp.distractorPaper.set();
	    const positions = _.shuffle([[300,200],[500,200],[300,300],[500,300]])
	    let activeItem;
	    exp.correctId = false;
	    exp.distractorClicks = 0;
	    exp.selected = null;
	    const expScope = this;
	    let selection = null;
	    this.stim = stim;

	    stim.distractors.forEach(function(distractor, i) {
		if (stim.image) {
		    distractors.push(exp.distractorPaper.image('../_shared/images/'+distractor, positions[i+1][0]-50, positions[i+1][1]-50, 80, 80).click(function() {
			exp.distractorClicks ++;
			exp.correctId = false;
			exp.selected = distractor;
			if (selection !== null) {
			    selection.remove();
			}
			selection = exp.distractorPaper.rect(positions[i+1][0]-50, positions[i+1][1]-50, 90, 90);
		    }));
		} else {
		    distractors.push(exp.distractorPaper.path(objectPaths[distractor.shape](positions[i+1][0], positions[i+1][1])).attr("fill", distractor.color).click(function() {
			exp.distractorClicks ++;
			exp.correctId = false;
			exp.selected = distractor;
			if (selection !== null) {
			    selection.remove();
			}
			selection = exp.distractorPaper.rect(positions[i+1][0]-50, positions[i+1][1]-50, 90, 90);
		    }));
		}
	    });
	    if (stim.image) {
		activeItem = exp.distractorPaper.image('../_shared/images/'+stim.image, positions[0][0]-50, positions[0][1]-50, 80, 80);
	    } else {
		activeItem = exp.distractorPaper.path(objectPaths[stim.shape](positions[0][0], positions[0][1])).attr("fill", stim.color);
	    }
	    activeItem.click(function() {
		exp.correctId = true;
		exp.selected = "correct";
		if (selection !== null) {
		    selection.remove();
		}
		selection = exp.distractorPaper.rect(positions[0][0]-50, positions[0][1]-50, 90, 90);
	    });
	},
	button: function() {
	    if (exp.selected === null) {
		$('.err').show();
	    } else {
		exp.data_trials.push(_.extend(this.stim, {distractorClicks: exp.distractorClicks, selected: exp.selected, correctId: exp.correctId, condition: exp.condition}));
		_stream.apply(this);
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
    exp.condition = _.sample(["4pedagogical", "4accidental"]); //can randomize between subject conditions here
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
	'botcaptcha',
	'sound_check',
	'introduction',
	'trials',
	'identification',
	'subj_info', 'thanks'
    ];

    const trials = _.shuffle([
	_.extend(
	    {
		distractors: drag_and_drop.objects.slice(1,4),
		featureSingular: drag_and_drop.objects[0].sound+"s",
	    },
	    drag_and_drop.objects[0],
	),
	drag_and_drop.biologics[0],
	drag_and_drop.biologics[1]    
    ])

    exp.trials_data = [];
    trials.forEach(function(trial) {
	exp.trials_data = exp.trials_data.concat([ 
	    _.extend(
		{
		    trialType: exp.condition,
		    type: "trial",
		},
		trial,
	    ),
	    _.extend(
		{type: "response"},
		trial,
	    )
	]);
    });

    exp.id_trials = [];
    trials.forEach(function(trial) {
	if (exp.condition != "generic") {
	    exp.id_trials = exp.id_trials.concat([
		_.extend(
		    {type: "id"},
		    trial,
		)
	    ])
	}
    });

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
