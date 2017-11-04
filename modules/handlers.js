/*jshint esversion:6, devel: true, browser: true*/

const Handlers = (function () {
  
  "use strict";
  
  return {
    
    //TODO: new function called processOption() - calls corresponding function in Scene module which processes current choice, does things such as removing option, adding items etc. Then calls proceedTo(next)
    
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
