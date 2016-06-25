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
;
var numOfMines = localStorage.getItem('numOfMines');
;


var revCounter = 0;
var mymod = angular.module("mymodule", ['ui.bootstrap']);
var valArr = [];

var generateRandomMines = function (numOfMines) {
    var arr = []
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

var mines = generateRandomMines(numOfMines);


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
}

var assignMines = function (i, j) {
    for (var k = 0; k < mines.length; k++) {
        if (mines[k][0] === i && mines[k][1] === j) {
            return "\uD83D\uDCA3";
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
            if (valArr[k][l]['value'] != "\uD83D\uDCA3") {
                valArr[k][l]['value']++;
            }
        }
    }
};

var assignProximityCount = function () {
    for (var i = 0; i < valArr.length; i++) {
        for (var j = 0; j < valArr[i].length; j++) {
            if (valArr[i][j]['value'] === "\uD83D\uDCA3") {
                countNeighbors(i, j);
            }

        }
    }
};

mymod.service('flagService', function () {
    var flags = numOfMines;
    var time = true;

    var setFlagCount = function (flagCount) {
        flags = flagCount;
    };

    var getFlagCount = function () {
        return flags;
    };

    var stopCounter = function () {
        time = false;
    };

    var getCounter = function () {
        return time;
    };

    return {
        setFlagCount: setFlagCount,
        getFlagCounts: getFlagCount,
        stopCounter: stopCounter,
        getCounter: getCounter
    };

});


mymod.run(function yuval($rootScope) {
    $rootScope.x = "ROOT!";
});

mymod.directive('ngRightClick', function ngRightClick($parse) {
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

mymod.controller('HeaderController', function ($scope, $timeout, flagService) {
    var timer;
    $scope.counter = 0;
    $scope.stopCounter = function () {
        $timeout.cancel(timer);
    };
    $scope.updateCounter = function () {
        $scope.counter++;
        timer = $timeout($scope.updateCounter, 1000);
    };
    $scope.updateCounter();

    $scope.remoteStop = function () {
        if (!flagService.getCounter()) {
            $scope.stopCounter();
        }
    };

    $scope.mines = flagService.getFlagCounts();
    $scope.changeVal = function () {
        $scope.mines = flagService.getFlagCounts();
    };
});


mymod.controller("BoardController", function BoardController($scope, $uibModal, $log, flagService) {
    // Modal
    $scope.items = ['Zehava Galon', 'Naftali Bennett', 'Ada Yonat'];
    $scope.message = 'test';

    $scope.open = function (size) {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'myModalContent.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
                items: function () {
                    return $scope.items;
                },
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

    var oldSelected = $scope.selected;
    $scope.getSelected = function () {
        if (oldSelected !== $scope.selected) {
            console.log('selected: ', $scope.selected);
            if ($scope.selected === $scope.items[0]) {
                $scope.restartGame('easy');
            }
            if ($scope.selected === $scope.items[1]) {
                $scope.restartGame('medium');
            }
            if ($scope.selected === $scope.items[2]) {
                $scope.restartGame('difficult');
            }
        }
    };

    $scope.canClick = true;
    $scope.board = [];
    for (var i = 0; i < rows; i++) {
        $scope.board[i] = [];
        for (var j = 0; j < columns; j++) {
            if (valArr[i][j]['value'] === "\uD83D\uDCA3") {
                $scope.board[i][j] = {mine: true};
            }
            else {
                $scope.board[i][j] = {mine: false};
            }
        }
    }
    var outOfBounds = function (i, j) {
        return (i < 0 || j < 0 || i > rows - 1 || j > columns - 1);
    };

    var checkGameWon = function () {
        return (revCounter + mines.length === rows * columns);
    };

    $scope.destroyTiles = function () {
        for (var i = 0; i < $scope.board.length; i++) {
            for (var j = 0; j < $scope.board[i].length; j++) {
                if (valArr[i][j]['value'] !== '\u2691' && valArr[i][j]['value'] !== '\uD83D\uDCA3') {
                    $scope.cellClicked($scope.board[i][j]);
                }
            }
        }
        for (var i = 0; i < $scope.board.length; i++) {
            for (var j = 0; j < $scope.board[i].length; j++) {
                if (valArr[i][j]['value'] !== '\u2691') {
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
        for (var i = 0; i < $scope.board.length; i++) {
            for (var j = 0; j < $scope.board[i].length; j++) {
                if ($scope.board[i][j] === cell) {
                    if (!valArr[i][j]['revealed']) {
                        if (cell.val1 === "\u2691") {
                            cell.val1 = '';
                            flagService.setFlagCount(flagService.getFlagCounts() + 1);
                        }
                        else {
                            if (flagService.getFlagCounts() === 0) {
                                return;
                            }
                            cell.val1 = "\u2691";
                            flagService.setFlagCount(flagService.getFlagCounts() - 1);
                        }
                    }
                }
            }
        }
        console.log('flags: ',flagService.getFlagCounts(),' | mines: ',numOfMines);
        if (flagService.getFlagCounts() === 0){
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
        if (cell.val1 === "\u2691") {
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
            cell.val1 = "\uD83D\uDCA3";
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
                if (valArr[i][j]['value'] === "\uD83D\uDCA3") {
                    $scope.board[i][j].val1 = "\uD83D\uDCA3";
                    $scope.board[i][j].myClass = colorClasses[9];
                }
            }
        }
    };

    var gameOver = function (won) {
        $scope.canClick = false;
        if (won) {
            $scope.message = "Good Job! You Won!";
            $scope.open();
            flagService.stopCounter();
        }
        else {
            $scope.message = "You Lost.";
            $scope.open();
            showAllMines();
            flagService.stopCounter();
        }
    }

    $scope.restartGame = function (diff) {
        if (diff === 'easy') {
            localStorage.setItem('rows', 5);
            localStorage.setItem('columns', 6);
            localStorage.setItem('numOfMines', 6);
        }
        if (diff === 'medium') {
            localStorage.setItem('rows', 9);
            localStorage.setItem('columns', 9);
            localStorage.setItem('numOfMines', 12);
        }
        if (diff === 'difficult') {
            localStorage.setItem('rows', 20);
            localStorage.setItem('columns', 20);
            localStorage.setItem('numOfMines', 40);
        }
        location.reload();
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


mymod.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, items, message) {
    $scope.items = items;
    $scope.messsge = message;
    $scope.selected = {
        item: $scope.items[0]
    };

    $scope.ok = function () {
        $uibModalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});


var init = function () {
    if (localStorage.getItem('rows') == null) {
        localStorage.setItem('rows', defaultRows);
        location.reload();
    }
    if (localStorage.getItem('columns') == null) {
        localStorage.setItem('columns', defaultColumns);
        location.reload();
    }
    if (localStorage.getItem('numOfMines') == null) {
        localStorage.setItem('numOfMines', defaultNumOfMines);
        location.reload();
    }
    // mine cheatsheet
    for (var i = 0; i < mines.length; i++) {
        console.log(mines[i]);
    }

    // initiate value array
    for (var i = 0; i < rows; i++) {
        valArr[i] = [];
        for (var j = 0; j < columns; j++) {
            valArr[i][j] = {'value': assignMines(i, j), 'revealed': false};
        }
    }
    // count mine neighbors in value array
    assignProximityCount();

};

init();

console.log("app ends");
