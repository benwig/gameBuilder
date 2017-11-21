/*jshint esversion:6, devel: true, browser: true*/

const Inventory = (function () {
  
  "use strict";
  
  const items = [];
  
  //Basic item constructor
  function Item(settings) {
    settings = settings || {};
    this.name = settings.name || "Unnamed Object";
    this.description = settings.description || "An undescribed object";
    this.icon = settings.icon || "unknownObject.png";
    this.value = settings.value || 0;
    this.nutrition = settings.nutrition || 0;
    this.energy = settings.energy || 0;
    this.speed = settings.speed || 0;
    this.wearable = settings.wearable || false;
    this.using = false;
  }
  
  Item.prototype.consume = function () {
    // if this.nutrition > 0
    // add this.nutrition to player.hunger
    // else log an error
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

  return {
    
    //place specified object in items array
    add: function (settings) {
      let x = new Item(settings);
      items.push(x);
      View.updateInventory();
    },
    
    //delete specified object from items array
    remove: function (index) {
      items.splice(index, 1);
      View.updateInventory();
    },
    
    //check whether inventory contains at least one instance of specified object
    contains: function (name) {
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
    get: function (name) {
      const i = this.getIndexOf(name);
      return items[i];
    },
  
    //returns the entire items array as refernce, with all the item attributes and methods
    getAll: function () {
      return items;
    },
    
    //returns the index position of the first item in the array which has a name matching the argument
    getIndexOf: function (name) {
      let i,
          il;
      for (i = 0, il = items.length; i < il; i += 1) {
        if (items[i].name === name) {
          return i;
        }
      }
      console.error("No item with that name.");
    }
    
  };
  
})();