## Running Scuffedcraft online:

Click here if you feel like just [trying it out](https://jamme05.github.io/Web-Scuffedcraft/) or checking the [source out on git](https://github.com/jamme05/Web-Scuffedcraft). (these are placed here in case of local copies)


# Running ScuffedCraft locally:
## Requirements:

Requires node to run the index.js within .server

If you're lazy simply start run.bat which starts a cmd window running node.

For dowloading node:
https://nodejs.org/en/download


## Once server has been started:

Go to http://localhost (or http://127.0.0.1)

Once there click on index.html or feel free to explore (and if you feel like it, try to break) my very basic file explorer!

## Once you've opened index.html:

### Controls:
* Mouse: Camera rotation
* WASD: Movement
* Shift: Down
* Space: Up
* B: Toggle boost
* Arrow up: Increase render distance
* Arrow down: Decrease render distance
* V: Switch draw mode
* R: Switch render mode

#### Draw modes:
- 0: Triangles (default)
- 1: Lines
- 2: Lines then Triangles

#### Render modes:
- 0: Printer method (square) (good performance)
- 1: Timed printer method (circle) (best performance) (default)
- 2: Timed printer method (square)
- 3: Rotating (~circle)
- 4: Dynamic (circle) (really bad performance)

#### Words:
- Printer: Left to right, up to down.
- Timed: Increases the render distance internally with a timer to decrease generation load.
- Dynamic: Increases the render distance internally and goes through each distance.