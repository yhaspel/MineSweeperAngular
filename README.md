# MineSweeperAngular
Minesweeper game in AngularJS
Created by Yuval Haspel

To play game, go to: http://yuvalh.superbootcamp.tech/

For game screenshots, go to screenshots/ directory within project

*	To reveal game help, click on the "Minesweeper" title

*	Game controls:

a.	Click on tile - reveals the tile. If contained a mine, it's game over! 
Otherwise, it should reveal a counter indicating the number of surrounding mines immediately adjacent to the tile you just opened. 
Clicking on a 0 count tile, will open all adjacent 0 tiles and all 0 count tile immediate bordering tiles. 

b.	Right click on tile - places a flag on the tile indicating this is where you think there might be a mine, rendering this tile disabled until you right click it again to remove the flag.

c.	Double click a tile - to destroy adjacent 8 tiles. Flagged tiles will not be destroyed.
Once all flags have been placed - a red "destroy all" button appears allowing you to destroy all but the flagged tiles.

Once game is over:
- Green flags means you are correct in your guess
- Red flags mean you were wrong in your guess
- Collision icon means this is the mine you "stepped" on
- Bomb icon reveals all unflagged mines

[Reveal Cheat Sheet - right-click on emoji, then look at your dev tools console.] 

A winning or losing message appears with each game over.

*	Play and enjoy!

