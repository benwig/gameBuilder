/*jshint esversion:6, devel: true, browser: true*/

const Player = (function () {
  
  "use strict";
  
  const __data = {
    energy: {
      value: 0,
      limit: 10
    },
    enthusiasm: {
      value: 0,
      limit: 5
    },
    speed: {
      value: 0,
      limit: 10
    },
    choices: {}
  };
  
  return {
    
    setChoice: function (newvalue, key) {
      __data.choices[key] = newvalue;
      return __data.choices[key];
    },
    
    get: function (key, key2="value") {
      return __data[key][key2];
    },
    
    increment: function (change, key) {
      let limit = __data[key].limit,
        newvalue = __data[key].value + parseInt(change);
      if (newvalue > limit) {
        newvalue = limit;
      } else if (newvalue < 0) {
        newvalue = 0;
      }
      __data[key].value = newvalue;
      //update UI display
      if (key === "energy" || key === "enthusiasm") {
        View.updateStats(key, __data[key].value, __data[key].limit);
      }
    },
    
    setupChoices: function (choicesJSON) {
      let c = choicesJSON.choices;
      for (let i = 0; i < c.length; i += 1) {
        __data.choices[c[i]] = false; 
      }
    },
    
    init: function (settings) {
      __data.energy.limit = settings.energyLimit;
      this.increment(settings.startEnergy, 'energy');
      __data.enthusiasm.limit = settings.enthusiasmLimit;
      this.increment(settings.startEnthusiasm, 'enthusiasm');
      __data.speed.limit = settings.speedLimit;
    }

  };
  
})();