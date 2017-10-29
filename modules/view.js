/*jshint esversion:6, devel: true, browser: true*/

const View = (function () {
  
  "use strict";
  
  const options = document.querySelector("#options");
  
  const clearOptions = function () {
    while (options.lastChild) {
        options.removeChild(options.lastChild);
      }
  };
  
  return {
    
    setFrameText() {
      document.querySelector("#frameText").textContent = Scene.frameData.text;
    },
    
    addOptions() {
      
      clearOptions();
      
      try {
        for (let i = 0; i < Scene.frameData.options.length; i += 1) {
          let li = document.createElement('li');
          let button = document.createElement('button');
          button.dataset.optionId = i;
          button.textContent = Scene.frameData.options[i].text;
          li.appendChild(button);
          options.appendChild(li);
        }
      } catch(TypeError) {
        console.error('It looks like frameData is currently empty.');
      }
    }
    
  };

})();