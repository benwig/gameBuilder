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
    this.id = settings.id;
    this.text = settings.text;
    this.type = settings.type || "inherit";
    this.parent = settings.parent || false;
    this.children = [];
    this.timelimit = settings.timelimit || false;
    this.assigned = false;
    this.completed = false;
    this.failed = false;
  }
  
  //return true if all child objectives are complete
  Objective.prototype.allChildrenComplete = function () {
    let i,
        childId;
    for (i = 0; i < this.children.length; i += 1) {
      childId = this.children[i];
      if (!objectives[childId].completed) {
        return false;
      }
    }
    return true;
  };

  Objective.prototype.changeComplete = function (bool) {
    this.completed = bool;
    if (bool && this.parent) {
      //Check whether parents' children have all been completed
      if (objectives[this.parent].allChildrenComplete()) {
        //If yes, mark parent as complete too
        objectives[this.parent].changeComplete(true);
      }
    }
    View.toggleObjectiveCompletion(this.id);
  };
  
  Objective.prototype.changeAssigned = function (bool) {
    let i;
    if (this.assigned !== bool) {
      this.assigned = bool;
      if (bool) {
        this.timeAssigned = Time.get();
        View.assignObjective(this.id, this.text, this.type, this.parent, this.children.length);
      }
    }
    //make sure each of the objectives' children match its status
    for (i = 0; i < this.children.length; i += 1) {
      let childId = this.children[i];
      if (objectives[childId].assigned !== bool) {
        objectives[childId].changeAssigned(bool);
      }
    }
    //if objective has a parent, make sure that matches too
    if (this.parent && objectives[this.parent].assigned !== bool) {
      objectives[this.parent].changeAssigned(bool);
    }
  };
  
  //change all child objectives to failed
  Objective.prototype.failChildren = function () {
    for (let i = 0; i < this.children.length; i += 1) {
      objectives[this.children[i]].failed = true;
    }
  };
  
  //fail if not assigned and not already completed/failed
  Objective.prototype.fail = function (bool) {
    if (this.assigned && !this.failed && !this.completed) {
      this.failed = true;
      View.failObjective(this.id, this.text);
      //fail the parent objective too
      if (this.parent) {
        objectives[this.parent].fail();
      }
      //fail any children
      this.failChildren();
    }
  };

  //////////////////////
  /// PUBLIC METHODS ///
  //////////////////////
  
  //create objective objects using objectives.JSON
  self.init = function (objectivesJSON) {
    let objList = objectivesJSON.objectives,
        i;
    //first, create all objectives
    for (i = 0; i < objList.length; i += 1) {
      let o = objList[i];
      objectives[o.id] = new Objective(o);
    }
    //next, go back and add references to child objectives in parents
    for (i = 0; i < objList.length; i += 1) {
      let o = objList[i];
      if (o.parent) {
        try {
          objectives[o.parent].children.push(o.id);
        } catch (TypeError) {
          console.error(`${o.id}'s parent doesn't exist.`);
        }
      }
    }
    console.log(objectives);
  };
  
  //assign an objective to the player
  self.assign = function (ids) {
    __loopThroughArgs(ids, function (id) {
      try {
        objectives[id].changeAssigned(true);
      } catch (TypeError) {
        console.error(`There's no objective called '${id}'`);
      }
    });
  };
  
  //mark an objective as complete
  self.complete = function (ids) {
    __loopThroughArgs(ids, function (id) {
      try {
        if (!objectives[id].completed) {
          objectives[id].changeComplete(true);
        }
      } catch (TypeError) {
        console.error(`There's no objective called '${id}'`);
      }
    });
  };
  
  //mark an objective as failed
  self.fail = function (ids) {
    __loopThroughArgs(ids, function (id) {
      try {
        objectives[id].fail();
      } catch (TypeError) {
        console.error(`There's no objective called '${id}'`);
      }
    });
  };
  
  //return an attribute value (e.g. bool failed, assigned)
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
  
  return self;
  
})();