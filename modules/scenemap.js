/*jshint esversion:6, devel: true, browser: true*/

const Scenemap = (function () {

  "use strict";
  
  let __coordinates = {};
  
  return {
    
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