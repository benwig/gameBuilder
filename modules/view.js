/*jshint esversion:6, devel: true, browser: true*/

const View = (function () {
  
  "use strict";
  
  const __frameText = document.querySelector("#frameText");
  const __optionList = document.querySelector("#options");
  const __itemList = document.querySelector('#inventory');
  const __wallet = document.querySelector('#wallet');
  const clock = document.querySelector('#clock');
  const coreObjectives = document.querySelector('#objectives-core');
  const secondaryObjectives = document.querySelector('#objectives-secondary');
  const energy = document.querySelector('#energy');
  const enthusiasm = document.querySelector('#enthusiasm');
  const mapSpace = document.querySelector('#map');
  const imageSpace = document.querySelector('#image');
  const infobutton = document.querySelector('#infobutton');
  const infobox = document.querySelector('#infobox');
  
  const clear = function (parent) {
    while (parent.lastChild) {
        parent.removeChild(parent.lastChild);
      }
  };
  
  ///////////////////
  //PRIVATE HELPERS//
  ///////////////////
  
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
    
    //sets css to display: none / removes display: none
    toggleReveal (element) {
      element.classList.toggle('js-hidden');
    },
    
    //removes css for visibility: hidden
    makeVisible (element) {
      element.classList.remove('js-invisible');
    },
    
    //adds css for visibility: hidden
    makeInvisible (element) {
      element.classList.add('js-invisible');
    },
    
    setFrameText (prefix, maintext, suffix) {
      let fulltext = maintext;
      if (prefix) {
        fulltext = `${prefix}<br><br>${maintext}`;
      }
      if (suffix) {
        fulltext += `<br><br>${suffix}`;
      }
      __frameText.innerHTML = fulltext;
    },
    
    addOptions (options) {
      clear(__optionList);
      try {
        for (let i = 0, fol = options.length; i < fol; i += 1) {
          let li = document.createElement('li');
          let button = document.createElement('button');
          button.dataset.optionId = options[i].uid;
          button.textContent = options[i].text;
          li.appendChild(button);
          __optionList.appendChild(li);
        }
      } catch(TypeError) {
        console.error('It looks like frameData is currently empty.');
      }
    },
    
    addInfo (infotext, read) {
      clear(infobox);
      let p = buildP(infotext);
      infobox.appendChild(p);
      this.makeVisible(infobutton);
      if (read) {
        infobutton.classList.remove("infobutton--unread");
        infobutton.classList.add("infobutton--read");
      } else {
        infobutton.classList.add("infobutton--unread");
        infobutton.classList.remove("infobutton--read");
      }
    },
    
    toggleInfo () {
      this.toggleReveal(infobox);
      infobutton.classList.remove("infobutton--unread");
      infobutton.classList.add("infobutton--read");
    },
    
    hideInfo () {
      if (!infobox.classList.contains('js-hidden')) {
        infobox.classList.add('js-hidden');
      }
      this.makeInvisible(infobutton);
    },
    
    setMap (filename) {
      mapSpace.style.backgroundImage = `url("media/maps/${filename}")`;
    },
    
    setLocation (x, y) {
      let playerIcon = document.createElement('img');
      playerIcon.src = "media/icons/player.png";
      playerIcon.id = ("playerIcon");
      playerIcon.classList.add("playerIcon");
      playerIcon.style.left = x;
      playerIcon.style.bottom = y;
      mapSpace.appendChild(playerIcon);
    },
    
    updateLocation (x, y) {
      let playerIcon = document.querySelector("#playerIcon");
      playerIcon.style.left = x;
      playerIcon.style.bottom = y;
    },
    
    destroyLocation () {
      mapSpace.removeChild(document.querySelector("#playerIcon"));
    },
    
    displayImage (filename) {
      imageSpace.style.backgroundImage = `url("media/images/${filename}")`;
      imageSpace.classList.remove('js-hidden');
    },
    
    hideImage () {
      if (!imageSpace.classList.contains('js-hidden')) {
        imageSpace.classList.add('js-hidden');
      }
    },
    
    addItem (uid, item) {
      const li = document.createElement('li');
      li.textContent = item.name;
      li.dataset.itemUid = uid;
      __itemList.appendChild(li);
    },
    
    removeItem (uid) {
      const items = __itemList.children;
      let itemToRemove;
      for (let i = 0; i < items.length; i += 1) {
        if (items[i].dataset.itemUid === uid) {
          itemToRemove = items[i];
          break;
        }
      }
      __itemList.removeChild(itemToRemove);
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
      // add consume button if item is edible
      if (item.edible) {
        buttons.appendChild(buildButton("Consume", function(){
          Handlers.consumeItem(uid);
          Handlers.closeItemInfo();
        }));
        description.appendChild(buildP(` Energy: ${item.energy}`));
      }
      //add use button if item is usable
      if (item.usable && !item.using) {
        buttons.appendChild(buildButton("Use", function(){
          Handlers.useItem(uid);
          Handlers.closeItemInfo();
        }));
        description.appendChild(buildP(` Speed bonus: ${item.speed}`));
      }
      //add unuse button if item's already in use
      if (item.usable && item.using) {
        buttons.appendChild(buildButton("Stop using", function(){
          Handlers.unuseItem(uid);
          Handlers.closeItemInfo();
        }));
        description.appendChild(buildP(` Speed bonus: ${item.speed}`));
      }
      dialog.showModal();
    },
    
    switchItemAlert (uidInUse, nameInUse, uidToUse, nameToUse) {
      let msg = `You're already using ${nameInUse}. Use ${nameToUse} instead?`;
      let response = confirm(msg);
      if (response) {
        Handlers.unuseItem(uidInUse);
        Handlers.useItem(uidToUse);
      }
    },
    
    updateWallet (value) {
      __wallet.textContent = value;
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
          console.error(`Could not update stats for ${name} in UI.`);
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