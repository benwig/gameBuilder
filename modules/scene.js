/*jshint esversion:6, devel: true, browser: true*/

const Scene = (function () {
  
  "use strict";
  
  let sceneData = {};
  
  return {
    
    frameData: {},
    frameIndex: null,
    
    //executes the consequences of choosing a particular option, ends by moving on to the 'next' frame
    processOption(optionId) {
      
      let next = this.frameData.options[optionId].next; //save a copy of the option's 'next', in case option is deleted
      
      // remove option from sceneData if remove = true
      if (this.frameData.options[optionId].remove) {
        sceneData.frames[this.frameIndex].options.splice(optionId, 1);
      }
      
      this.proceedTo(next);
    },
    
    //sets frameData to current frame
    proceedTo(frameId) {
      
      const frames = sceneData.frames;
      let i = 0;

      try {
        for (i; i < frames.length; i += 1) {
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
    
    },
    
    //identifies first frame in given scene, and calls Scene.proceedTo() on it
    init(scenePath) {
      
      const self = this;
      const request = new XMLHttpRequest();
      
      request.open("GET", scenePath, true);

      request.onload = function() {
        
        if (request.status == 200) {
          sceneData = JSON.parse(request.responseText).scene;
          const firstFrame = sceneData.first_frame;
          self.proceedTo(firstFrame);
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