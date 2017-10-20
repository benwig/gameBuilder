"use strict";

console.log("start loading Parse");

const Parse = (function () {
  
  let data = "";
  
  return {
    
    proceed(frameID) {
      
      //search data for frame with id === frame
      const frames = data.scene.frames;
      let frameData = "";
      let i = 0;
      
      try {
        for (i; i <= frames.length; i += 1) {
        
          if (frames[i].id === frameID) {
            frameData = frames[i];
            console.log(frameData);
            return;
          } 
          
        }
      } catch(TypeError) {
        console.error(`Frame with id ${frameID} could not be found.`);
      }
      
    
    },
    
    //identifies first frame in given scene, and calls Parse.proceed() on it
    init(scenePath) {
      
      const request = new XMLHttpRequest();
      request.open("GET", scenePath, true);

      request.onload = function() {
        
        if (request.status == 200) {
          
          data = JSON.parse(request.responseText);
          const firstFrame = data.scene.first_frame;
          Parse.proceed(firstFrame);
          
        } else {
          
          console.error(`Retrieved response, but status was not 200. Status text: ${request.statusText}`);
          
        }
      };

      request.send();
      
    }
    
  }
  
})();