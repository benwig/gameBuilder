/*jshint esversion:6, devel: true, browser: true*/

const View = (function () {
  
  "use strict";
  
  const __frameText = document.querySelector("#frameText");
  const __optionList = document.querySelector("#options");
  const __itemList = document.querySelector('#inventory');
  const __iteminfo = document.getElementById("iteminfo");
  const __wallet = document.querySelector('#wallet');
  const __clock = document.querySelector('#clock');
  const __coreObjectives = document.querySelector('#objectives-core');
  const __secondaryObjectives = document.querySelector('#objectives-secondary');
  const __energy = document.querySelector('#energy');
  const __enthusiasm = document.querySelector('#enthusiasm');
  const __mapSpace = document.querySelector('#map');
  const __imageSpace = document.querySelector('#image');
  const __infobutton = document.querySelector('#infobutton');
  const __infobox = document.querySelector('#infobox');
  
  //compile handlebars templates
  const __frameTemplate = Handlebars.compile(document.getElementById("frameText-template").innerHTML);
  
  const __iteminfoTemplate = Handlebars.compile(document.getElementById("iteminfo-template").innerHTML);
  
  ///////////////////
  //PRIVATE HELPERS//
  ///////////////////
  
  const __clear = function (parent) {
    while (parent.lastChild) {
        parent.removeChild(parent.lastChild);
      }
  };
    
  //return a paragraph
  const __buildP = function(content) {
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
      let context = {prefix: prefix, maintext: maintext, suffix: suffix};
      __frameText.innerHTML = __frameTemplate(context);
    },
    
    addOptions (options) {
      __clear(__optionList);
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
      __clear(__infobox);
      let p = __buildP(infotext);
      __infobox.appendChild(p);
      this.makeVisible(__infobutton);
      if (read) {
        __infobutton.classList.remove("infobutton--unread");
        __infobutton.classList.add("infobutton--read");
      } else {
        __infobutton.classList.add("infobutton--unread");
        __infobutton.classList.remove("infobutton--read");
      }
    },
    
    toggleInfo () {
      this.toggleReveal(__infobox);
      __infobutton.classList.remove("infobutton--unread");
      __infobutton.classList.add("infobutton--read");
    },
    
    hideInfo () {
      if (!__infobox.classList.contains('js-hidden')) {
        __infobox.classList.add('js-hidden');
      }
      this.makeInvisible(__infobutton);
    },
    
    setMap (filename) {
      __mapSpace.style.backgroundImage = `url("media/maps/${filename}")`;
    },
    
    setLocation (x, y) {
      let playerIcon = document.createElement('img');
      playerIcon.src = "media/icons/player.png";
      playerIcon.id = ("playerIcon");
      playerIcon.classList.add("playerIcon");
      playerIcon.style.left = x;
      playerIcon.style.bottom = y;
      __mapSpace.appendChild(playerIcon);
    },
    
    updateLocation (x, y) {
      let playerIcon = document.querySelector("#playerIcon");
      playerIcon.style.left = x;
      playerIcon.style.bottom = y;
    },
    
    destroyLocation () {
      __mapSpace.removeChild(document.querySelector("#playerIcon"));
    },
    
    displayImage (filename) {
      __imageSpace.style.backgroundImage = `url("media/images/${filename}")`;
      __imageSpace.classList.remove('js-hidden');
    },
    
    hideImage () {
      if (!__imageSpace.classList.contains('js-hidden')) {
        __imageSpace.classList.add('js-hidden');
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
      __iteminfo.close();
    },
    
    openItemInfo (itemUid, item) {
      __iteminfo.showModal();
      this.renderItemInfo(itemUid, item);
    },
    
    //build an info panel for items
    renderItemInfo (uid, item) {
      const use = item.usable && !item.using,
            unuse = item.usable && item.using,
            context = {
              name: item.name,
              description: item.description,
              edible: item.edible,
              use: use,
              unuse: unuse,
              uid: uid,
              speed: item.speed,
              energy: item.energy
            };
      __iteminfo.innerHTML = __iteminfoTemplate(context);
    },
    
    switchItemAlert (uidInUse, nameInUse, uidToUse, nameToUse) {
      let msg = `You're already using ${nameInUse}. Use ${nameToUse} instead?`;
      let response = confirm(msg);
      if (response) {
        Handlers.switchItems(uidInUse, uidToUse);
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
      __clock.textContent = `${hour}:${minutes}`;
    },
    
    updateStats (name, value, limit) {
      switch(name) {
        case "energy":
          __energy.textContent = `${value}/${limit}`;
          break;
        case "enthusiasm":
          __enthusiasm.textContent = `${value}/${limit}`;
          break;
        default:
          console.error(`Could not update stats for ${name} in UI.`);
      }
    },
    
    // adds new objective. includes effect for addition
    assignObjective (id, text, type, parent, numOfChildren) {
      let objLi = document.createElement('li'),
          childUl;
      objLi.textContent = text;
      objLi.id = `objective--${id}`;
      if (numOfChildren > 0) {
        childUl = document.createElement('ul');
        childUl.id = `objective--${id}__children`;
        objLi.append(childUl);
      }
      if (parent) {
        let parentUl = document.getElementById(`objective--${parent}__children`);
        parentUl.appendChild(objLi);
      } else if (type === "core") {
        __coreObjectives.appendChild(objLi);
      } else if (type === "secondary") {
        __secondaryObjectives.appendChild(objLi);
      }
    },
    
    // only removes objective with selected index. includes effect for removal
    removeObjective (id) {
      let toRemove = document.getElementById(`objective--${id}`);
      toRemove.parentNode.removeChild(toRemove);
    },
    
    // adds or removes completed class on objective with selected index
    toggleObjectiveCompletion (id) {
      document.getElementById(`objective--${id}`).classList.toggle("objective--completed");
    },
    
    failObjective (id, text) {
      alert(`You have failed an objective: ${text}`);
      this.removeObjective(id);
    }
    
  };

})();