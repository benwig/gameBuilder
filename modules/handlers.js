/*jshint esversion:6, devel: true, browser: true*/

const Handlers = (function () {
  
  "use strict";
  
  return {
    
    //handle click on an option button
    processOption(event) {
      const optionId = event.target.dataset.optionId;
      if (optionId !== undefined) {
        Scene.processOption(optionId);
      } else {
        event.stopPropagation();
      }
    },
    
    openItemInfo(event) {
      const itemId = event.target.dataset.itemId;
      if (itemId !== undefined) {
        View.openItemInfo(itemId);
      } else {
        event.stopPropagation();
      }
    },
    
    closeItemInfo() {
      View.closeItemInfo();
    },
    
    consumeItem(id) {
      Inventory.get(id).consume();
    }
    
  };
  
})();
