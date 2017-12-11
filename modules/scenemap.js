/*jshint esversion:6, devel: true, browser: true*/

const Scenemap = (function () {

  "use strict";
  
  let __coordinates = {};
  let __startingPointSet = false;
  
  return {
    
    updateLocation (co) {
      let xy = __coordinates[co] || co,
          x,
          y;
      xy = xy.split(" ", 2);
      x = parseInt(xy[0]);
      y = parseInt(xy[1]);
      
      if (__startingPointSet) {
        View.updateLocation(x, y);
      } else {
        View.setLocation(x, y);
        __startingPointSet = true;
      }
    },
    
    set: function (filename) {
      View.setMap(filename);
      if (__startingPointSet) {
        View.destroyLocation();
        __startingPointSet = false;
      }
    },
    
    init: function (coordinatesJSON) {
      let co = coordinatesJSON.coordinates;
      __coordinates = co;
      console.log(__coordinates);
    }
    
  };

})();