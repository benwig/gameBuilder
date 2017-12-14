/*jshint esversion:6, devel: true, browser: true*/

const Inventory = (function () {
  
  "use strict";
  
  const self = {};
  let __items = [];
  const __playerItems = {};
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
    this.enthusiasm = settings.enthusiasm || 0;
    this.speed = settings.speed || 0;
    this.edible = settings.edible || false;
    this.usable = settings.usable || false;
    this.using = false;
  };
  
  Item.prototype.changePlayerStat = function (delta, statname) {
    if (!delta || typeof delta !== 'number') {
      return;
    } else {
      Player.increment(delta, statname);
      console.log(`${statname} changed by ${delta}`);
    }
  };
  
  //increment player energy and remove item from inventory
  Item.prototype.consume = function (uid) {
    if (this.edible) {
      this.changePlayerStat(this.energy, "energy");
      self.remove(uid);
    } else {
      console.error("That item is not edible");
    }
  };
  
  Item.prototype.use = function (uid) {
    if (this.usable) {
      if (!this.using) {
        this.changePlayerStat(this.energy, "energy");
        this.changePlayerStat(this.enthusiasm, "enthusiasm");
        this.changePlayerStat(this.speed, "speed");
        this.using = true;
        return true;
      } else {
        console.error("That item is already being used.");
        return false;
      }
    } else {
      console.error("That item cannot be used");
      return false;
    }
  };
  
  Item.prototype.unuse = function () {
    if (this.using) {
      this.changePlayerStat(-this.energy, "energy");
      this.changePlayerStat(-this.enthusiasm, "enthusiasm");
      this.changePlayerStat(-this.speed, "speed");
      this.using = false;
      return true;
    } else {
      console.error("You weren't using that item anyway.");
      return false;
    }
  };
    
  //////////////////////
  /// PUBLIC METHODS ///
  //////////////////////
  
  //return the uid of any item which is being used
  self.itemInUse = function () {
    for (let item in __playerItems) {
      if (__playerItems[item].using) {
        return item;
      }
    }
    return false;
  };
  
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
      __playerItems[uid] = new Item(settings);
      View.addItem(uid, __playerItems[uid]);
    } catch(err) {
      console.error(`No item with id ${id} found in items.JSON.`);
    }
  };

  //delete specified object from player items array
  self.remove = function (uid) {
    View.removeItem(uid);
    delete __playerItems[uid];
  };

  //check whether inventory contains at least one instance of specified object
  self.contains = function (id) {
    for (let item in __playerItems) {
      if (__playerItems[item].id === id) {
        return true;
      }
    }
    return false;
  };

  //returns a reference to a single item with unique id
  self.get = function (uid) {
    return __playerItems[uid];
  };
  
  self.init = function (itemsJSON) {
    __items = itemsJSON.items;
  };

  return self;
  
})();