"use strict";

console.log("start loading init");
  

{

  const storyName = "roomExplorer";
  const currentOrigin = window.location.origin;

  const request = new XMLHttpRequest();
  request.open("GET", `${currentOrigin}/stories/${storyName}/metadata.json`, true);

  request.onload = function() {
    if (request.status == 200) {
      const metadata = JSON.parse(request.responseText);
      const firstScene = metadata.story.first_scene;
      Parse.init(`${currentOrigin}/stories/${storyName}/scenes/${firstScene}`);
    } else {
      console.error(`Retrieved response, but status was not 200. Status text: ${request.statusText}`);
    }
  };

  request.send();

}
