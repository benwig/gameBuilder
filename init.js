/*jshint esversion:6, devel: true, browser: true*/

{

  const storyName = "athensTest";
  const currentOrigin = window.location.origin;
  const request = new XMLHttpRequest();
  
  const loadStory = function (metadataJSON) {
    const metadata = JSON.parse(metadataJSON);
    const firstScene = metadata.story.first_scene;
    Scene.init(`${currentOrigin}/stories/${storyName}/scenes/${firstScene}`);
  };

  request.onload = function() {
    if (request.status == 200) {
      loadStory(request.responseText);
    } else {
      console.error(`Retrieved response, but status was not 200. Status text: ${request.statusText}`);
    }
  };
  
  request.onerror = function() {
    console.error("XMLHttpRequest failed, could not reach Story.");
  };

  request.open("GET", `${currentOrigin}/stories/${storyName}/metadata.json`, true);
  request.send();

}
