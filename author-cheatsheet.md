Frames are objects with the following mandatory attributes:

- id: [string - unique frame name]
- text [string - text which will be displayed to player]
- options [array - containing zero or more Option objects]

Frames can have any combination of these optional attributes:

- text2: [string - text which will be displayed to the player when they revisit the frame]
- 

Example:
```
frame containing everything
```

Options are objects, contained within a Frame's "options" array. Each Option will be transformed into a button which the player can select. Options have the following mandatory attributes:

- text: [string - the text which appears on the button]
- next: [string - the id of the Frame which the player will be taken to upon selecting this Option]

Options can have any combination of these optional attributes:

- 