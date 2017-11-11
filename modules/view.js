/*jshint esversion:6, devel: true, browser: true*/

const View = (function () {
  
  "use strict";
  
  const optionList = document.querySelector("#options");
  const itemList = document.querySelector('#inventory');
  const wallet = document.querySelector('#wallet');
  const clock = document.querySelector('#clock');
  
  const clear = function (parent) {
    while (parent.lastChild) {
        parent.removeChild(parent.lastChild);
      }
  };
  
  return {
    
    setFrameText (text) {
      document.querySelector("#frameText").innerHTML = text;
    },
    
    addOptions (options) {
      clear(optionList);
      try {
        for (let i = 0, fol = options.length; i < fol; i += 1) {
          let li = document.createElement('li');
          let button = document.createElement('button');
          button.dataset.optionId = i;
          button.textContent = options[i].text;
          li.appendChild(button);
          optionList.appendChild(li);
        }
      } catch(TypeError) {
        console.error('It looks like frameData is currently empty.');
      }
    },
    
    updateInventory () {
      clear(itemList);
      const items = Inventory.getAll();
      for (let i = 0, il = items.length; i < il; i +=1) {
        let li = document.createElement('li');
        li.textContent = items[i].name;
        itemList.appendChild(li);
      }
    },
    
    updateWallet () {
      wallet.textContent = Wallet.contents();
    },
    
    //TODO: convert time (mins) to hour:minute format by dividing by 60 and flooring, then putting colon, then modulo of division by 60
    updateTime () {
      let now = Time.get();
      let hour = (Math.floor(now / 60)).toString();
      let minutes = now % 60;
      if (minutes < 10) {
        minutes = '0' + minutes.toString();
      } else {
        minutes = minutes.toString();
      }
      clock.textContent = `${hour}:${minutes}`;
    },
    
    updateAll () {
      this.updateInventory();
      this.updateTime();
      this.updateWallet();
    },
    
    // removeItem - only removes item with selected index. includes effect for removal
    // same for getItem
    
    toggleItemInfo () {
      //if info box is hidden
        //show box with text in it
        //also a dismiss button ("OK")
      //else hide the info box
    },
    
  };

})();