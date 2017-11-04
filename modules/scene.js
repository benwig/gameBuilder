/*jshint esversion:6, devel: true, browser: true*/

const Scene = (function () {
  
  "use strict";
  
  let sceneData = {};
  
  return {
    
    frameData: {},
    frameIndex: null,
    
    //executes the consequences of choosing a particular option, ends by moving on to the 'next' frame
    processOption(optionId) {
      
      const option = this.frameData.options[optionId];
      let next = option.next;
      
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
        sceneData.frames[this.frameIndex].options[optionId].next = option.next2;
        delete sceneData.frames[this.frameIndex].options[optionId].next2;
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
      
      //[optional] remove option from sceneData if remove = true
      if (option.remove) {
        sceneData.frames[this.frameIndex].options.splice(optionId, 1);
      }
      
      //[optional]remove other options from sceneData if oneoff = true
      for (let i = 0; i < this.frameData.options.length; i += 1) {
        if (this.frameData.options[i].oneoff) {
          sceneData.frames[this.frameIndex].options.splice(i, 1);
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
            this.frameIndex = i;
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
        sceneData.frames[this.frameIndex].text = this.frameData.text2;
        delete sceneData.frames[this.frameIndex].text2;
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
            console.error(`There's something wrong in the JSON syntax of this scene: ${scenePath} Try pasting running it through JSONLint.com`);
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