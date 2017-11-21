/*jshint esversion:6, devel: true, browser: true*/

const Scene = (function () {
  
  "use strict";
  const self = {};
  let sceneData = {};
  let frameData = {};
  let prefix = false;
  
  //////////////////////
  // HELPER FUNCTIONS //
  //////////////////////
  
  //return new frame; if not found, return current frame
  const findFrame = function (frameId) {
    for (let i = 0, fl = sceneData.frames.length; i < fl; i += 1) {
      if (sceneData.frames[i].id === frameId) {
        return sceneData.frames[i];
      } 
    }
    console.error(`Frame with id ${frameId} could not be found.`);
    return frameData;
  };
  
  //return frame text (with prefix, if one is stored)   
  const getFrameText = function () {
    if (prefix) {
      let temptext = `${prefix}<br>${frameData.text}`;
      prefix = false;
      return temptext;
    } else {
      return frameData.text;
    }
  };
  
  //remove frame options permanently if their oneoff = true
  const removeOneoffs = function () {
    let i = frameData.options.length;
    while (i--) {
      if (frameData.options[i].oneoff) {
        frameData.options.splice(i, 1);
      }
    }
  };
  
  //return new 'next' value if all conditions are met; else return false
  const validateNextif = function (nextif) {
    let outcome;
    for (let i = 1, nl = nextif.length; i < nl; i += 1) {
      switch (nextif[i][0]) {
        case "hasItem":
          outcome = Inventory.contains(nextif[i][1]);
          break;
        case "canAfford":
          outcome = Wallet.canAfford(nextif[i][1]);
          break;
      }
    }
    if (outcome) {
      return nextif[0];
    } else {
      return false;
    }
  };
  
  //assign an objective
  const assignObjective = function (objId) {
    if (objId !== undefined && !Objectives.getAttribute(objId, "assigned")) {
      Objectives.assign(objId);
    }
  };
  
  //mark objective as complete
  const completeObjective = function (objId) {
    if (objId !== undefined && !Objectives.getAttribute(objId, "completed")) {
      Objectives.complete(objId);
    }
  };

  //add or deduct energy/enthusiasm
  const incrementStats = function (energyDelta, enthusiasmDelta) {
    if (energyDelta !== undefined) {
      Player.increment(energyDelta, "energy");
    }
    if (enthusiasmDelta !== undefined) {
      Player.increment(enthusiasmDelta, "enthusiasm");
    }
  };
  
  //move game time onward
  const incrementTime = function (delta) {
    if (delta !== undefined) {
      Time.increment(delta);
    }
  };
  
  //add item to inventory
  const getItem = function (item) {
    if (item !== undefined) {
      Inventory.add(item);
    }
  };
  
  const incrementMoney = function (delta) {
    if (delta !== undefined) {
      Wallet.changeBy(delta);
    }
  };
  
  //processes commonalities for option or frame
  //focus stands in for either "frameData" or "option"
  const runHelpers = function (focus) {
    getItem(focus.getItem);
    incrementMoney(focus.money);
    assignObjective(focus.objective);
    completeObjective(focus.completeObjective);
    incrementStats(focus.energy, focus.enthusiasm);
    incrementTime(focus.time);
  };
  
  //////////////////////
  /// PUBLIC METHODS ///
  //////////////////////

  self.processOption = function (optionId) {
    const option = frameData.options[optionId]; //ultimately references part of sceneData
    let next = option.next; //a string, so, not a reference. Can be temporarily modified.
    
    //[optional] change the future 'next' of the selected option
    if (option.next2 !== undefined) {
      option.next = option.next2;
      delete option.next2;
    }

    //[optional] store a prefix for using on the next text
    if (option.prefix !== undefined) {
      prefix = option.prefix;
    }

    //[optional] if conditions are met, send player to a different 'next'
    if (option.nextif !== undefined) {
      next = validateNextif(option.nextif) || next;
    }

    //[optional] remove option permanently if remove = true
    if (option.remove) {
      frameData.options.splice(optionId, 1);
    }

    removeOneoffs();
    runHelpers(option);
    this.proceedTo(next);
  };
  
  self.proceedTo = function (frameId) {
    
    //sets frameData to current frame
    frameData = findFrame(frameId);
    View.setFrameText(getFrameText());
    View.addOptions(frameData.options);

    //[optional] change the future text of the current frame
    if (frameData.text2 !== undefined) {
      frameData.text = frameData.text2;
      delete frameData.text2;
    }
    
    runHelpers(frameData);
    console.log(`Currently at: ${frameData.id}`);
  };

  self.init = function (scenePath) {
    const self = this;
    const request = new XMLHttpRequest();

    request.onload = function() {
      if (request.status == 200) {
        try {
          sceneData = JSON.parse(request.responseText).scene;
          const firstFrame = sceneData.first_frame;
          View.updateAll();
          self.proceedTo(firstFrame);
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