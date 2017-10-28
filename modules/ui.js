/*jshint esversion:6, devel: true, browser: true*/

    //TODO: Handlers should only contain code for responding to user interaction (i.e. a click on an option)
//TODO: Handlers should use info about the click target to deduce parameters needed, eg data-next
    //TODO: View object should contain methods that affect the DOM
//TODO: Use event bubbling to handle clicks on options, so that there's only one event listener
    //TODO: Parse module should have as public the current Frame data, to be used by the View object
    //TODO: Remove 'processFrame' method from Parse - DONE
    //TODO: rename Parse to Scene
    //TODO: Make Parse.proceed its own handler method on Handlers
//TODO: Update id/classes, method names, variable names to match each other and be more readable
//TODO: Update file names to match objects

const Handlers = (function () {
  
  "use strict";
  
  return {
    
    proceedTo(next) {
      Scene.proceedTo(next);
    }
    
  };
  
})();


const View = (function () {
  
  "use strict";
  
  const optlist = document.querySelector(".options");
  
  const clearOptions = function () {
    while (optlist.lastChild) {
        optlist.removeChild(optlist.lastChild);
      }
  };
  
  return {
    
    setPrompt() {
      document.querySelector(".storyText").textContent = Scene.frameData.text;
    },
    
    addOptions() {
      
      let i;
      
      clearOptions();
      
      try {
        for (i = 0; i < Scene.frameData.options.length; i += 1) {
          let opt = document.createElement('li');
          let button = document.createElement('button');
          button.dataset.next = Scene.frameData.options[i].next;
          button.addEventListener("click", Handlers.proceedTo.bind(null, Scene.frameData.options[i].next));
          button.textContent = Scene.frameData.options[i].text;
          opt.appendChild(button);
          optlist.appendChild(opt);
        }
      } catch(TypeError) {
        console.error('It looks like frameData is currently empty.');
      }
    }
    
  };
  
  
})();