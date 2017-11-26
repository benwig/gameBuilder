# Guide for game authors

Follow these steps to write branching narratives which can be run by the gameBuilder app.

**Table of Contents**
[Directory Structure](#example-directory-structure)
[Story Metadata](#story-metadata)
[Scene Metadata](#scene-metadata)
[Creating a Basic Branching Narrative](#creating-a-basic-branching-narrative)

**Glossary**

 - **Story**:  A self-contained game narrative, comprised of one or more Scenes. 
 - **Scene**: Represents a section of the game narrative, such as a conversation, a location, or a discrete series of events. Composed of several interconnected Frames.
 - **Frame**: The smallest narrative unit. Will be represented in-game as a block of text followed by one or more Options.
 - **Option**: Each Frame must have at least one Option, which move the player on to a new frame when selected. Represented in-game as buttons.

##Setting up

###Example Directory Structure
At its most basic, the game should be structured like this, with at least one JSON file in the *scenes* directory:
```
Project
 |
 +-- stories
 |  |  
 |  |-- myGreatStory
 |      |
 |      +-- metadata.json
 |      |-- scenes
 |          |
 |          +-- myEpicScene.json
 |          \-- anotherSuperScene.json  
 |    
 +-- modules
 |  |  
 |  (scripts needed to parse your story - don't edit these)
 |    
 +-- index.html (this is where your story will be rendered)
 +-- style.css (style for index.html)
 +-- init.js (launches the story)
```

###Story Metadata
There must be a file called **metadata.json** at the top level of your Story file, as shown in the [example file directory](#example-directory-structure).
The metadata.json file should follow this template:
```
{
  "metadata": {
    "name": "The Name of my Story",
    "author": "My Name",
    "first_scene": "myEpicScene"
  }
}
```
*name* is the name of your story - it will appear in game credits.
*author* is your name - it will appear in game credits.
*first _scene* will be used to identify the Scene on which your Story should begin. This should be the file name of the Scene you want to select (minus the *.JSON* suffix).

###Scene Metadata
Each Scene has its own JSON file which defines what Frames are available in this Scene. Each Scene JSON should have a unique file name. It's best to avoid using spaces in your file name.

The Scene file should begin with some Scene metadata, following this pattern:
```
{
  "scene": {
    "map": "house.png",
    "first_frame": "room-1",
    "frames": []
  }
}
```

 - *map* is optional - it defines which map image will be displayed to the player during this Scene. This should refer to a file in the *media* directory.
 - *first_frame* is mandatory, and should contain the id of a Frame which you want to display first to the player.
 -  *frames* is an array which will hold all of the Frames for this Scene.

##Creating a basic branching narrative
###Frame Basics
At its simplest, each Frame is an object which looks like this:
```
{
  "id": "room-1",
  "text": "You are standing in a large room.",
  "options": []
}
```

 - *id* is a unique identifier for this Frame.
 - *text* will be displayed to the Player as plain text. It could be a description, a prompt, or a line of dialogue from an NPC, for example.
 - *options* is an array which will contain one or more Options, each of which is its own object.

###Option Basics
An Option is an object with this basic structure:
```
{
  "text": "Look around",
  "next": "room-1-description",
},
```
Each Option will appear to the player as a clickable button.

- *text* is the text which will be displayed on the button
- *next* is the unique identifier of another Frame.

Putting the Frame and Options together, we get something like this:
```
{
  "id": "room-1",
  "text": "You are standing in a large room. There is a door in front of you.",
  "options": [
    {
      "text": "Look around",
      "next": "room-1-description"
    },
    {
	  "text": "Go through the door",
	  "next": "room-2"
    }
  ]
}
```
###Example Scene
This example contains everything you need to build a perfectly formed Scene, albeit one with a rather short and circular narrative:
```
{
  "scene": {
    "map": "house.png",
    "first_frame": "room-1",
    "frames": [
	  {
	    "id": "room-1",
		"text": "You are standing in a large room with a door.",
        "options": [
          {
            "text": "Look around",
            "next": "room-1-description"
          },
          {
	        "text": "Go through the door",
	        "next": "room-2"
          }
        ]
      },
      {
	    "id": "room-1-description",
	    "text": "The room is empty, and is painted yellow. There's only one door.",
	    "options": [
          {
            "text": "Go through the door",
            "next": "room-2"
          }
		]
      },
      {
        "id": "room-2",
        "text": "This room is tiny, windowless and dark. There doesn't seem to be anything here.",
        "options": [
          {
            "text": "Go back",
            "next": "room-1"
          }
        ]
      }
    ]
}}
```