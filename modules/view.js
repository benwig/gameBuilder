/*jshint esversion:6, devel: true, browser: true*/

const View = (function () {
  
  "use strict";
  
  const optionList = document.querySelector("#options");
  const itemList = document.querySelector('#inventory');
  const wallet = document.querySelector('#wallet');
  const clock = document.querySelector('#clock');
  const coreObjectives = document.querySelector('#objectives-core');
  const secondaryObjectives = document.querySelector('#objectives-secondary');
  const energy = document.querySelector('#energy');
  const enthusiasm = document.querySelector('#enthusiasm');
  
  const clear = function (parent) {
    while (parent.lastChild) {
        parent.removeChild(parent.lastChild);
      }
  };
  
  //return a button
  const buildButton = function(label, callback) {
    let button = document.createElement('button');
    button.textContent = label;
    button.addEventListener('click', function () {
      callback();
    });
    return button;
  };
    
  //return a paragraph
  const buildP = function(content) {
    let p = document.createElement('p');
    p.textContent = content;
    return p;
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
          button.dataset.optionId = options[i].uid;
          button.textContent = options[i].text;
          li.appendChild(button);
          optionList.appendChild(li);
        }
      } catch(TypeError) {
        console.error('It looks like frameData is currently empty.');
      }
    },
    
    addItem (uid, item) {
      const li = document.createElement('li');
      li.textContent = item.name;
      li.dataset.itemUid = uid;
      itemList.appendChild(li);
    },
    
    removeItem (uid) {
      const items = itemList.children;
      let itemToRemove;
      for (let i = 0; i < items.length; i += 1) {
        if (items[i].dataset.itemUid === uid) {
          itemToRemove = items[i];
          break;
        }
      }
      itemList.removeChild(itemToRemove);
    },
    
    closeItemInfo () {
      document.getElementById('iteminfo').close();
    },
    
    //build an info panel for items, with event listeners on buttons
    openItemInfo (uid, item) {
      const dialog = document.getElementById("iteminfo"),
            name = document.getElementById("iteminfo--name"),
            description = document.getElementById("iteminfo--description"),
            buttons = document.getElementById("iteminfo--buttons");
      
      // add text
      name.textContent = item.name;
      clear(description);
      description.appendChild(buildP(item.description));
      
      // add buttons
      clear(buttons);
      buttons.appendChild(buildButton("Close", Handlers.closeItemInfo));
      if (item.energy > 0) {
        buttons.appendChild(buildButton("Consume", function(){
          Handlers.consumeItem(uid);
          Handlers.closeItemInfo();
        }));
        description.appendChild(buildP(` Energy: ${item.energy}`));
      }
      dialog.showModal();
    },
    
    updateWallet (value) {
      wallet.textContent = value;
    },
    
    updateTime (now) {
      let hour = (Math.floor(now / 60)).toString();
      let minutes = now % 60;
      if (minutes < 10) {
        minutes = '0' + minutes.toString();
      } else {
        minutes = minutes.toString();
      }
      clock.textContent = `${hour}:${minutes}`;
    },
    
    updateStats (name, value, limit) {
      switch(name) {
        case "energy":
          energy.textContent = `${value}/${limit}`;
          break;
        case "enthusiasm":
          enthusiasm.textContent = `${value}/${limit}`;
          break;
        default:
          console.error("Could not update stats, incorrect argument given.");
      }
    },
    
    // adds new objective. includes effect for addition
    assignObjective (id, text, type) {
      let objLi = document.createElement('li');
      objLi.textContent = text;
      objLi.id = `objective--${id}`;
      if (type === "core") {
        coreObjectives.appendChild(objLi);
      } else {
        secondaryObjectives.appendChild(objLi);
      }
    },
    
    // only removes objective with selected index. includes effect for removal
    removeObjective (id) {
      let toRemove = document.getElementById(`objective--${id}`);
      toRemove.parentNode.removeChild(toRemove);
    },
    
    // adds completed class to objective with selected index
    markObjectiveCompleted (id) {
      document.getElementById(`objective--${id}`).classList.add("objective--completed");
    },
    
    failObjective (id, text) {
      alert(`You have failed an objective: ${text}`);
      this.removeObjective(id);
    }
    
  };

})();