/*jshint esversion:6, devel: true, browser: true*/

const Time = (function () {
  
  "use strict";
  
  let __now = 0; //time in minutes since 00:00
  //TODO: timebands so you can quickly check if game has reached a certain timeframe, e.g. for use in descriptions. May be easier than using laterThan/earlierThan. Add corresponding function to return timezone/check timezone.
  /*const timebands = {
    "predawn": {lower: 0, upper: 299}, //00:00 - 05:00
    "dawn": {lower: 300, upper: 359}, //05:00 - 06:00
    "earlymorning": {lower: 360, upper: 419}, //06:00 - 08:00
    "midmorning": {lower: 420, upper: 479}, //08:00 - 10:00
    "latemorning": {} //10:00 - 11:30
    "midday" //11:30 - 12:30
    "earlyafternoon" //12:30 - 14:00
    "midafternoon" //14:00 - 16:00
    "lateafternoon"//16:00 - 17:00
    "earlyevening" //17:00 - 18:00
    "lateevening" //18:00 - 20:00
    "twilight" //20:00 - 21:00
    "dusk" //21:00 - 22:00
    "night" //22:00 - 24:00
  }*/
  let __timeSinceEnergyDeduction = 0;
  
  //increase / reduce travel time based on variables
  const __modifyIncrement = function (minutes) {
    const eRatio = Player.get("enthusiasm", "value") / Player.get("enthusiasm", "limit");
    const sRatio = Player.get("speed", "value") / Player.get("speed", "limit");
    let eDiff = ((eRatio * 0.75) + (sRatio * 0.25)) - 0.5;
    //anything above (below) baseline reduces (increases) base travel time up to 50%.
    minutes = minutes - (minutes * eDiff);
    return Math.ceil(minutes); //Math.ceil ensures minutes is never 0
  };
  
  return {
    
    get: function () {
      return __now;
    },
    
    increment: function (minutes) {
      minutes = __modifyIncrement(minutes);
      __now = __now + minutes;
      //check if the clock has passed a half-hour, if so, deduct 10% energy for each half hour passed
      __timeSinceEnergyDeduction += minutes;
      if (__timeSinceEnergyDeduction >= 30) {
        let decreaseBy = __timeSinceEnergyDeduction/30;
        let energyUnit = (Player.get("energy", "limit") / 100) * 10;
        decreaseBy = Math.floor(decreaseBy * energyUnit);
        Player.increment(-decreaseBy, "energy");
        __timeSinceEnergyDeduction = __timeSinceEnergyDeduction%30;
      }
      View.updateTime(__now);
    },
    
    laterThan: function (minutes) {
      if (__now > parseInt(minutes)) {
        return true;
      } else {
        return false;
      }
    },
    
    earlierThan: function (minutes) {
      if (__now < parseInt(minutes)) {
        return true;
      } else {
        return false;
      }
    },
    
    //called once when game is loaded - sets starting time and updates the time widget in DOM
    //TODO: call Time.init from init.js
    init: function (startTime) {
      __now = startTime || 0;
      View.updateTime(__now);
    }
    
  };
  
})();