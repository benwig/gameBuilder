/*jshint esversion:6, devel: true, browser: true*/

const Objectives = (function () {
  
  "use strict";
  
  const self = {};
  const objectives = {};
  
  //constructor function for objectives
  function Objective (settings) {
    this.text = settings.text;
    this.type = settings.type;
    this.assigned = false;
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
  
  //TODO: init function, for turning the objectives.JSON into named objective objects and pushing them to the objectives object with key "name"
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
    objectives[id].changeComplete(true);
    View.updateObjectives();
  };
  
  self.uncomplete = function (id) {
    objectives[id].changeComplete(false);
    View.updateObjectives();
  };
  
  self.fail = function (id) {
    objectives[id].fail();
    View.updateObjectives();
  };
  
  self.assign = function (id) {
    objectives[id].changeAssigned(true);
  };
  
  self.getStatus = function (id) {
    return objectives[id].completed;
  };
  
  //returns a subset of info about items which have already been assigned
  self.getAll = function () {
    let minilist = [];
    for (let x in objectives) {
      if (objectives[x].assigned && !objectives[x].failed) {
        minilist.push({"text": objectives[x].text, "type": objectives[x].type, "completed": objectives[x].completed});
      }
    }
    return minilist;
  };
  
  return self;
  
})();