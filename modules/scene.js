/*jshint esversion:6, devel: true, browser: true*/

const Scene = (function () {
  
  "use strict";
  
  //object to return
  const self = {};
  
  ///////////////////////
  // PRIVATE VARIABLES //
  ///////////////////////
  
  //holds the Scene objects as they're parsed by Scene.init
  const story = {};
  //hold private references to current origin, current story name, and current Scene, as passed in via Scene.init
  let __currentOrigin = "";
  let __storyName = "";
  let __currentScene = "";
  let __currentFrame = "";
  //holds on to optional prefix value for gluing at the start of the next Frame's text
  let __prefix = false;
  //function for creating unique ids for options
  const __uidMaker = function () {
    let i = 0;
    return function() {
      return i++;
    };
  };
  const __newUid = __uidMaker();
  
  //TODO: options should also be objects inside Frames with their own methods etc.
  
  //Constructor for Frames, to be run in Scene.init
  const Frame = function(settings) {
    this.id = settings.id;
    this.text = settings.text;
    this.text2 = settings.text2 || false;
    this.options = settings.options || [];
    //add a unique id to each option
    for (let i = 0; i < this.options.length; i += 1) {
      this.options[i].uid = __newUid();
    }
    this.objective = settings.objective || false;
    this.completeObjective = settings.completeObjective || false;
    this.failObjective = settings.failObjective;
    this.getItem = settings.getItem || false;
    this.energy = settings.energy || false;
    this.enthusiasm = settings.enthusiasm || false;
    this.time = settings.time || false;
    this.money = settings.money || false;
    this.choice = settings.choice || false;
  };
  
  /////////////////////////////
  // FRAME PROTOTYPE METHODS //
  /////////////////////////////
  
  //return frame text (with prefix, if one is stored)  
  Frame.prototype.assembleText = function () {
    if (__prefix) {
      let temptext = `${__prefix}<br>${this.text}`;
      __prefix = false;
      return temptext;
    } else {
      return this.text;
    }
  };
  
  //remove frame options permanently if their oneoff is set to true
  Frame.prototype.removeOneoffs = function () {
    let i = this.options.length;
    while (i--) {
      if (this.options[i].oneoff) {
        this.options.splice(i, 1);
      }
    }
  };
  
  //load up the current frame and execute any necessary tasks
  Frame.prototype.render = function () {
    View.setFrameText(this.assembleText());
    
    //filter out options where showif conditions evaluate to false
    let filteredOptions = this.options.filter(function(opt) {
      if (opt.showif !== undefined) {
        //split showif strings into subarrays
        let conditions = [];
        for (let i = 0; i < opt.showif.length; i += 1) {
          conditions.push(opt.showif[i].split(" "));
        }
        //validate all the conditions
        let outcome = this.validateConditions(conditions);
        return outcome;
      } else {
        return true;
      }
    }, this);

    View.addOptions(filteredOptions);
    
    this.runHelpers(this);
    console.log(`Currently at: ${this.id}`);
    __currentFrame = this.id;
    
  };
  
  //processes commonalities for option or frame. 'focus' stands in for either "Frame" or "option"
  Frame.prototype.runHelpers = function (focus) {
    //[optional] change the future text of the current frame / option
    if (focus.text2) {
      focus.text = focus.text2;
      delete focus.text2;
    }
    //assign an objective if not already assigned
    if (focus.objective) {
      Objectives.assign(focus.objective);
    }
    //mark objective as complete
    if (focus.completeObjective) {
      Objectives.complete(focus.completeObjective);
    }
    //fail an objective if it's assigned and not already completed
    if (focus.failObjective) {
      Objectives.fail(focus.failObjective);
    }
    //add or deduct energy
    if (focus.energy) {
      Player.increment(focus.energy, "energy");
    } 
    //add or deduct enthusiasm
    if (focus.enthusiasm) {
      Player.increment(focus.enthusiasm, "enthusiasm");
    }
    //increment game time
    if (focus.time) {
      Time.increment(focus.time);
    }
    //add item(s) to inventory
    if (focus.getItem) {
      let args = focus.getItem.split(" ");
      for (let i = 0; i < args.length; i += 1) {
        Inventory.add(args[i]);
      }
    }
    //add/deduct player money
    if (focus.money) {
      Wallet.changeBy(focus.money);
    }
    //set a choice to true
    if (focus.choice) {
      Player.set(true, "choices", focus.choice);
      console.log(focus.choice, Player.get("choices", focus.choice));
    }
  };
    
  //loop through nested array and return true if all conditions are met; else return false
  Frame.prototype.validateConditions = function (arr) {
    const conditions = {
      inventory: function (itemId) {
        return Inventory.contains(itemId);
      },
      money: function (value) {
        return Wallet.canAfford(value);
      },
      objectiveCompleted: function (id) {
        return Objectives.getAttribute(id, "complete");
      },
      objectiveAssigned: function (id) {
        return Objectives.getAttribute(id, "assigned");
      },
      objectiveFailed: function (id) {
        return Objectives.getAttribute(id, "failed");
      },
      energy: function (value) {
        return Player.get("energy") >= value;
      },
      enthusiasm: function (value) {
        return Player.get("enthusiasm") >= value;
      },
      choices: function (choice) {
        return Player.get("choices", choice);
      }
    };
    let outcome;
    for (let i = 0; i < arr.length; i += 1) {
      let setting = arr[i][0];
      let hasValue = arr[i][1];
      let boolWanted = arr[i][2] || true;
      //convert boolWanted from string to bool
      if (boolWanted === "true") {
        boolWanted = true;
      } else if (boolWanted === "false") {
        boolWanted = false;
      }
      outcome = conditions[setting](hasValue) === boolWanted;
    }
    if (outcome) {
      return true;
    } else {
      return false;
    }
  };
  
  Frame.prototype.processOption = function (optionUid) {
    //look up the option on this frame with the supplied uid
    let option;
    let optionIndex;
    for (let i = 0; i < this.options.length; i += 1) {
      if (this.options[i].uid === parseInt(optionUid)) {
        option = this.options[i];
        optionIndex = i;
      }
    }

    let next = option.next; //a string, so, not a reference.
    
    //[optional] change the future 'next' of the selected option
    if (option.next2 !== undefined) {
      option.next = option.next2;
      delete option.next2;
    }

    //[optional] store a prefix for using on the next text
    if (option.prefix !== undefined) {
      __prefix = option.prefix;
    }

    //[optional] if conditions are met, send player to a different 'next'
    if (option.nextif !== undefined) {
      
      //split nextif strings into arrays
      let conditions = option.nextif.slice(1);
      for (let i = 0; i < conditions.length; i += 1) {
        conditions[i] = conditions[i].split(" ");
      }
      if (this.validateConditions(conditions)) {
        next = option.nextif[0];
      }
    }

    //[optional] remove option permanently if remove = true
    if (option.remove) {
      this.options.splice(optionIndex, 1);
    }

    this.removeOneoffs();
    this.runHelpers(option);
    
    //check if "next" is referring to a Scene
    if (next.substr(0, 6).toLowerCase() === "scene ") {
      const args = next.split(" ", 3);
      const sceneName = args[1];
      const startFrame = args[2] || false;
      Scene.init(__currentOrigin, __storyName, sceneName, startFrame);
    } else {
      story[__currentScene][next].render();
    }
  };
  
  //////////////////////
  /// PUBLIC METHODS ///
  //////////////////////

  self.processOption = function (optionUid) {
    story[__currentScene][__currentFrame].processOption(optionUid);
  };

  //parse a scene
  self.init = function (currentOrigin, storyName, sceneName, startFrame) {
    const self = this;
    const request = new XMLHttpRequest();
    //construct a path to the desired scene
    const scenePath = `${currentOrigin}/stories/${storyName}/scenes/${sceneName}.json`;
    
    //save a private reference to the story path for later
    __currentOrigin = currentOrigin;
    __storyName = storyName;
    __currentScene = sceneName;

    request.onload = function() {
      if (request.status == 200) {
        try {
          //check to see if scene has already been parsed; if not, create scene object with one attribute (first_frame), and add to story object
          if (story[sceneName] === undefined) {
            let scene = JSON.parse(request.responseText).scene;
            let frames = scene.frames;
            story[sceneName] = {};
            story[sceneName].map = scene.map;
            story[sceneName].first_frame = scene.first_frame;
            //create Frame objects and add them to Scene object as they're created. Story["scenename"]["framename"] = new Scene(....);
            for (let i = 0; i < frames.length; i += 1) {
              let frameid = frames[i].id;
              story[sceneName][frameid] = new Frame(frames[i]);
            }
          }
          let firstFrame = startFrame || story[sceneName].first_frame;
          if (story[sceneName].map !== undefined) {
            Scenemap.set(story[sceneName].map);
          }
          story[sceneName][firstFrame].render();
        } catch (SyntaxError) {
          console.error(`There was an error processing the first frame, or there's something wrong in the JSON syntax of this scene: ${scenePath} Try running it through JSONLint.com`);
        }
      } else {
        console.error(`Retrieved response, but status was not 200. Status text: ${request.statusText}`);
      }
    };

    request.onerror = function() {
      console.error("XMLHttpRequest failed, could not reach Scene.");
    };
    
    request.open("GET", scenePath, true);
    request.send();
    
  };
  
  return self;

})();