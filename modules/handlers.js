/*jshint esversion:6, devel: true, browser: true*/

const Handlers = (function () {
  
  "use strict";
  
  return {
    
    //shows / hides frame info
    toggleInfo () {
      View.toggleInfo('#infobox');
      Scene.markInfoAsRead();
    },
    
    //handle click on an option button
    processOption (event) {
      const optionId = event.target.dataset.optionId;
      if (optionId !== undefined) {
        Scene.processOption(optionId);
      } else {
        event.stopPropagation();
      }
    },
    
    openItemInfo (event) {
      const itemUid = event.target.dataset.itemUid;
      if (itemUid !== undefined) {
        let item = Inventory.get(itemUid);
        View.openItemInfo(itemUid, item);
      } else {
        event.stopPropagation();
      }
    },
    
    closeItemInfo () {
      View.closeItemInfo();
    },
    
    consumeItem (uid) {
      Inventory.get(uid).consume(uid);
    }
    
  };
  
})();
