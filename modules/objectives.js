/*jshint esversion:6, devel: true, browser: true*/

const Objectives = (function () {
  
  "use strict";
  
  const self = {};
  const objectives = {};
  
  //constructor function for objectives
  function Objective (settings) {
    this.text = settings.text;
    this.type = settings.type;
    this.assigned = true;
    this.completed = false;
    this.failed = false;
  }

  Objective.prototype.changeComplete = function (bool) {
    this.completed = bool;
  };
  
  Objective.prototype.changeAssigned = function (bool) {
    this.assigned = bool;
    if (bool) {
      this.timeAssigned = Time.get();
    }
  };
  
  Objective.prototype.fail = function (bool) {
    this.failed = true;
  };

  //////////////////////
  /// PUBLIC METHODS ///
  //////////////////////
  
  //create objective objects using objectives.JSON
  self.init = function (objectivesJSON) {
    let objList = objectivesJSON.objectives;
    for (let i = 0; i < objList.length; i += 1) {
      let id = objList[i].id,
          text = objList[i].text,
          type = objList[i].type;
      objectives[id] = new Objective({"text": text, "type": type});
    }
  };
  
  self.complete = function (id) {
    try {
      objectives[id].changeComplete(true);
    } catch (TypeError) {
      console.error(`There's no objective called '${id}'`);
    }
    View.markObjectiveCompleted(id);
  };
  
  self.uncomplete = function (id) {
    try {
      objectives[id].changeComplete(false);
    } catch (TypeError) {
      console.error(`There's no objective called '${id}'`);
    }
  };
  
  self.fail = function (id) {
    try {
      objectives[id].fail();
    } catch (TypeError) {
      console.error(`There's no objective called '${id}'`);
    }
    View.removeObjective(id);
  };
  
  self.assign = function (id) {
    objectives[id].changeAssigned(true);
    View.addObjective(id);
  };
  
  self.getAttribute = function (id, attr) {
    try {
      if (objectives[id].hasOwnProperty(attr)) {
        return objectives[id][attr];
      } else {
        console.error(`Objective '${id}' has no attribute '${attr}'`);
      }
    } catch (TypeError) {
      console.error(`There's no objective called '${id}'`);
    }
  };
  
  //returns an array with a subset of info about all assigned/completed objectives
  self.getAll = function () {
    let minilist = [];
    
    for (let key in objectives) {
      if (!objectives.hasOwnProperty(key)) {
        continue;
      } else if (objectives[key].assigned && !objectives[key].failed) {
        minilist.push({"text": objectives[key].text, "type": objectives[key].type, "completed": objectives[key].completed});
      }
    }
    
    return minilist;
  };
  
  return self;
  
})();