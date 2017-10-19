"use strict";

console.log("init loaded");

const storyName = "roomExplorer";

// maybe a script which loads all the necessary jsons?
//const json = require([`stories/${storyName}/metadata`]);

const request = new XMLHttpRequest();
request.open("GET", "http://192.168.0.6:8081/stories/roomExplorer/metadata.json", true);

request.onload = function() {
  const metadata = JSON.parse(request.responseText);
  const scene = metadata.story.first_scene;
  console.log(scene);
};

request.send();

