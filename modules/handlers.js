/*jshint esversion:6, devel: true, browser: true*/

const Handlers = (function () {
  
  "use strict";
  
  let __story;
  
  return {
    
    init (storyReference) {
      __story = storyReference;
      this.bindEvents();
    },
    
    bindEvents () {
      $('#options')
        .on('click', 'button', this.processOption.bind(this));
      $('#continue')
        .on('click', this.showNextTextblock.bind(this));
      $('#hubframe')
        .on('click', 'button', this.processOption.bind(this));
      $('#inventory')
        .on('click', 'li', this.openItemInfo.bind(this));
      $('#iteminfo')
        .on('click', '#item-use', this.useItem.bind(this))
        .on('click', '#item-unuse', this.unuseItem.bind(this))
        .on('click', '#item-consume', this.consumeItem.bind(this))
        .on('click', '#item-close', this.closeItemInfo.bind(this));
      $('#storyinfo')
        .on('click', '#infobutton', this.toggleInfo.bind(this));
    },
    
    //shows / hides frame info
    toggleInfo () {
      View.toggleInfo('#infobox');
      __story.markInfoAsRead();
    },
    
    //handle click on an option button
    processOption (event) {
      const optionId = event.target.dataset.optionid;
      if (optionId !== undefined) {
        __story.goToNext(optionId);
      }
    },
    
    showNextTextblock () {
      View.showNextTextblock();
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
    
    consumeItem (e) {
      let uid = e.target.dataset.uid;
      Inventory.get(uid).consume(uid);
      View.closeItemInfo();
    },
    
    switchItems (uidInUse, uidToUse) {
      Inventory.get(uidInUse).unuse();
      Inventory.get(uidToUse).use();
      View.renderItemInfo(uidToUse, Inventory.get(uidToUse));
    },
    
    useItem (e) {
      let uid = e.target.dataset.uid;
      //Check if any other item is in use
      let inUse = Inventory.itemInUse();
      let nameToUse = Inventory.get(uid).name;
      if (inUse) {
        //If another item is being used, give alert and ask to unuse
        let nameInUse = Inventory.get(inUse).name;
        View.switchItemAlert(inUse, nameInUse, uid, nameToUse);
      } else {
        // make sure that item is usable
        let outcome = Inventory.get(uid).use(uid);
        if (outcome) {
          console.log(`Started using ${nameToUse}`);
          View.renderItemInfo(uid, Inventory.get(uid));
        }
      }
    },
    
    unuseItem (e) {
      let uid = e.target.dataset.uid;
      let outcome = Inventory.get(uid).unuse(uid);
      if (outcome) {
        console.log(`Stopped using ${Inventory.get(uid).name}`);
        View.renderItemInfo(uid, Inventory.get(uid));
      }
    }
    
  };
  
})();
