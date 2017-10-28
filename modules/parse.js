/*jshint esversion:6, devel: true, browser: true*/

console.log("start loading Parse");

const Parse = (function () {
  
  "use strict";
  
  const sceneData = {};
  const frameData = {};
  
  const processFrame = () => {
    let i = 0;
    
    try {
      Ui.setPrompt(frameData.text);
      Ui.clearOptions();

      for (i; i < frameData.options.length; i += 1) {
        Ui.addOption(frameData.options[i].text, frameData.options[i].next);
      }
      
    }
    catch(TypeError) {
      console.error('It looks like frameData is currently empty.');
    }
    
  };
  
  return {
    
    proceed(frameID) {
      
      const frames = sceneData.frames;
      let i = 0;
      
      //search data for frame with id === frameId
      try {
        for (i; i <= frames.length; i += 1) {
        
          if (frames[i].id === frameID) {
            frameData = frames[i];
            break;
          } 
          
        }
      }
      catch(TypeError) {
        console.error(`Frame with id ${frameID} could not be found.`);
        return; 
      }
      
      processFrame();
    
    },
    
    //identifies first frame in given scene, and calls Parse.proceed() on it
    init(scenePath) {
      
      const self = this;
      const request = new XMLHttpRequest();
      
      request.open("GET", scenePath, true);

      request.onload = function() {
        
        if (request.status == 200) {
          sceneData = JSON.parse(request.responseText).scene;
          const firstFrame = sceneData.first_frame;
          self.proceed(firstFrame);
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