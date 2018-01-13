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
  
  //processes commonalities for option/frame/hub. 'focus' stands in for either "Frame" or "option" or "icon"
  const __runHelpers = function (focus) {
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
      Player.setChoice(true, focus.choice);
      console.log(focus.choice, Player.get("choices", focus.choice));
    }
  };
  
  //////////////////
  // CONSTRUCTORS //
  //////////////////
  
  function Story (currentOrigin, name, metadata) {
    this.name = name;
    this.currentOrigin = currentOrigin;
    this.timelimit = metadata.timelimit || false;
    this.firstScene = metadata.first_scene;
    this.currentLocationType = undefined;
    this.currentScene = undefined;
    this.currentFrame = undefined;
    this.currentHub = undefined;
    this.currentZone = undefined;
    this.scenes = {};
    this.hubs = {};
  }
  
  function Hub (settings) {
    this.map = settings.map || false;
    this.defaultStartZone = settings.defaultStartZone || icons[0].zone;
    this.travelTimes = settings.travelTimes;
    this.icons = settings.icons || [];
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
  
  //fetch a scene/hub JSON, and parse it to create a new scene/hub object
  Story.prototype.load = function (nameToLoad, typeToLoad, startingPoint) {
    //save references for later
    const that = this,
          path = `${this.currentOrigin}/stories/${this.name}/${typeToLoad}s/${nameToLoad}.json`,
          request = new XMLHttpRequest();
    typeToLoad = typeToLoad.toLowerCase();
    request.onload = function() {
      if (request.status == 200) {
        try {
          if (typeToLoad === "scene") {
            //create Scene object, and store inside Story object
            let settings = JSON.parse(request.responseText).scene;
            that.scenes[nameToLoad] = new Scene(settings);
            // save references for later
            startingPoint = startingPoint || that.scenes[nameToLoad].firstFrame;
            that.updateLocationReferences("scene", nameToLoad, startingPoint);
            // start scene at specified frame
            that.scenes[nameToLoad].init(startingPoint);
          } else if (typeToLoad === "hub") {
            //create Hub object, and store inside Story object
            let settings = JSON.parse(request.responseText).hub;
            that.hubs[nameToLoad] = new Hub(settings);
            // save references for later
            startingPoint = startingPoint || that.hubs[nameToLoad].defaultStartZone;
            that.updateLocationReferences("hub", nameToLoad, startingPoint);
            // render hub
            that.hubs[nameToLoad].init(startingPoint);
          }
        } catch (SyntaxError) {
          console.error(`Could not load ${nameToLoad}. Try running it through JSONLint.com`);
        }
      } else {
        console.error(`Retrieved response, but status was not 200. Status text: ${request.statusText}`);
      }
    };
    request.onerror = function() {
      console.error(`XMLHttpRequest failed, could not reach ${nameToLoad}.`);
    };
    request.open("GET", path, true);
    request.send();
  };
  
  //process the selected option, then load up the next 
  Story.prototype.goToNext = function (optionUid) {
    let next;
    
    //process any option settings, and get the value of next
    if (this.currentLocationType === "hub") {
      next = this.hubs[this.currentHub].processOption(optionUid, this.timelimit, this.currentZone);
      this.currentZone = next.zone;
    } else {
      next = this.scenes[this.currentScene].frames[this.currentFrame].processOption(optionUid, this.timelimit);
    }
    
    //check whether next is pointing to a new Scene or Hub - if so, load
    const args = next.next.split(" ", 3);
    if (args[0].toLowerCase() === "scene") {
      let sceneName = args[1];
      let startFrame = args[2] || false;
      //create Scene and init it, if it hasn't already been parsed
      if (this.scenes[sceneName] === undefined) {
        this.load(sceneName, "scene", startFrame);
      } else {
        this.updateLocationReferences("frame", sceneName, startFrame);
        this.currentFrame = this.scenes[sceneName].init(startFrame);
      }
    } else if (args[0].toLowerCase() === "hub") {
      let hubName = args[1];
      let startZone = parseInt(args[2]) || undefined;
      //create Hub and init it, if it hasn't already been parsed
      if (this.hubs[hubName] === undefined) {
        this.load(hubName, "hub", startZone);
      } else {
        this.updateLocationReferences("hub", hubName, startZone || this.hubs[hubName].defaultStartZone);
        this.hubs[hubName].init(startZone);
      }
    } else {
      //else render next frame in current Scene
      this.currentFrame = this.scenes[this.currentScene].frames[next.next].render(next.prefix);
    }
  };
  
  Story.prototype.markInfoAsRead = function () {
    let frame = this.scenes[this.currentScene].frames[this.currentFrame];
    if (!frame.infoRead) {
      frame.infoRead = true;
    }
  };
  
  Story.prototype.updateLocationReferences = function (locationType, locationName, startingPoint) {
    this.currentLocationType = locationType;
    if (locationType === "hub") {
      this.currentHub = locationName;
      this.currentZone = startingPoint; 
    } else if (locationType === "scene") {
      this.currentScene = locationName;
      this.currentFrame = startingPoint;
    }
  };
  
  /////////////////
  // HUB METHODS //
  /////////////////
  
  Hub.prototype.init = function (startZone) {
    startZone = startZone || this.defaultStartZone;
    console.log(`Hub loaded in zone ${startZone}`);
    View.renderHub(this.icons, this.map, startZone);
  };
  
  Hub.prototype.processOption = function (optionId, timelimit, currentZone) {
    let selectedIcon,
        i,
        next,
        travelTime;
    //look up the selected icon among Hub icons
    for (i = 0; i < this.icons.length; i += 1) {
      if (this.icons[i].id === optionId) {
        selectedIcon = this.icons[i];
        next = selectedIcon.next;
      }
    }
    
    // Process travel time between currentZone and new Zone, and increment game time
    console.log("Current zone: " + currentZone);
    console.log("Destination zone: " + selectedIcon.zone);
    travelTime = this.timeBetweenZones(currentZone, selectedIcon.zone);
    console.log(travelTime);
    Time.increment(travelTime);
    // check for game-ending time conditions
    Objectives.checkTimeConditions(); //fail objectives that are out of time
    if (Player.get("energy") <= 0) {
      return {next: "scene endgame energy-lose"};
    }
    if (timelimit && Time.laterThan(timelimit)) {
      return {next: "scene endgame timeout-lose"};
    }
    
    //[optional] change the future 'next' of the selected icon
    if (selectedIcon.next2) {
      selectedIcon.next = selectedIcon.next2;
      delete selectedIcon.next2;
    }
    
    __runHelpers(selectedIcon);
    
    return {next: next, zone: selectedIcon.zone};
  };
  
  // return time to travel between two zones
  Hub.prototype.timeBetweenZones = function (currentZone, destinationZone) {
    let tt = this.travelTimes,
        i = 0,
        x,
        y;
    //find current Zone in header
    for (i = 0; i < tt[0].length; i += 1) {
      if (tt[0][i] === currentZone) {
        x = i;
        break;
      }
    }
    //find destination Zone in first column
    for (i = 0; i < tt.length; i += 1) {
      if (tt[i][0] === destinationZone) {
        y = i;
        break;
      }
    }
    if (tt[y][x]) {
      return tt[y][x];
    } else {
      return tt[x][y];
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
    
    __runHelpers(this);
    
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
        let outcome = this.allConditionsTrue(conditions);
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
  
  //process selected option and return id of 'next'
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
      if (this.allConditionsTrue(conditions)) {
        next = option.nextif[0];
      }
    }

    //[optional] remove option permanently if remove = true
    if (option.remove) {
      this.options.splice(optionIndex, 1);
    }
    this.removeOneoffs();
    __runHelpers(option);
  
    return {next: next, prefix: prefix};
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
    
  //loop through nested array and return true if all conditions are met; else return false
  Frame.prototype.allConditionsTrue = function (arr) {
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
  
  return {
    newStory: function (currentOrigin, storyName, metadata) {
      return new Story(currentOrigin, storyName, metadata);
    }
  };

})();