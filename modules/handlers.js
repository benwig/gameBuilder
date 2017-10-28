/*jshint esversion:6, devel: true, browser: true*/

const Handlers = (function () {
  
  "use strict";
  
  return {
    
    proceedTo(event) {
      let next = event.target.dataset.next;
      Scene.proceedTo(next);
    }
    
  };
  
})();
