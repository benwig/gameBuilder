/*jshint esversion:6, devel: true, browser: true*/

const Scene = (function () {
  
  "use strict";
  
  let sceneData = {};
  
  return {
    
    frameData: {},
    
    //sets frameData to current frame
    proceedTo(frameID) {
      
      const frames = sceneData.frames;
      let i = 0;
      
      //search data for frame with id === frameId
      try {
        for (i; i < frames.length; i += 1) {
          if (frames[i].id === frameID) {
            this.frameData = frames[i];
            break;
          } 
        }
      } catch(TypeError) {
        console.error(`Frame with id ${frameID} could not be found.`);
        return;
      }
      
      View.setFrameText();
      View.addOptions();
    
    },
    
    //identifies first frame in given scene, and calls Story.proceedTo() on it
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