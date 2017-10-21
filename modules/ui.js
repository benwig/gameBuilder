/*jshint esversion:6, devel: true, browser: true*/

console.log("start loading ui module");

const Ui = (function () {
  
  "use strict";
  
  const prompt = document.querySelector(".storyText"),
        optlist = document.querySelector(".options");
  
  return {
    
    addOption: function(text, next) {
      let opt = document.createElement('li');
      let button = document.createElement('button');
      button.dataset.next = next;
      button.addEventListener("click", Parse.proceed.bind(null, next));
      button.textContent = text;
      opt.appendChild(button);
      optlist.appendChild(opt);
    },
    
    clearOptions: function() {
      while (optlist.lastChild) {
        optlist.removeChild(optlist.lastChild);
      }
    },
    
    setPrompt: function(text) {
      prompt.textContent = text;
    }
    
  };
  
  
})();