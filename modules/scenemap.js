/*jshint esversion:6, devel: true, browser: true*/

const Scenemap = (function () {

  "use strict";
  
  let __coordinates = {};
  
  return {
    
    updateLocation (co) {
      let xy = __coordinates[co] || co,
          x,
          y;
      xy = xy.split(" ", 2);
      x = parseInt(xy[0]);
      y = parseInt(xy[1]);
      console.log(x, y);
    },
    
    set: function (filename) {
      View.setMap(filename);
    },
    
    init: function (coordinatesJSON) {
      let co = coordinatesJSON.coordinates;
      __coordinates = co;
      console.log(__coordinates);
    }
    
  };

})();