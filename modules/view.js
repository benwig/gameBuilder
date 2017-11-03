/*jshint esversion:6, devel: true, browser: true*/

const View = (function (Inventory, Scene) {
  
  "use strict";
  
  const options = document.querySelector("#options");
  const itemList = document.querySelector('#inventory');
  
  const clear = function (parent) {
    while (parent.lastChild) {
        parent.removeChild(parent.lastChild);
      }
  };
  
  return {
    
    setFrameText () {
      document.querySelector("#frameText").textContent = Scene.frameData.text;
    },
    
    addOptions () {
      
      clear(options);
      
      try {
        for (let i = 0; i < Scene.frameData.options.length; i += 1) {
          let li = document.createElement('li');
          let button = document.createElement('button');
          button.dataset.optionId = i;
          button.textContent = Scene.frameData.options[i].text;
          li.appendChild(button);
          options.appendChild(li);
        }
      } catch(TypeError) {
        console.error('It looks like frameData is currently empty.');
      }
    },
    
    updateInventory () {
      clear(itemList);
      const items = Inventory.getAll();
      let i;
      for (i = 0; i < items.length; i +=1) {
        let li = document.createElement('li');
        li.textContent = items[i].name;
        itemList.appendChild(li);
      }
    },
    
    // removeItem - only removes item with selected index. includes effect for removal
    // same for getItem
    
    toggleItemInfo () {
      //if info box is hidden
        //show box with text in it
        //also a dismiss button ("OK")
      //else hide the info box
    }
    
  };

})();