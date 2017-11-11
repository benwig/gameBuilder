/*jshint esversion:6, devel: true, browser: true*/

{

  const storyName = "athensTest";
  const currentOrigin = window.location.origin;
  const request1 = new XMLHttpRequest();
  const request2 = new XMLHttpRequest();
  
  const loadObjectives = function (objectivesJSON) {
    Objectives.init(JSON.parse(objectivesJSON));
  };
  
  const loadStory = function (metadataJSON) {
    const metadata = JSON.parse(metadataJSON);
    const firstScene = metadata.story.first_scene;
    Scene.init(`${currentOrigin}/stories/${storyName}/scenes/${firstScene}`);
  };
  
  request1.onload = function() {
    if (this.status == 200) {
      loadObjectives(this.responseText);
    } else {
      console.log("No objectives found for this Story.");
    }
  };
  
  request1.onerror = function() {
    console.error("XMLHttpRequest failed, could not reach Objectives.");
  };

  request2.onload = function() {
    if (this.status == 200) {
      loadStory(this.responseText);
    } else {
      console.error(`Retrieved response, but status was not 200. Status text: ${this.statusText}`);
    }
  };
  
  request2.onerror = function() {
    console.error("XMLHttpRequest failed, could not reach Story.");
  };

  request1.open("GET", `${currentOrigin}/stories/${storyName}/objectives.json`, true);
  request1.send();
  
  request2.open("GET", `${currentOrigin}/stories/${storyName}/metadata.json`, true);
  request2.send();

}
