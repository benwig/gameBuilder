/*jshint esversion:6, devel: true, browser: true*/

const Inventory = (function () {
  
  "use strict";
  
  const self = {};
  const items = [];
  const newIdMaker = function () {
    let i = 0;
    return function() {
      return i++;
    }
  };
  const newId = newIdMaker();
  
  //Basic item constructor
  function Item(settings) {
    settings = settings || {};
    this.id = newId();
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
  Item.prototype.consume = function () {
    if (this.energy > 0) {
      Player.increment(this.energy, "energy");
      self.remove(self.getIndexOf(this.id));
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
  self.add = function (settings) {
    let x = new Item(settings);
    items.push(x);
    View.updateInventory();
  },

  //delete specified object from items array
  self.remove = function (index) {
    items.splice(index, 1);
    View.updateInventory();
  },

  //check whether inventory contains at least one instance of specified object
  self.contains = function (name) {
    let i,
        il;
    for (i = 0, il = items.length; i < il; i += 1) {
      if (items[i].name === name) {
        return true;
      }
    }
    return false;
  },

  //returns a reference to a single item
  self.get = function (id) {
    const i = this.getIndexOf(id);
    return items[i];
  },

  //returns the entire items array as refernce, with all the item attributes and methods
  self.getAll = function () {
    return items;
  },

  //returns the index position of the item in the array with unique id
  self.getIndexOf = function (id) {
    let i,
        il;
    for (i = 0, il = items.length; i < il; i += 1) {
      if (items[i].id === parseInt(id)) {
        return i;
      }
    }
    console.error("No item with that id.");
  }

  return self;
  
})();