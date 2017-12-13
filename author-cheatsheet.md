# Author Cheatsheet

## Frames
Frames are objects with the following mandatory attributes:

- **id**: *string* - unique frame name
- **text**: *string* - text which will be displayed to player
- **options**: *array* - containing zero or more Option objects

In addition, Frames may have any combination of these optional attributes:

- **text2**: *string* - text which will be displayed to the player when they revisit the frame.
- **image**: *string* - filename (including file extension) of an image from the media/images/ directory. Image will be displayed to the user while the Frame is being viewed.
- **coordinates**: *string* - either a two numbers separated by a space ("10 20"), representing x+y coordinates, or a reference to named coordinates from the coordinates.JSON file. Will be used to update the player's location on the map.
- **info**: *string* - text which will appear, initially hidden behind an 'info' button, giving players contextual information related to the Frame.

See also the [list of attributes](#shared-attributes-for-frames--options) which can be applied to Frame or Option.

## Options
Options are objects, contained within a Frame's "options" array. Each Option will be transformed into a button which the player can select. Options have the following mandatory attributes:

- **text**: *string* - the text which appears on the button
- **next**: *string* - the id of the Frame which the player will be taken to upon selecting this Option. If you want to move the player to a new Scene, use a string with the format "scene [sceneid] [frameid]", where 'sceneid' is the scene id of a different scene, and optionally, 'frameid' is the id of the frame where the player should start the scene.

Options can have any combination of these optional attributes:

- **showif**: *array* - this option will only be displayed if all conditions are met. Conditions should be expressed as strings of three parts, e.g. `["item honey true"]` where the 1st word is the area to check, 2nd is the value to be evaluated, and 3rd is whether the value should be true or false for the option to display.
- **remove**: *bool* - if true, the option will be removed after selection.
- **oneoff**: *bool* - if true, the option will be removed after viewing, even if it's not selected
- **nextif**: *array* - an array which follows this pattern: `"nextif": ["road-3", ["choices", "took-detour"], ["item", "map"]]`.
The first string is the id of a Frame. This is followed by one or more arrays. Each states first the area to evaluate (e.g. item, money, objectiveCompleted, choices), secondly the thing in that area which should be checked to be true. If all the conditions evalute to *true*, selecting the Option will take you to the nextif Frame. Otherwise, you'll proceed to *next* as usual.
- **prefix**: *string* - text which will be displayed at the start of the next Frame visited.
- **text2**: *string* - text which will be displayed on the option the next time it's shown to the player.

## Shared Attributes for Frames & Options
Both Frames and Options can have any combination of these optional attributes. They will be processed and applied to the game state as soon as the Frame is viewed, or as soon as the Option is selected:

- **objective**: *string* - id of an objective to be assigned to the player. Multiple objectives can be assigned at once, if ids are separated by a space (e.g. "readLetter findAFriend").
- **completeObjective**: *string* - id of an objective to be marked as completed. Multiple objectives can be completed at once, if ids are separated by a space (e.g. "readLetter findAFriend").
- **failObjective**: *string* - id of an objective to be marked as failed. Objectives will only be failed if already assigned. Multiple objectives can be failed at once, if ids are separated by a space (e.g. "readLetter findAFriend").
- **getItem**: *string* - id of an item to be added to the player's inventory. Multiple items can be added, if separated by a space (e.g. "sword shield").
- **energy**: *integer* - the amount of energy to be added/deducted from stats (can be positive or negative).
- **enthusiasm**: *integer* - the amount of enthusiasm to be added/deducted from stats (can be positive or negative).
- **time**: *integer* - the number of minutes by which game time should move forwards. Will be modified up/down by as much as 50% depending on player stats (i.e. speed, enthusiasm).
- **money**: *integer* - the amount of money to be added/deducted from the user's wallet (can be positive or negative).
