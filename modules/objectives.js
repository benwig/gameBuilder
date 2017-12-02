/*jshint esversion:6, devel: true, browser: true*/

const Objectives = (function () {
  
  "use strict";
  
  const self = {};
  const objectives = {};
  
  //splits a string into an array of arguments (objective ids)
  //then loops through each item and executes a callback on it
  const __loopThroughArgs = function (ids, callback) {
    ids = ids.split(" ");
    for (let i = 0; i < ids.length; i += 1) {
      let id = ids[i];
      callback(id);
    }
  };
  
  //constructor function for objectives
  function Objective (settings) {
    this.text = settings.text;
    this.type = settings.type;
    this.assigned = false;
    this.completed = false;
    this.failed = false;
    this.successCriteria = settings.successCriteria;
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
  
  self.assign = function (ids) {
    __loopThroughArgs(ids, function (id) {
      try {
        if (!objectives[id].assigned) {
          objectives[id].changeAssigned(true);
          View.assignObjective(id, objectives[id].text, objectives[id].type);
        }
      } catch (TypeError) {
        console.error(`There's no objective called '${id}'`);
      }
    });
  };
  
  self.complete = function (ids) {
    __loopThroughArgs(ids, function (id) {
      try {
        if (!objectives[id].completed) {
          objectives[id].changeComplete(true);
          View.markObjectiveCompleted(id);
        }
      } catch (TypeError) {
        console.error(`There's no objective called '${id}'`);
      }
    });
  };
  
  self.fail = function (ids) {
    __loopThroughArgs(ids, function (id) {
      try {
        if (objectives[id].assigned && !objectives[id].failed && !objectives[id].completed) {
          objectives[id].fail();
          View.failObjective(id, objectives[id].text);
        }
      } catch (TypeError) {
        console.error(`There's no objective called '${id}'`);
      }
    });
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
  
  //returns an array with a subset of info about all assigned/completed objectives. Useful if repopulating frontend after reload.
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