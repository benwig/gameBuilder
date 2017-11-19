/*jshint esversion:6, devel: true, browser: true*/

const Player = (function () {
  
  "use strict";
  
  const data = {
    energy: 0,
    enthusiasm: 0,
    choices: {}
  };
  
  return {
    
    set: function (key, value) {
      data[key] = value;
    },
    
    get: function (key) {
      return data[key];
    },
    
    increment: function (key, value) {
      data[key] += parseInt(value);
    }

  };
  
})();