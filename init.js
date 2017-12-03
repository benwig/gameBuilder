/*jshint esversion:6, devel: true, browser: true*/

{

  const storyName = "athensTest";
  const currentOrigin = window.location.origin;
  const objectivesRequest = new XMLHttpRequest();
  const itemsRequest = new XMLHttpRequest();
  const choicesRequest = new XMLHttpRequest();
  const storyRequest = new XMLHttpRequest();
  
  const loadObjectives = function (objectivesJSON) {
    Objectives.init(JSON.parse(objectivesJSON));
  };
  
  const loadItems = function (itemsJSON) {
    Inventory.init(JSON.parse(itemsJSON));
  };
  
  const loadChoices = function (choicesJSON) {
    Player.setupChoices(JSON.parse(choicesJSON));
  };
  
  const loadStory = function (metadataJSON) {
    const metadata = JSON.parse(metadataJSON);
    const firstScene = metadata.metadata.first_scene;
    Scene.init(currentOrigin, storyName, firstScene);
  };
  
  objectivesRequest.onload = function () {
    if (this.status == 200) {
      loadObjectives(this.responseText);
    } else {
      console.log("No objectives found for this Story.");
    }
  };
  
  objectivesRequest.onerror = function () {
    console.error("XMLHttpRequest failed, could not reach Objectives.");
  };
  
  itemsRequest.onload = function () {
    if (this.status == 200) {
      loadItems(this.responseText);
    } else {
      console.log("No items found for this Story.");
    }
  };
  
  itemsRequest.onerror = function () {
    console.error("XMLHttpRequest failed, could not reach Items.");
  };
  
  choicesRequest.onload = function () {
    if (this.status == 200) {
      loadChoices(this.responseText);
    } else {
      console.log("No choices found for this Story.");
    }
  };
  
  choicesRequest.onerror = function() {
    console.error("XMLHttpRequest failed, could not reach Choices.");
  };

  storyRequest.onload = function () {
    if (this.status == 200) {
      loadStory(this.responseText);
    } else {
      console.error(`Retrieved response, but status was not 200. Status text: ${this.statusText}`);
    }
  };
  
  storyRequest.onerror = function () {
    console.error("XMLHttpRequest failed, could not reach Story.");
  };

  objectivesRequest.open("GET", `${currentOrigin}/stories/${storyName}/objectives.json`, true);
  objectivesRequest.send();
  
  itemsRequest.open("GET", `${currentOrigin}/stories/${storyName}/items.json`, true);
  itemsRequest.send();
  
  choicesRequest.open("GET", `${currentOrigin}/stories/${storyName}/choices.json`, true);
  choicesRequest.send();
  
  storyRequest.open("GET", `${currentOrigin}/stories/${storyName}/metadata.json`, true);
  storyRequest.send();

}
