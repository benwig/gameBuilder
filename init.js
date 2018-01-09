/*jshint esversion:6, devel: true, browser: true*/

{
  
  const storyName = "athensTest";
  const currentOrigin = window.location.origin;

  const sendNewRequest = function (path, callback) {
    const req = new XMLHttpRequest();
    req.onerror = function () {
      console.error(`XMLHttpRequest failed, could not reach ${path}.`);
    };
    req.onload = function () {
      if (this.status == 200) {
        callback(this.responseText);
      } else {
        console.log("No file of that type found for this Story.");
      }
    };
    req.open("GET", path, true);
    req.send();
  };
  
  const filesToLoad = [
    {
      path: `${currentOrigin}/stories/${storyName}/objectives.json`,
      callback: function (objectivesJSON) {
        Objectives.init(JSON.parse(objectivesJSON));
      }
    },
    {
      path: `${currentOrigin}/stories/${storyName}/items.json`,
      callback: function (itemsJSON) {
        Inventory.init(JSON.parse(itemsJSON));
      }
    },
    {
      path: `${currentOrigin}/stories/${storyName}/choices.json`,
      callback: function (choicesJSON) {
        Player.setupChoices(JSON.parse(choicesJSON));
      }
    },
    {
      path: `${currentOrigin}/stories/${storyName}/coordinates.json`,
      callback: function (coordinatesJSON) {
        Scenemap.init(JSON.parse(coordinatesJSON));
      }
    },
    {
      path: `${currentOrigin}/stories/${storyName}/metadata.json`,
      callback: function (metadataJSON) {
        const metadata = JSON.parse(metadataJSON).metadata;
        const firstScene = metadata.first_scene;
        const story = Storyrunner.newStory(currentOrigin, storyName, metadata);
        story.load(firstScene, "scene");
        Handlers.init(story);
        Time.init(metadata.startTime);
        Player.init(metadata);
      }
    }
  ];
  
  for (let i = 0; i < filesToLoad.length; i += 1) {
    sendNewRequest(filesToLoad[i].path, filesToLoad[i].callback);
  }

}
