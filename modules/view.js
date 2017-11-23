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
  
  return {
    
    updateAll () {
      this.updateInventory();
      this.updateTime();
      this.updateWallet();
    },
    
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
        li.dataset.itemId = items[i].id;
        itemList.appendChild(li);
      }
    },
    
    // removeItem - only removes item with selected index. includes effect for removal
    // same for getItem
    
    //build an info panel for items, with the correct event listeners
    openItemInfo (itemId) {
      const dialog = document.getElementById("iteminfo"),
            name = document.getElementById("iteminfo--name"),
            description = document.getElementById("iteminfo--description"),
            buttons = document.getElementById("iteminfo--buttons"),
            item = Inventory.get(itemId),
            closeButton = document.createElement('button');
      // add text
      name.textContent = item.name;
      description.textContent = item.description;
      // add buttons
      clear(buttons);
      closeButton.textContent = "Close";
      closeButton.addEventListener('click', function () {
        document.getElementById('iteminfo').close();
      });
      buttons.appendChild(closeButton);
      if (item.nutrition > 0) {
        let consumeButton = document.createElement('button');
        consumeButton.dataset.itemId = item.id;
        consumeButton.textContent = "Consume";
        consumeButton.addEventListener('click', function () {
          document.getElementById('iteminfo').close();
          Handlers.consumeItem(event);
        });
        buttons.appendChild(consumeButton);
        console.log('edible');
      }
      dialog.showModal();
    },
    
    updateWallet () {
      wallet.textContent = Wallet.contents();
    },
    
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
    
    updateStats (name) {
      switch(name) {
        case "energy":
          energy.textContent = `${Player.get("energy")}/${Player.get("energy", "limit")}`;
          break;
        case "enthusiasm":
          enthusiasm.textContent = `${Player.get("enthusiasm")}/${Player.get("enthusiasm", "limit")}`;
          break;
        default:
          console.error("Could not update stats, incorrect argument given.");
      }
    },
    
    // adds new objective. includes effect for addition
    assignObjective (id) {
      let objLi = document.createElement('li');
      objLi.textContent = Objectives.getAttribute(id, "text");
      objLi.id = `objective--${id}`;
      if (Objectives.getAttribute(id, "type") === "core") {
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
    }
    
  };

})();