/*jshint esversion:6, devel: true, browser: true*/

const Objectives = (function () {
  
  "use strict";
  
  const self = {};
  const objectives = [];
  
  //constructor function for objectives
  function Objective(settings) {
    this.text = settings.text;
    this.assigned = false;
    this.completed = false;
  }

  Objective.prototype.changeComplete = function (bool) {
    this.completed = bool;
  };
  
  Objective.prototype.changeAssigned = function (bool) {
    this.assigned = bool;
  };

  //////////////////////
  /// PUBLIC METHODS ///
  //////////////////////
  
  //TODO: init function, for turning the objectives.JSON into named objective objects and pushing them to the objectives array
  self.init = function (objectivesJSON) {
    console.log("Init objectives");
  };
  
  self.complete = function (name) {
    objectives[name].changeComplete(true);
    View.updateObjectives();
  };
  
  self.uncomplete = function (name) {
    objectives[name].changeComplete(false);
    View.updateObjectives();
  };
  
  self.assign = function (name) {
    objectives[name].changeAssigned(true);
  }
  
  self.getStatus = function (name) {
    return objectives[name].completed;
  };
  
  self.getText = function (name) {
    return objectives[name].text;
  };
  
  //returns a subset of info about items which have already been assigned
  self.getAll = function () {
    let minilist = [];
    for (let i = 0, l = objectives.length; i < l; i += 1) {
      if (objectives[i].assigned) {
        minilist.push({"text": objectives[i].text, "completed": objectives[i].completed});
      }
    }
    return minilist;
  };
  
  return self;
  
})();