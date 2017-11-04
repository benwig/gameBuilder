/*jshint esversion:6, devel: true, browser: true*/

const Scene = (function () {
  
  "use strict";
  
  let sceneData = {};
  
  return {
    
    frameData: {}, //this references (not copies) part of sceneData, so changing frameData changes sceneData
    
    //executes the consequences of choosing a particular option, ends by moving on to the 'next' frame
    processOption(optionId) {
      
      //TODO use key-value pairs to map json options to functions. eg. "getItem": function(x){Inventory.add(x)}
      
      const option = this.frameData.options[optionId]; //ultimately references part of sceneData
      let next = option.next; //a string, so, not a reference. Can be temporarily modified.
      
      //[optional] add item to inventory
      if (option.getItem !== undefined) {
        Inventory.add(option.getItem);
      }
      
      //[optional] get/lose money
      if (option.money !== undefined) {
        Wallet.changeBy(option.money);
      }

      //[optional] change the future 'next' of the selected option
      if (option.next2 !== undefined) {
        option.next = option.next2;
        delete option.next2;
      }
        
      if (option.time !== undefined) {
        Time.increment(option.time);
      }
      
      //[optional] if conditions are met, send player to a different 'next'
      if (option.nextif !== undefined) {
        const nextif = option.nextif;
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
          next = option.nextif[0];
        }
      }
      
      //[optional] remove option permanently if remove = true
      if (option.remove) {
        this.frameData.options.splice(optionId, 1);
      }
      
      //[optional]remove other options permanently if their oneoff = true
      for (let i = 0; i < this.frameData.options.length; i += 1) {
        if (this.frameData.options[i].oneoff) {
          this.frameData.options.splice(i, 1);
        }
      }
      
      this.proceedTo(next);
    },
    
    //sets frameData to current frame
    proceedTo(frameId) {
      
      const frames = sceneData.frames;

      try {
        for (let i = 0, fl = frames.length; i < fl; i += 1) {
          if (frames[i].id === frameId) {
            this.frameData = frames[i];
            break;
          } 
        }
      } catch(TypeError) {
        console.error(`Frame with id ${frameId} could not be found.`);
        return;
      }
      
      View.setFrameText();
      View.addOptions();
      
      //[optional] change the future text of the current frame
      if (this.frameData.text2 !== undefined) {
        this.frameData.text = this.frameData.text2;
        delete this.frameData.text2;
      }
  
    },
    
    //identifies first frame in given scene, and calls Scene.proceedTo() on it
    init(scenePath) {
      
      const self = this;
      const request = new XMLHttpRequest();
      
      request.open("GET", scenePath, true);

      request.onload = function() {
        
        if (request.status == 200) {
          try {
            sceneData = JSON.parse(request.responseText).scene;
            const firstFrame = sceneData.first_frame;
            self.proceedTo(firstFrame);
          } catch (SyntaxError) {
            console.error(`There's something wrong in the JSON syntax of this scene: ${scenePath} Try running it through JSONLint.com`);
          }
        } else {
          console.error(`Retrieved response, but status was not 200. Status text: ${request.statusText}`);
        }
      };
      
      request.onerror = function() {
        console.error("XMLHttpRequest failed, could not reach Scene.");
      };

      request.send();
      
    }
    
  };
  
})();