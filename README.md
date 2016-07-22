# MineSweeperAngular
Minesweeper game in angularJS
Created by Yuval Haspel

To play game, go to: http://yuvalh.superbootcamp.tech/

1. To reveal game help, click on the "Minesweeper" title
2. game controls:
Click on tile - reveals the tile. If contained a mine, it's game over! 
Otherwise, it should reveal a counter indicating the number of surrounding mines immediately adjacent to the tile you just opened. 
Clicking on a 0 count tile, will open all adjacent 0 tiles and all 0 count tile immediate bordering tiles. 
Right click on tile - places a flag on the tile indicating this is where you think there might be a mine, 
rendering this tile disabled until you right click it again to remove the flag.
Double click a tile - to destroy adjacent 8 tiles. Flagged tiles will not be destroyed.
Once all flags have been placed - a red "destroy all" button appears allowing you to destroy all but the flagged tiles.
Once game is over:
- green flags means you are correct in your guess
- red flags mean you were wrong in your guess
- collission icon means this is the mine you "stepped" on
- bomb icon reveals all unflagged mines
[Reveal Cheat Sheet - right-click on emoji, then look at your dev tools console.] 

A winning or losing message appears with each game over.

3. Play and enjoy!
