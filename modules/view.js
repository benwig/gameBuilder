/*jshint esversion:6, devel: true, browser: true*/

const View = (function () {
  
  "use strict";
  
  const $hubframe = $('#hubframe');
  const $mainframe = $('#mainframe');
  const $frameText = $('#frameText');
  const $optionList = $('#options');
  const $continue = $('#continue');
  const __itemList = document.querySelector('#inventory');
  const __iteminfo = document.getElementById("iteminfo");
  const __wallet = document.querySelector('#wallet');
  const __clock = document.querySelector('#clock');
  const __coreObjectives = document.querySelector('#objectives-core');
  const __secondaryObjectives = document.querySelector('#objectives-secondary');
  const __energy = document.querySelector('#energy');
  const __enthusiasm = document.querySelector('#enthusiasm');
  const __mapSpace = document.querySelector('#map');
  const $imageSpace = $('#image');
  const __storyinfo = document.querySelector('#storyinfo');
  
  let __textblocks = [];
  
  //compile handlebars templates
  const __hubTemplate = Handlebars.compile(document.getElementById("hub-template").innerHTML);
  
  const __frameTemplate = Handlebars.compile(document.getElementById("frameText-template").innerHTML);
  
  const __optionsTemplate = Handlebars.compile(document.getElementById("options-template").innerHTML);
  
  const __continueTemplate = Handlebars.compile(document.getElementById("continue-template").innerHTML);
  
  const __iteminfoTemplate = Handlebars.compile(document.getElementById("iteminfo-template").innerHTML);
  
  const __storyinfoTemplate = Handlebars.compile(document.getElementById("storyinfo-template").innerHTML);
  
  return {

    setFrameText (prefix, maintext, suffix) {
      let context;
      
      //TODO: check whether text is supposed to be split into multiple screens (via //)
      __textblocks = maintext.split("//");
      if (__textblocks.length > 1) {
        //TODO: display the prefix (optional) and the first block of text
        console.log(__textblocks);
        context = {prefix: prefix, maintext: __textblocks.shift()};
        //TODO: reveal a 'continue' button
        $continue.removeClass('js-hidden');
        //TODO: hide the 'options' buttons
        $optionList.addClass('js-hidden');
      } else {
        // else display prefix + text + suffix
        context = {prefix: prefix, maintext: maintext, suffix: suffix};
      }
      
      $frameText.html(__frameTemplate(context));
      // hide hubframe and reveal mainframe
      $mainframe.removeClass('js-hidden');
      $hubframe.addClass('js-hidden');
      
    },
    
    showNextTextblock () {
      //TODO: if this is the final textblock, hide continue button and reveal options
      if (__textblocks.length === 1) {
        $continue.addClass('js-hidden');
        $optionList.removeClass('js-hidden');
      }
      //TODO: display the next block of text from the array
      const context = {maintext: __textblocks.shift()};
      $frameText.html(__frameTemplate(context));
    },
    
    // render the options, or a simple 'continue' button if only one option & 'continue' is set to true
    addOptions (options) {
      const context = {
        "options": options
      };
      $optionList.html(__optionsTemplate(context));
    },
    
    renderStoryInfo (infotext, read) {
      const context = {
        infotext: infotext,
        read: read
      };
      __storyinfo.innerHTML = __storyinfoTemplate(context);
    },
    
    toggleInfo () {
      $('#infobox').toggleClass('js-hidden');
      $('#infobutton')
        .removeClass('infobutton--unread')
        .addClass('infobutton--read');
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
      $imageSpace.css('background-image', `url("media/images/${filename}")`);
      $imageSpace.removeClass('js-hidden');
    },
    
    hideImage () {
      $imageSpace.addClass('js-hidden');
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
    },
    
    // hides mainframe and reveals hubframe with icons and bg map
    renderHub (icons, map, startZone) {
      // for each icon, break coordinates into x and y integers
      icons.forEach(function (icon) {
        let co = icon.coordinates.split(" ");
        icon.x = co[0];
        icon.y = co[1];
      });
      // build context for handlebars template
      const context = {
        icons: icons
      };
      $hubframe.html(__hubTemplate(context));
      //set hubframe map
      if (map) {
        $hubframe.css('background-image', `url("media/maps/${map}")`);
      } else {
        $hubframe.css('background-image', 'none');
      }
      // hide mainframe and reveal hubframe
      $mainframe.addClass('js-hidden');
      $hubframe.removeClass('js-hidden');
    }
    
  };

})();