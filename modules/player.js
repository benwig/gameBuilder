/*jshint esversion:6, devel: true, browser: true*/

const Player = (function () {
  
  "use strict";
  
  const data = {
    energy: {
      value: 0,
      limit: 10
    },
    enthusiasm: {
      value: 0,
      limit: 5
    },
    choices: {}
  };
  
  return {
    
    set: function (newvalue, key, key2="value") {
      data[key][key2] = newvalue;
      return data[key][key2];
    },
    
    get: function (key, key2="value") {
      return data[key][key2];
    },
    
    increment: function (change, key) {
      let limit = data[key].limit,
          newvalue = data[key].value + parseInt(change);
      if (newvalue > limit) {
        newvalue = limit;
      } else if (newvalue < 0) {
        newvalue = 0;
      }
      data[key].value = newvalue;
      View.updateStats(key, data[key].value, data[key].limit);
    }

  };
  
})();