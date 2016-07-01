/**
 * Created by Yuval on 6/21/2016.
 */

"use strict";

console.log("app starts");

var defaultRows = 5;
var defaultColumns = 6;
var defaultNumOfMines = 6;

var rows = localStorage.getItem('rows');
var columns = localStorage.getItem('columns');
var numOfMines = localStorage.getItem('numOfMines');

var revCounter = 0;
var minesweeper = angular.module("mymodule", ['ui.bootstrap', 'ngAnimate']);
var valArr = [];

var mineCode = "\uD83D\uDCA3";
var explosionCode = "\uD83D\uDCA5";
var flagCode = "\u2691";

var generateRandomMines = function () {
    var arr = [];
    while (arr.length < numOfMines) {
        var randomnumber1 = Math.floor(Math.random() * rows);
        var randomnumber2 = Math.floor(Math.random() * columns);
        var found = false;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i][0] === randomnumber1 && arr[i][1] === randomnumber2) {
                found = true;
                break
            }
        }
        if (!found) {
            arr[arr.length] = [randomnumber1, randomnumber2];
        }
        ;
    }
    return arr;
};

var mines = null;

var colorClasses = {
    0: 'pink',
    1: 'hotpink',
    2: 'blue',
    3: 'green',
    4: 'darkgreen',
    5: 'brown',
    6: 'darkred',
    7: 'darkblue',
    8: 'purple',
    9: 'red'
};

var faceUrls = {
    0: 'images/hugging-face.png',
    1: 'images/astonished-face.png',
    2: 'images/smiling-face-with-sunglasses.png',
    3: 'images/grimacing-face.png',
    4: 'images/flushed-face.png',
    5: 'images/grinning-face.png',
    6: 'images/crying-face.png',
}

var assignMines = function (i, j) {
    for (var k = 0; k < mines.length; k++) {
        if (mines[k][0] === i && mines[k][1] === j) {
            return mineCode;
        }
    }
    return 0;
}

var countNeighbors = function (i, j) {
    for (var k = i - 1; k < i + 2; k++) {
        for (var l = j - 1; l < j + 2; l++) {
            if (k < 0 || l < 0 || k >= rows || l >= columns) {
                continue;
            }
            if (i == k && j == l) {
                continue;
            }
            if (valArr[k][l]['value'] != mineCode) {
                valArr[k][l]['value']++;
            }
        }
    }
};

var assignProximityCount = function () {
    for (var i = 0; i < valArr.length; i++) {
        for (var j = 0; j < valArr[i].length; j++) {
            if (valArr[i][j]['value'] === mineCode) {
                countNeighbors(i, j);
            }

        }
    }
};


minesweeper.service('flagService', class FlagService {
    constructor() {
        this.flags = numOfMines;
        this.time = true;
        this.showDiff = false;
        this.faceUrl = null;
        this.counter = 0;
    }

    setFaceUrl(url) {
        this.faceUrl = url;
    }

    incrementCounter() {
        this.counter++;
    }

    setCounter(val) {
        this.counter = val;
    }

    stopCounter() {
        this.time = false;
    }

    startCounter() {
        this.time = true;
    }

    setFlags(flags) {
        this.flags = flags;
    }

    toggleShowDiff() {
        this.showDiff = !this.showDiff;
    }

    setShowDiff(status) {
        this.showDiff = status;
    }
});


minesweeper.run(function yuval($rootScope) {
    $rootScope.x = "ROOT!";
});

minesweeper.directive('ngRightClick', function ngRightClick($parse) {
    return function (scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function (event) {
            scope.$apply(function () {
                event.preventDefault();
                fn(scope, {$event: event});
            });
        });
    };
});

minesweeper.controller("HelpController", function HelpController($scope) {
    $scope.helpToggle = true;
    $scope.toggleHelp = function () {
        $scope.helpToggle = !$scope.helpToggle;
    };
});


minesweeper.controller('HeaderController', function ($scope, $rootScope, $timeout, flagService) {
    $scope.flagService = flagService;
    var timer;

    $scope.hoverEnter = function () {
        flagService.setFaceUrl(faceUrls[2]);
    };

    $scope.hoverLeave = function () {
        flagService.setFaceUrl(faceUrls[0]);
    };

    $scope.clickEmoji = function () {
        flagService.setFaceUrl(faceUrls[4]);
    };

    $scope.unclickEmoji = function () {
        flagService.setFaceUrl(faceUrls[3]);
    };

    $scope.setFace = function () {
        $scope.selectedImg.src = flagService.faceUrl;
    };

    $scope.selectedImg = {};

    $scope.stopCounter = function () {
        $timeout.cancel(timer);
    };


    $scope.updateCounter = function () {
        flagService.incrementCounter();
        timer = $timeout($scope.updateCounter, 1000);
    };

    $rootScope.$on("startTheClock", function () {
        flagService.startCounter();
        flagService.setCounter(0);
        $scope.updateCounter();
    });

    $scope.remoteStop = function () {
        if (!flagService.time) {
            $scope.stopCounter();
        }
    };

    $scope.printCheatsheet = function () {
        console.log('Mine Cheat Sheet:')

        for (var i = 0; i < mines.length; i++) {
            console.log(mines[i]);
        }
    };

    $scope.mines = flagService.flags;
    $scope.changeVal = function () {
        $scope.mines = flagService.flags;
    };
});

var restartGame = function () {
    rows = localStorage.getItem('rows');
    columns = localStorage.getItem('columns');
    numOfMines = localStorage.getItem('numOfMines');

    if (numOfMines > rows * columns - 1) {
        numOfMines = rows * columns - 1;
    }
    revCounter = 0;
    valArr = [];
    mines = generateRandomMines(numOfMines);

    // initiate value array
    for (var i = 0; i < rows; i++) {
        valArr[i] = [];
        for (var j = 0; j < columns; j++) {
            valArr[i][j] = {'value': assignMines(i, j), 'revealed': false};
        }
    }
    // count mine neighbors in value array
    assignProximityCount();
}


minesweeper.controller("BoardController", function BoardController($scope, $rootScope, $uibModal, $log, $sce, flagService) {
    $scope.flagService = flagService;

    // popover
    $scope.dynamicPopover = {
        templateUrl: 'myPopoverTemplate.html',
        rows: defaultRows,
        columns: defaultColumns,
        mines: defaultNumOfMines
    };


    // Tentative. consider removing once design is finalized or change according to board size
    $scope.placement = {
        options: [
            'top',
            'top-left',
            'top-right',
            'bottom',
            'bottom-left',
            'bottom-right',
            'left',
            'left-top',
            'left-bottom',
            'right',
            'right-top',
            'right-bottom'
        ],
        selected: 'top'
    };
    // end popover

    // Modal
    $scope.message = 'test';

    $scope.open = function (size) {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'myModalContent.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
                message: function () {
                    return $scope.message;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };
    // end modal section

    $scope.resetBoard = function () {

        flagService.setShowDiff(true);
        $scope.canClick = true;
        flagService.setFlags(localStorage.getItem('numOfMines'));
        $scope.board = [];
        for (var i = 0; i < rows; i++) {
            $scope.board[i] = [];
            for (var j = 0; j < columns; j++) {
                if (valArr[i][j]['value'] === mineCode) {
                    $scope.board[i][j] = {mine: true};
                }
                else {
                    $scope.board[i][j] = {mine: false};
                }
            }
        }
        flagService.setFaceUrl(faceUrls[0]);
        $rootScope.$emit("startTheClock", {});
    };

    $scope.resetBoard();

    var outOfBounds = function (i, j) {
        return (i < 0 || j < 0 || i > rows - 1 || j > columns - 1);
    };

    var checkGameWon = function () {
        return (revCounter + mines.length === rows * columns);
    };

    $scope.destroySurrounding = function (cell) {
        var revealSurrounding = function (i, j) {
            for (var k = Math.max(0, i - 1); k < Math.min(rows, i + 2); k++) {
                for (var l = Math.max(0, j - 1); l < Math.min(columns, j + 2); l++) {
                    if (i === k && j === l) {
                        continue;
                    }
                    if (valArr[k][l]['value'] !== flagCode) {
                        $scope.cellClicked($scope.board[k][l]);
                    }
                }
            }
        };

        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < columns; j++) {
                if ($scope.board[i][j] === cell) {
                    revealSurrounding(i, j);
                }
            }
        }
    };

    $scope.destroyTiles = function () {
        for (var i = 0; i < $scope.board.length; i++) {
            for (var j = 0; j < $scope.board[i].length; j++) {
                if (valArr[i][j]['value'] !== flagCode && valArr[i][j]['value'] !== mineCode) {
                    $scope.cellClicked($scope.board[i][j]);
                }
            }
        }
        for (var i = 0; i < $scope.board.length; i++) {
            for (var j = 0; j < $scope.board[i].length; j++) {
                if (valArr[i][j]['value'] !== flagCode) {
                    $scope.cellClicked($scope.board[i][j]);
                }
            }
        }
    };

    var openArea = function (i, j) {
        if (outOfBounds(i, j)) {
            return;
        }
        $scope.board[i][j].val1 = valArr[i][j]['value'];
        $scope.board[i][j].myClass = colorClasses[valArr[i][j]['value']];
        if (valArr[i][j]['value'] > 0
            && !valArr[i][j]['revealed']) {
            valArr[i][j]['revealed'] = true;
            revCounter++;
        }

        if (valArr[i][j]['value'] === 0
            && !valArr[i][j]['revealed']) {
            valArr[i][j]['revealed'] = true;
            revCounter++;
            openArea(i - 1, j);
            openArea(i + 1, j);
            openArea(i, j - 1);
            openArea(i, j + 1);

            openArea(i - 1, j - 1);
            openArea(i + 1, j + 1);
            openArea(i - 1, j + 1);
            openArea(i + 1, j - 1);
        }
        else {
            return;
        }
    };

    $scope.destroyBtn = true;


    $scope.toggle = function (state) {
        $scope.destroyBtn = state;
    };

    $scope.flagToggle = function (cell) {
        if (!($scope.canClick)) {
            return;
        }
        for (var i = 0; i < $scope.board.length; i++) {
            for (var j = 0; j < $scope.board[i].length; j++) {
                if ($scope.board[i][j] === cell) {
                    if (!valArr[i][j]['revealed']) {
                        if (cell.val1 === flagCode) {
                            cell.val1 = '';
                            flagService.setFlags(flagService.flags + 1);
                        }
                        else {
                            if (flagService.flags === 0) {
                                return;
                            }
                            cell.val1 = flagCode;
                            flagService.setFlags(flagService.flags - 1);
                        }
                    }
                }
            }
        }
        if (flagService.flags === 0) {
            $scope.toggle(false);
        }
        else {
            $scope.toggle(true);
        }

    };

    $scope.cellClicked = function (cell) {
        if (!($scope.canClick)) {
            return;
        }
        if (cell.val1 === flagCode) {
            return;
        }
        if ($scope.isCellClear(cell)) {
            for (var i = 0; i < $scope.board.length; i++) {
                for (var j = 0; j < $scope.board[i].length; j++) {
                    if ($scope.board[i][j] === cell) {
                        openArea(i, j);
                    }
                }
            }
        }
        else {
            cell.val1 = explosionCode;
            cell.myClass = colorClasses[9];
            gameOver(false);
        }
        if (checkGameWon()) {
            gameOver(true);
        }

    };

    var showAllMines = function () {
        for (var i = 0; i < $scope.board.length; i++) {
            for (var j = 0; j < $scope.board[i].length; j++) {
                if ($scope.board[i][j].val1 === explosionCode) {
                    continue;
                }
                if (valArr[i][j]['value'] === mineCode) {
                    if ($scope.board[i][j].val1 === flagCode) {
                        $scope.board[i][j].myClass = 'correctFlag';
                    }
                    else {
                        $scope.board[i][j].val1 = mineCode;
                        $scope.board[i][j].myClass = colorClasses[9];
                    }

                }
                else if ($scope.board[i][j].val1 === flagCode) {
                    $scope.board[i][j].myClass = 'incorrectFlag';
                }
                else {
                    $scope.board[i][j].val1 = valArr[i][j]['value'];
                    $scope.board[i][j].myClass = colorClasses[valArr[i][j]['value']];
                }
            }
        }
    };

    var gameOver = function (won) {
        $scope.toggle(true);
        $scope.canClick = false;
        if (won) {
            $scope.message = "Good Job! You Won!";
            $scope.open();
            showAllMines();
            flagService.setFaceUrl(faceUrls[5]);
            flagService.stopCounter();
        }
        else {
            $scope.message = "You Lose.";
            $scope.open();
            showAllMines();
            flagService.setFaceUrl(faceUrls[6]);
            flagService.stopCounter();
        }
        flagService.setShowDiff(false);
    };

    $scope.restartGame = function (diff) {
        if (diff === 'easy') {
            localStorage.setItem('rows', 5);
            localStorage.setItem('columns', 6);
            localStorage.setItem('numOfMines', 6);
        } else if (diff === 'medium') {
            localStorage.setItem('rows', 9);
            localStorage.setItem('columns', 9);
            localStorage.setItem('numOfMines', 12);
        } else if (diff === 'difficult') {
            localStorage.setItem('rows', 20);
            localStorage.setItem('columns', 20);
            localStorage.setItem('numOfMines', 40);
        }
        else {
            localStorage.setItem('rows', $scope.dynamicPopover.rows);
            localStorage.setItem('columns', $scope.dynamicPopover.columns);
            localStorage.setItem('numOfMines', $scope.dynamicPopover.mines);
        }
        restartGame();
        $scope.resetBoard();
    }

    $scope.isCellClear = function (cell) {
        if (cell.mine == true) {
            return false;
        }
        else {
            return true;
        }
    };

});


minesweeper.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, message) {
    $scope.messsge = message;
    $scope.ok = function () {
        $uibModalInstance.close($scope.message);
    };
});


var init = function () {
    //Actual reload only happens if no values are in localStorage
    if (localStorage.getItem('rows') == null
        || localStorage.getItem('columns') == null
        || localStorage.getItem('numOfMines') == null) {
        localStorage.setItem('rows', defaultRows);
        localStorage.setItem('columns', defaultColumns);
        localStorage.setItem('numOfMines', defaultNumOfMines);
        location.reload();
    }

    restartGame();
};

init();

console.log("app ends");
