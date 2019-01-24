var Battleship = artifacts.require("./Battleship.sol");

contract('Battleship', function(accounts) {
    it("create session", function() {
        var address = accounts[0]
        return Battleship.deployed().then(function(instance) {
            battleship = instance;
            return battleship.createSession(address);
        }).then(function () {
            return battleship.getSessionLength(address)
        }).then(function(actual) {
            assert.equal(actual, 1, "session length");
        }).then(function() {
            return battleship.getSession(address, 0)
        }).then(function(res) {
            var open = res[0];
            var player_one = res[1].toString();
            var player_two = res[2].toString();
            var whos_turn = res[3];
            var in_progress = res[4];

            assert.equal(open, true, "open");
            assert.equal(player_one, accounts[0], "player_one");
            assert.equal(player_two, 0, "player_two");
            assert.equal(whos_turn, 0, "whos_turn");
            assert.equal(in_progress, false, "in_progress");
        });
    });

    it ("get initilized board", function () {
        var address = accounts[0]
        return Battleship.deployed().then(function(instance) {
            battleship = instance;
            return battleship.getBoard(address, 0, 1);
        }).then(function(board) {
            assert.equal(board[0][0].toNumber(), 0);
        })
    });

    it("display board", function () {
        var address = accounts[0]
        return Battleship.deployed().then(function(instance) {
            battleship = instance;
            return battleship.getBoard(address, 0, 1);
        }).then(function(board) {
            console.log();
            displayBoard(board);
        })
    });

    function displayBoard(board) {
        for (i = 0; i < board.length; i++) {
            console.log();
            for (g = 0; g < board[i].length; g++) {
                process.stdout.write(board[i][g].toNumber().toString() + " ");
            }
        }
    }

    it("place & get ship", function () {
        var add = accounts[0]
        return Battleship.deployed().then(function(instance) {
            battleship = instance;
            return battleship.placeShip(add, 0, 1, 2, "a", 1, "a", 2);
        }).then(function() {
            return battleship.getShip(add, 0, 1, 2);
        }).then(function(res) {
                var typeId = res[0].toNumber();
                var start_row = res[1].toString();
                var start_column = res[2].toNumber(); 
                var end_row = res[3].toString();
                var end_column = res[4].toNumber();
                var sunk = res[5];
                var hit = res[6];
                assert.equal(typeId, 2, "typeId");
                assert.equal(start_row, "a", "start_row");
                assert.equal(start_column, 1, "start_column");
                assert.equal(end_row, "a", "end_row");
                assert.equal(end_column, 2, "end_column");
                assert.equal(sunk, false, "sunk");
                assert.equal(hit, 0, "hit");
        });
    });

    it ("get board with ship", function () {
        var address = accounts[0]
        return Battleship.deployed().then(function(instance) {
            battleship = instance;
            return battleship.getBoard(address, 0, 1);
        }).then(function(board) {
            console.log();
            displayBoard(board);
            assert.equal(board[0][0].toNumber(), 2);
            assert.equal(board[0][1].toNumber(), 2);
        })
    });

    it ("place all ships", function () {
        var add = accounts[0]
        return Battleship.deployed().then(function(instance) {
            battleship = instance;
            return battleship.placeShip(add, 0, 1, 1, "c", 3, "g", 3);
        }).then(function() {
            return battleship.placeShip(add, 0, 1, 3, "g", 7, "i", 7);
        }).then(function() {
            return battleship.placeShip(add, 0, 1, 4, "d", 6, "d", 9);
        }).then(function() {
            return battleship.placeShip(add, 0, 1, 5, "b", 5, "b", 7);
        }).then(function() {
            return battleship.getBoard(add, 0, 1);
        }).then(function(board) {
            displayBoard(board);
        });   
    });

    it("verify all ships locations", function () {
        var add = accounts[0]
        return Battleship.deployed().then(function(instance) {
            battleship = instance;
            return battleship.getBoard(add, 0, 1)
        }).then(function(res) {
            board = res
            return battleship.getShip(add, 0, 1, 1);
        }).then(function(res) {
            var typeId = res[0].toNumber();
            var start_row = res[1].toString();
            var start_column = res[2].toNumber(); 
            var end_row = res[3].toString();
            var end_column = res[4].toNumber();
            var sunk = res[5];
            var hit = res[6];
            assert.equal(typeId, 1, "typeId");
            assert.equal(start_row, "c", "start_row");
            assert.equal(start_column, 3, "start_column");
            assert.equal(end_row, "g", "end_row");
            assert.equal(end_column, 3, "end_column");
            assert.equal(sunk, false, "sunk");
            assert.equal(hit, 0, "hit");
            
            assert.equal(board[2][2].toNumber(), 1);
            assert.equal(board[3][2].toNumber(), 1);
            assert.equal(board[4][2].toNumber(), 1);
            assert.equal(board[5][2].toNumber(), 1);
            assert.equal(board[6][2].toNumber(), 1);
        }).then(function() {
            return battleship.getShip(add, 0, 1, 2);
        }).then(function(res) {
            var typeId = res[0].toNumber();
            var start_row = res[1].toString();
            var start_column = res[2].toNumber(); 
            var end_row = res[3].toString();
            var end_column = res[4].toNumber();
            var sunk = res[5];
            var hit = res[6];
            assert.equal(typeId, 2, "typeId");
            assert.equal(start_row, "a", "start_row");
            assert.equal(start_column, 1, "start_column");
            assert.equal(end_row, "a", "end_row");
            assert.equal(end_column, 2, "end_column");
            assert.equal(sunk, false, "sunk");
            assert.equal(hit, 0, "hit");

            assert.equal(board[0][0].toNumber(), 2);
            assert.equal(board[0][1].toNumber(), 2);
        }).then(function() {
            return battleship.getShip(add, 0, 1, 3);
        }).then(function(res) {
            var typeId = res[0].toNumber();
            var start_row = res[1].toString();
            var start_column = res[2].toNumber(); 
            var end_row = res[3].toString();
            var end_column = res[4].toNumber();
            var sunk = res[5];
            var hit = res[6];
            assert.equal(typeId, 3, "typeId");
            assert.equal(start_row, "g", "start_row");
            assert.equal(start_column, 7, "start_column");
            assert.equal(end_row, "i", "end_row");
            assert.equal(end_column, 7, "end_column");
            assert.equal(sunk, false, "sunk");
            assert.equal(hit, 0, "hit");

            assert.equal(board[6][6].toNumber(), 3);
            assert.equal(board[7][6].toNumber(), 3);
            assert.equal(board[8][6].toNumber(), 3);
        }).then(function() {
            return battleship.getShip(add, 0, 1, 4);
        }).then(function(res) {
            var typeId = res[0].toNumber();
            var start_row = res[1].toString();
            var start_column = res[2].toNumber(); 
            var end_row = res[3].toString();
            var end_column = res[4].toNumber();
            var sunk = res[5];
            var hit = res[6];
            assert.equal(typeId, 4, "typeId");
            assert.equal(start_row, "d", "start_row");
            assert.equal(start_column, 6, "start_column");
            assert.equal(end_row, "d", "end_row");
            assert.equal(end_column, 9, "end_column");
            assert.equal(sunk, false, "sunk");
            assert.equal(hit, 0, "hit");

            assert.equal(board[3][5].toNumber(), 4);
            assert.equal(board[3][6].toNumber(), 4);
            assert.equal(board[3][7].toNumber(), 4);
            assert.equal(board[3][8].toNumber(), 4);
        }).then(function() {
            return battleship.getShip(add, 0, 1, 5);
        }).then(function(res) {
            var typeId = res[0].toNumber();
            var start_row = res[1].toString();
            var start_column = res[2].toNumber(); 
            var end_row = res[3].toString();
            var end_column = res[4].toNumber();
            var sunk = res[5];
            var hit = res[6];
            assert.equal(typeId, 5, "typeId");
            assert.equal(start_row, "b", "start_row");
            assert.equal(start_column, 5, "start_column");
            assert.equal(end_row, "b", "end_row");
            assert.equal(end_column, 7, "end_column");
            assert.equal(sunk, false, "sunk");
            assert.equal(hit, 0, "hit");

            assert.equal(board[1][4].toNumber(), 5);
            assert.equal(board[1][5].toNumber(), 5);
            assert.equal(board[1][6].toNumber(), 5);
        });
    });

    it("different user and session", function() {
        var prev_address = accounts[0]
        var address = 648
        return Battleship.deployed().then(function(instance) {
            battleship = instance;
            return battleship.createSession(address);
        }).then(function () {
            return battleship.getSessionLength(address)
        }).then(function(actual) {
            assert.equal(actual, 1, "session length");
            return battleship.createSession(address);
        }).then(function () {
            return battleship.getSessionLength(address)
        }).then(function(actual) {
            assert.equal(actual, 2, "session length");
            return battleship.placeShip(address, 1, 1, 5, "c", 3, "c", 5)
        }).then(function() {
            return battleship.getBoard(address, 1, 1);
        }).then(function(res) {
            board = res
            console.log();
            displayBoard(board);
        }).then(function () {
            return battleship.getShip(address, 1, 1, 5)
        }).then(function(res) {
            var start_row = res[1].toString();
            var start_column = res[2].toNumber(); 
            var end_row = res[3].toString();
            var end_column = res[4].toNumber();

            assert.equal(start_row, "c", "start_row");
            assert.equal(start_column, 3, "start_column");
            assert.equal(end_row, "c", "end_row");
            assert.equal(end_column, 5, "end_column");

            assert.equal(board[2][2].toNumber(), 5);
            assert.equal(board[2][3].toNumber(), 5);
            assert.equal(board[2][4].toNumber(), 5);

        }).then(function() {
            return battleship.getBoard(address, 0, 1);
        }).then(function(res) {
            // check the first session for 0's in the same place
            board = res
            console.log();
            displayBoard(board);
            assert.equal(board[2][2].toNumber(), 0);
            assert.equal(board[2][3].toNumber(), 0);
            assert.equal(board[2][4].toNumber(), 0);
        }).then(function() {
            return battleship.getBoard(prev_address, 0, 1);
        }).then(function(res) {
            // check the prev address board
            board = res
            console.log();
            displayBoard(board);
            assert.equal(board[2][2].toNumber(), 1);
            assert.equal(board[2][3].toNumber(), 0);
            assert.equal(board[2][4].toNumber(), 0);
        });
    });

    it ("get open games", function () {
        var expected_addresses = [accounts[0], 648, 648]
        var expected_sessions = [0, 0, 1]

        return Battleship.deployed().then(function(instance) {
            battleship = instance;
            return battleship.getOpenGameLength()
        }).then(function(res) {
            length = res.toNumber();
            for (i=0;i<length;i++) {
                return battleship.getOpenGame(i).then(function(res) {
                    var open_address = res[0].toString();
                    var session = res[1].toNumber();

                    assert.equal(open_address, expected_addresses[i])
                    assert.equal(session, expected_sessions[i])
                })
            }
        })
    });

    it("join open game", function () {
        var address = accounts[1]
        return Battleship.deployed().then(function(instance) {
            battleship = instance;
            return battleship.getOpenGame(0)
        }).then(function (res) {
            open_address = res[0].toString();
            session = res[1].toNumber();
            return battleship.joinGame(open_address, session, address)
        }).then(function() {
            return battleship.getSession(open_address, session)
        }).then(function(res) {
            var open = res[0];
            var player_one = res[1].toString();
            var player_two = res[2].toString();
            var whos_turn = res[3];
            var in_progress = res[4];

            assert.equal(open, false, "open");
            assert.equal(player_one, accounts[0], "player_one");
            assert.equal(player_two, accounts[1], "player_two");
            assert.equal(whos_turn, accounts[0], "whos_turn");
            assert.equal(in_progress, true, "in_progress"); 
        })

    });

    it ("place all ships for player two", function () {
        var add = accounts[0]
        return Battleship.deployed().then(function(instance) {
            battleship = instance;
            return battleship.placeShip(add, 0, 2, 1, "g", 5, "g", 9);
        }).then(function() {
            return battleship.placeShip(add, 0, 2, 3, "b", 2, "d", 2);
        }).then(function() {
            return battleship.placeShip(add, 0, 2, 4, "a", 10, "d", 10);
        }).then(function() {
            return battleship.placeShip(add, 0, 2, 5, "c", 5, "e", 5);
        }).then(function() {
            return battleship.placeShip(add, 0, 2, 2, "j", 2, "j", 3);
        }).then(function() {
            return battleship.getBoard(add, 0, 1);
        }).then(function(board) {
            displayBoard(board);
        });   
    });

    it("FIRE THE MISSLES", function () {
        player_one = accounts[0];
        player_two = accounts[1];
        return Battleship.deployed().then(function(instance) {
            battleship = instance;
            return battleship.getBoard(player_one, 0, 1)
        }).then(function (res) {
            console.log();
            console.log("Player One Board");
            displayBoard(res);
            return battleship.getBoard(player_one, 0, 2)
        }).then(function (res) {
            console.log();
            console.log();
            console.log("Player Two Board");
            displayBoard(res);
            console.log();
            console.log();
            console.log("FIRE LE MISSILES!!!")
            console.log()
        }).then(function() {
            return battleship.fireMissle(player_one, 0, 2, "b", 6, {from: player_one});
        }).then(function () {
            return battleship.getBoard(player_one, 0, 2)
        }).then(function (res) {
            assert.equal(res[1][5].toNumber(), 9)
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 1, "a", 1, {from: player_two});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 2, "a", 10, {from: player_one});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 1, "a", 2, {from: player_two});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 2, "b", 10, {from: player_one});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 1, "c", 5, {from: player_two});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 2, "c", 10, {from: player_one});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 1, "g", 7, {from: player_two});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 2, "d", 10, {from: player_one});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 1, "e", 3, {from: player_two});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 2, "b", 2, {from: player_one});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 1, "i", 10, {from: player_two});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 2, "f", 2, {from: player_one});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 1, "i", 1, {from: player_two});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 2, "e", 9, {from: player_one});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 1, "h", 4, {from: player_two});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 2, "c", 2, {from: player_one});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 1, "c", 7, {from: player_two});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 2, "d", 2, {from: player_one});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 1, "j", 10, {from: player_two});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 2, "g", 5, {from: player_one});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 1, "a", 8, {from: player_two});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 2, "g", 6, {from: player_one});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 1, "i", 4, {from: player_two});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 2, "g", 7, {from: player_one});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 1, "i", 3, {from: player_two});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 2, "g", 8, {from: player_one});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 1, "i", 5, {from: player_two});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 2, "g", 9, {from: player_one});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 1, "c", 9, {from: player_two});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 2, "j", 2, {from: player_one});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 1, "i", 6, {from: player_two});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 2, "j", 3, {from: player_one});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 1, "j", 6, {from: player_two});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 2, "c", 5, {from: player_one});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 1, "j", 3, {from: player_two});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 2, "d", 5, {from: player_one});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 1, "j", 4, {from: player_two});
        }).then(function () {
            return battleship.fireMissle(player_one, 0, 2, "e", 5, {from: player_one});
        }).then(function (res) {
            var winner;
            for (var i = 0; i < res.logs.length; i++) {
                var log = res.logs[i];
            
                if (log.event == "Winner") {
                    assert.equal(log.args.winner, player_one);
                    winner = true
                    break;
                }
            }
            assert.equal(winner, true)
        }).then(function () {
            return battleship.getBoard(player_one, 0, 1)
        }).then(function (res) {
            console.log();
            console.log("Player One Board");
            displayBoard(res);
            return battleship.getBoard(player_one, 0, 2)
        }).then(function (res) {
            console.log();
            console.log();
            console.log("Player Two Board");
            displayBoard(res);
        });
    });
});