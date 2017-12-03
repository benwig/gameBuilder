/*jshint esversion:6, devel: true, browser: true*/

const Inventory = (function () {
  
  "use strict";
  
  const self = {};
  let __items = [];
  const playerItems = {};
  const newIdMaker = function () {
    let i = 0;
    return function() {
      return `item-${i++}`;
    };
  };
  const newId = newIdMaker();
  
  //Basic item constructor
  function Item(settings) {
    settings = settings || {};
    this.id = settings.id; //short id for use by the author
    this.name = settings.name || "Unnamed Object";
    this.description = settings.description || "An undescribed object";
    this.icon = settings.icon || "unknownObject.png";
    this.value = settings.value || 0;
    this.energy = settings.energy || 0;
    this.speed = settings.speed || 0;
    this.wearable = settings.wearable || false;
    this.using = false;
  }
  
  //increment player energy and remove item from inventory
  Item.prototype.consume = function (uid) {
    if (this.energy > 0) {
      Player.increment(this.energy, "energy");
      self.remove(uid);
    } else {
      console.error("This item is not edible");
    }
  };
  
  Item.prototype.use = function () {
    // if !this.wearable, log error
    // else
    // if this.using === false
    // add this.energy and this.speed to player.energy and player.speed
    // set this.using to true
  };
  
  Item.prototype.unuse = function () {
    // if this.using === true
    // subtract this.energy and this.speed from player.energy and player.speed
    // set this.using to false
  };
    
  //////////////////////
  /// PUBLIC METHODS ///
  //////////////////////
  
  //place specified object in items array
  self.add = function (id) {
    let uid = newId();
    let settings = {};
    for (let i = 0; i < __items.length; i += 1) {
      if (__items[i].id === id) {
        settings = __items[i];
        break;
      }
    }
    try {
      playerItems[uid] = new Item(settings);
      View.addItem(uid, playerItems[uid]);
    } catch(err) {
      console.error(`No item with id ${id} found in items.JSON.`);
    }
  };

  //delete specified object from player items array
  self.remove = function (uid) {
    View.removeItem(uid);
    delete playerItems[uid];
  };

  //check whether inventory contains at least one instance of specified object
  self.contains = function (id) {
    for (let item in playerItems) {
      if (playerItems[item].id === id) {
        return true;
      }
    }
    return false;
  };

  //returns a reference to a single item with unique id
  self.get = function (uid) {
    return playerItems[uid];
  };
  
  self.init = function (itemsJSON) {
    __items = itemsJSON.items;
  };

  return self;
  
})();