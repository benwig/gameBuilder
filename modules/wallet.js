/*jshint esversion:6, devel: true, browser: true*/

const Wallet = (function () {
  
  "use strict";
  
  var value = 0;
  
  return {
    
    changeBy: function (sum) {
      if (value + sum < 0) {
        value = 0;
      } else {
        value = value + parseInt(sum);
      }
      View.updateWallet();
      return value;
    },
    
    check: function () {
      return value;
    },
    
    canAfford: function (sum) {
      if (value - sum < 0) {
        return false;
      } else {
        return true;
      }
    }
    
  };
  
})();