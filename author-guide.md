# Guide for game authors

Follow these steps to write branching narratives which can be run by the gameBuilder app.

**Setting Up**
[Directory Structure](#example-directory-structure)
[Story Metadata](#story-metadata)
[Scene Metadata](#scene-metadata)
**Creating a basic narrative**
[Frame Basics](#frame-basics)
[Option Basics](#option-basics)
[Example Scene](#example-scene)
**Changing Frame text**
**Removing and changing options**

**Glossary**

 - **Story**:  A self-contained game narrative, comprised of one or more Scenes. 
 - **Scene**: Represents a section of the game narrative, such as a conversation, a location, or a discrete series of events. Composed of several interconnected Frames.
 - **Frame**: The smallest narrative unit. Will be represented in-game as a block of text followed by one or more Options.
 - **Option**: Each Frame must have at least one Option, which moves the player on to a new frame when selected. Represented in-game as buttons.

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
The rest of this guide will deal with the extra attributes which you can add to your Frames and Options to flesh out the game and enable changes to player stats, objectives, inventory etc.

##Changing Frame Text
###Prefix
To change the display text of a Frame depending on which Option led to it, include the *prefix* attribute on an Option. The prefix will be added at the start of the *next* Frame's text.
This is useful if you want to make small changes to the story text to reflect the player's responses, but without creating a whole new set of Frames.
```
    {
      "id": "oldman-greet",
      "text": "You see an old man.",
      "options": [
        {
          "text": "'Hey, old man!'",
          "next": "oldman-response",
          "prefix": "The old man looks a bit disgruntled."
        },
        {
          "text": "'Good morning, sir.'",
          "next": "oldman-response",
          "prefix": "The old man smiles and lifts his hand to acknowledge your greeting."
        },
      ],
    },
    {
      "id": "oldman-response",
      "text": "'How can I help you?' he says."
      "options": [
        ...
      ]
    }
```
If you choose the first option, the next Frame will read:
> The old man looks a bit disgruntled. 'How can I help you?' he says.

If you choose the second option, however, he next Frame will read:
> The old man smiles and lifts his hand to acknowledge your greeting. 'How can I help you?' he says.

Prefixes are temporary, so if you visited the "oldman-response" Frame via another, unprefixed Option later on, you'd just see the basic *text* of this Frame:
> 'How can I help you?' he says.

###Text2
The *text2* attribute lets you display a different text when a Frame is viewed for the second time.
This can be used to provide some variety. It's also useful if you want to include a long description the first time the player encounters something, then default to a short description for future visits.
```javascript
{
  "id": "tavern-1",
  "text": "You find yourself in a small tavern with a brick floor. It's dark. The innkeeper is stacking plates behind the wooden table which serves as a bar. The tavern is empty, apart from three old men in the far corner, hunched around a table, chewing on bread and olives and conversing quietly.",
  "text2": "You are in a small tavern. The innkeeper is resting on a stool behind the bar."
}
```
##Removing and Changing Options
###Remove
If you want an option to disappear once it has been selected, give it the *remove: true* attribute.
For example, adding *remove: true* to this option ensures you can only pick up the coin once:
```
{
  "text": "Pick up the coin",
  "next": "found-coin",
  "remove": true
}
```

###Oneoff
If you want an option to only appear once, regardless of whether or not the player selected it, use the *oneoff: true* attribute. If the player doesn't click the option the first time it's presented, they won't get the chance again. This can be combined with a Frame's *text2* attribute to good effect, as seen below:
```
{
  "id": "oldwoman",
  "text": "The old woman scrutinises you. 'I haven't seen you around here before,' she says.",
  "text2": "The old woman looks you up and down. 'Welcome back.'",
  "options": [
    {
      "text": "'I'm not from around here.'",
      "next": "oldwoman-1",
      "oneoff": true
    },
    {
      "text": "'What can you tell me about this town?'",
      "next": "town-info"
    }
  ]
}
```
The first time the player encounteres the *oldwoman* Frame, they will get two options:
> The old woman scrutinises you. 'I haven't seen you around here before,' she says.
> ['I'm not from around here.']
> ['What can you tell me about this town?']

In every other encounter, however, there will only be one option:
> The old woman looks you up and down. 'Welcome back.'
> ['What can you tell me about this town?']

###Next2
You may want an Option to lead to one Frame when clicked for the first time, then default to a different Frame thereafter. Use the *next2* attribute on the Option to specify where it should lead every time except on the first click.

```
    {
      "id": "honeyfield",
      "text": "Bees buzz softly among the flowers in the field where your beehives are kept. The hives are lined up in a row.",
      "options": [
        {
          "text": "Collect honey",
          "next": "honey-get",
          "next2": "honey-gone"
        },
        {
          "text": "Head back to the road",
          "next": "road"
        }
      ]
    }
```
In this example, if you return and try to collect more honey, you'll be taken to a different Frame (*honey-gone*) which informs you that there's no more honey left.

##Conditional Navigation
###nextif

##Inventory
###getItem

##Progressing Time
###time

##Updating Player Stats
###energy
###enthusiasm
###money

##Objectives
###assignObjective
###completeObjective
###failObjective

##Linking Scenes together