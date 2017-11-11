/*jshint esversion:6, devel: true, browser: true*/

const Handlers = (function () {
  
  "use strict";
  
  return {
    
    //handle click on an option button
    processOption(event) {
      try {
        let optionId = event.target.dataset.optionId;
        Scene.processOption(optionId);
      } catch (TypeError) {
        event.stopPropagation();
      }
    }
    
  };
  
})();
