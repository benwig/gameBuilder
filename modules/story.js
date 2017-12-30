/*jshint esversion:6, devel: true, browser: true*/

const Storyrunner = (function () {
  
  "use strict";
  
  //////////////////
  // PRIVATE  //
  //////////////////
  
  //private function for creating unique ids for options
  const __uidMaker = function () {
    let i = 0;
    return function() {
      return i++;
    };
  };
  const __newUid = __uidMaker();
  
  const __suffixOptions = {
    mild: ["Hunger is making it hard to concentrate.",
          "You're feeling a bit peckish.",
          "You feel rather faint. Maybe you should eat something.",
          "You feel light-headed.",
          "Your energy is ebbing. Some food would really help."],
    serious: ["Your legs wobble. You desparately need a bite to eat and some water.",
             "The world begins to spin...",
             "You can barely make sense of the world around you.",
             "A haze is descending. You should really eat something.",
             "Your legs buckle. If you don't rest and eat soon, who knows what will happen."]
  };
  
  //create a random suffix
  const __changeSuffix = function () {
    const energyRatio = Player.get("energy")/Player.get("energy", "limit");
    let suffixes;
    if (energyRatio <= 0.2 && energyRatio > 0.1) {
      suffixes = __suffixOptions.mild;
    } else if (energyRatio <= 0.1 && energyRatio !== 0) {
      suffixes = __suffixOptions.serious;
    } else {
      return false;
    }
    return suffixes[Math.floor(Math.random() * suffixes.length)];
  };
  
  
  //////////////////
  // CONSTRUCTORS //
  //////////////////
  
  function Story (currentOrigin, name, metadata) {
    this.name = name;
    this.currentOrigin = currentOrigin;
    this.timelimit = metadata.timelimit || false;
    this.firstScene = metadata.first_scene;
    this.currentScene = undefined;
    this.currentFrame = undefined;
    this.scenes = {};
    this.hubs = {};
  }
  
  function Scene (settings) {
    this.map = settings.map;
    this.firstFrame = settings.first_frame;
    this.frames = {};
    //create Frame objects and populate this.frames
    for (let i = 0; i < settings.frames.length; i += 1) {
      let frameid = settings.frames[i].id;
      this.frames[frameid] = new Frame(settings.frames[i], this);
    }
  }
  
  function Frame (settings) {
    this.id = settings.id;
    this.text = settings.text;
    this.text2 = settings.text2 || false;
    this.info = settings.info || false;
    this.infoRead = false;
    this.image = settings.image || false;
    this.coordinates = settings.coordinates || false;
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
    this.money = settings.money || false;
    this.choice = settings.choice || false;
  }
  
  ///////////////////
  // STORY METHODS //
  ///////////////////
  
  //fetch a Scene JSON, and parse it to create a new Scene object if it doesn't already exist
  Story.prototype.loadScene = function (sceneName, startFrame) {
    //save references for later
    const that = this;
    this.currentScene = sceneName;
    
    //check to see if scene has already been parsed
    if (this.scenes[sceneName] !== undefined) {
      this.currentFrame = this.scenes[sceneName].init(startFrame);
    } else {
      //construct a path to the desired scene
      const request = new XMLHttpRequest();
      const scenePath = `${this.currentOrigin}/stories/${this.name}/scenes/${sceneName}.json`;
      request.onload = function() {
        if (request.status == 200) {
          try {
            //create Scene object, and store inside Story object
            let settings = JSON.parse(request.responseText).scene;
            that.scenes[sceneName] = new Scene(settings, that);
            that.currentFrame = that.scenes[sceneName].init(startFrame);
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
    }
  };
  
  //process the selected option, then load up the next 
  Story.prototype.goToNext = function (optionUid) {
    let next = this.scenes[this.currentScene].frames[this.currentFrame].processOption(optionUid, this.timelimit);
    
    //check if "next.next" is referring to a Scene
    if (next.next.substr(0, 6).toLowerCase() === "scene ") {
      const args = next.next.split(" ", 3);
      const sceneName = args[1];
      const startFrame = args[2] || false;
      this.loadScene(sceneName, startFrame);
    } else {
      //render next frame and store id of the new frame
      this.currentFrame = this.scenes[this.currentScene].frames[next.next].render(next.prefix);
    }
  };
  
  Story.prototype.markInfoAsRead = function () {
    let frame = this.scenes[this.currentScene].frames[this.currentFrame];
    if (!frame.infoRead) {
      frame.infoRead = true;
    }
  };
  
  ///////////////////
  // SCENE METHODS //
  ///////////////////
  
  Scene.prototype.init = function (startFrame) {
    startFrame = startFrame || this.firstFrame;
    if (this.map) {
      Scenemap.set(this.map);
    }
    return this.frames[startFrame].render();
  };
  
  ////////////////////
  // FRAME  METHODS //
  ////////////////////
  
  //load up the current frame and execute any necessary tasks
  Frame.prototype.render = function (prefix) {
    let maintext = this.text; //store as string since helpers may change it
    
    this.runHelpers(this);
    
    //if energy is low/0, change suffix
    let suffix = __changeSuffix();
    
    View.setFrameText(prefix, maintext, suffix);
    
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
    View.renderStoryInfo(this.info, this.infoRead);
    
    if (this.image) {
      View.displayImage(this.image);
    } else {
      View.hideImage();
    }
    
    if (this.coordinates) {
      Scenemap.updateLocation(this.coordinates);
    }
    
    console.log(`Currently at: ${this.id}`);
    //return the id of current frame
    return this.id;
    
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
  
  Frame.prototype.processOption = function (optionUid, timelimit) {
    let prefix,
        option,
        optionIndex;
    //look up the option on this frame with the supplied uid
    for (let i = 0; i < this.options.length; i += 1) {
      if (this.options[i].uid === parseInt(optionUid)) {
        option = this.options[i];
        optionIndex = i;
      }
    }
    
    //increment game time & check for game-ending conditions
    if (option.time) {
      Time.increment(option.time);
      Objectives.checkTimeConditions(); //fail objectives that are out of time
      if (Player.get("energy") <= 0) {
        return {next: "scene endgame energy-lose"};
      }
      if (timelimit && Time.laterThan(timelimit)) {
        return {next: "scene endgame timeout-lose"};
      }
    }

    //store next as string (not reference) so it can be temporarily altered
    let next = option.next;
    
    //[optional] change the future 'next' of the selected option
    if (option.next2) {
      option.next = option.next2;
      delete option.next2;
    }

    //[optional] store a prefix for using on the next text
    if (option.prefix) {
      prefix = option.prefix;
    } else {
      prefix = false;
    }

    //[optional] if conditions are met, send player to a different 'next'
    if (option.nextif) {
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
  
    return {next: next, prefix: prefix};
    
  };
  
  return {
    newStory: function (currentOrigin, storyName, metadata) {
      return new Story(currentOrigin, storyName, metadata);
    }
  };

})();