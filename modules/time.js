/*jshint esversion:6, devel: true, browser: true*/

const Time = (function () {
  
  "use strict";
  
  let now = 300; //time in minutes since 00:00
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
  let timeSinceEnergyDeduction = 0;
  
  //TODO: helper function which gets the player's enthusiasm, and uses a formula to deduct minutes from travel time as appropriate. Then returns the total travel time.
  
  return {
    
    get: function () {
      return now;
    },
    
    increment: function (minutes) {
      now = now + minutes;
      //check if the clock has passed a half-hour, if so, deduct 1 energy for each half hour passed
      timeSinceEnergyDeduction += minutes;
      if (timeSinceEnergyDeduction >= 30) {
        let decreaseBy = Math.floor(timeSinceEnergyDeduction/30);
        Player.increment(-decreaseBy, "energy");
        timeSinceEnergyDeduction = timeSinceEnergyDeduction%30;
      }
      View.updateTime(now);
    },
    
    laterThan: function (minutes) {
      if (now > parseInt(minutes)) {
        return true;
      } else {
        return false;
      }
    },
    
    earlierThan: function (minutes) {
      if (now < parseInt(minutes)) {
        return true;
      } else {
        return false;
      }
    }
    
  };
  
})();