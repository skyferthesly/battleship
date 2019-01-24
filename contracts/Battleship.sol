pragma solidity ^0.4.23;

contract Battleship {
    mapping(uint=>ShipSingleton) shipSingletons;

    mapping(address=>PlayerProfile) playerProfiles;
    OpenGame[] openGames;
    
    constructor() public {
        createShipSingletons();
    }

    struct PlayerProfile {
        // could have username here ?
        Session[] sessions;
    }

    struct Session {
        bool open;
        mapping(uint=>Battlefield) battlefields;
        mapping(uint=>address) players;
        address whos_turn;
        bool in_progress;
        address winner;
    }

    struct Battlefield {
        uint[10][10] board;
        mapping(uint=>Ship) ships;
        uint shipsPlaced;
        uint shipsSunk;
    }

    struct ShipSingleton {
        string type_;
        uint length;
    }
    
    struct Ship {
        uint typeId;
        string start_row;
        uint start_column;
        string end_row;
        uint end_column;
        bool sunk;
        uint hit;
    }

    struct OpenGame {
        address player;
        uint session;
    }

    event Winner(
        address indexed winner,
        address host,
        uint sessionId
    );

    function getOpenGameLength() public view returns (uint) {
        return openGames.length;
    }

    function getOpenGame(uint game) public view returns (address, uint) {
        return (
            openGames[game].player,
            openGames[game].session
        );
    }

    function joinGame(address host, uint sessionId, address player_two) public {
        Session storage session = playerProfiles[host].sessions[sessionId];
        session.players[2] = player_two;
        session.open = false;
        session.in_progress = true;

        if (sessionId == 0) {
            session.whos_turn = session.players[1];
        }
        else if (sessionId % 2 == 0) {
            session.whos_turn = session.players[2];
        }
        else {
            session.whos_turn = session.players[1];
        }
    }

    function createSession(address add) public {
        uint[10][10] memory board1;
        uint[10][10] memory board2;
        Battlefield memory p1_battlefield = Battlefield({board: board1, shipsSunk: 0, shipsPlaced: 0});
        Battlefield memory p2_battlefield = Battlefield({board: board2, shipsSunk: 0, shipsPlaced: 0});
        Session memory session = Session({
            open: true,
            whos_turn: 0,
            in_progress: false,
            winner: 0
            });
        playerProfiles[add].sessions.push(session);

        uint sessionLength = playerProfiles[add].sessions.length-1;
        playerProfiles[add].sessions[sessionLength].battlefields[1] = p1_battlefield;
        playerProfiles[add].sessions[sessionLength].battlefields[2] = p2_battlefield;
        playerProfiles[add].sessions[sessionLength].players[1] = add;
        OpenGame memory openGame = OpenGame({player: add, session: sessionLength});
        openGames.push(openGame);
    }

    function getSession(address add, uint session) public view returns(bool, address, address, address, bool, address, bool) {
        return (
            playerProfiles[add].sessions[session].open, 
            playerProfiles[add].sessions[session].players[1], 
            playerProfiles[add].sessions[session].players[2], 
            playerProfiles[add].sessions[session].whos_turn, 
            playerProfiles[add].sessions[session].in_progress,
            playerProfiles[add].sessions[session].winner,
            playerProfiles[add].sessions[session].shipedPlaced == 5
        );
    }

    function getSessionLength(address add) public view returns (uint) {
        return playerProfiles[add].sessions.length;
    }

    // TODO when you get your opponents board, its scrubbed of everything except 0's and 9's
    function getBoard(address add, uint session, uint player_number) public view returns (uint[10][10]) {
        return playerProfiles[add].sessions[session].battlefields[player_number].board;
    }

    function getShip(address add, 
        uint session, 
        uint player_number, 
        uint shipIndex) public view returns (uint, string, uint, string, uint, bool, uint) {
        Ship memory ship = playerProfiles[add].sessions[session].battlefields[player_number].ships[shipIndex];
        return (
            ship.typeId,
            ship.start_row,
            ship.start_column,
            ship.end_row,
            ship.end_column,
            ship.sunk,
            ship.hit
        );
    }

    function createShipSingletons() private {
        shipSingletons[1] = ShipSingleton("AirCraftCarrier", 5);
        shipSingletons[2] = ShipSingleton("Minesweeper", 2);
        shipSingletons[3] = ShipSingleton("Frigate", 3);
        shipSingletons[4] = ShipSingleton("Battleship", 4);
        shipSingletons[5] = ShipSingleton("Submarine", 3);
    }

    function fireMissle(address add, 
        uint sessionId, 
        uint board_number,
        string row, 
        uint column) public {
        
        Session storage session = playerProfiles[add].sessions[sessionId];

        require(session.in_progress == true, "Game is not in progress");
        require(msg.sender == session.whos_turn, "It is not your turn");
        

        if (board_number == 1) {
            require(session.players[2] == session.whos_turn, "You cannot modify your own board");
        }
        else if (board_number == 2) {
            require(session.players[1] == session.whos_turn, "You cannot modify your own board");
        }

        Battlefield storage battlefield = session.battlefields[board_number];
        require(battlefield.shipsPlaced == 5);

        // verify square hasnt been bombed
        uint val = battlefield.board[rowToIndex(row)][column-1];
        require(val != 9, "Square already bombed");
        battlefield.board[rowToIndex(row)][column-1] = 9;

        if (1 <= val && val <= 5) {
            Ship storage ship = battlefield.ships[val];
            ship.hit++;

            if (ship.hit == getShipSingletonLength(val)) {
                ship.sunk = true;
                battlefield.shipsSunk++;
            }

            if (battlefield.shipsSunk == 5) {
                // current player wins
                session.winner = msg.sender;
                session.in_progress = false;

                emit Winner(msg.sender, add, sessionId);
            }
        }

        // change whos turn it is
        if (board_number == 2) {
            session.whos_turn = session.players[2];
        }
        else if (board_number == 1) {
            session.whos_turn = session.players[1];
        }
    }

    function getShipSingletonName(uint id) public view returns (string) {
        return shipSingletons[id].type_;
    }

    function getShipSingletonLength(uint id) public view returns (uint) {
        return shipSingletons[id].length;
    }

    function verifyShipNotDiagnol(uint shipId, 
        uint start_row_index, 
        uint start_column_index, 
        uint end_row_index, 
        uint end_column_index) public view {

        bool horizontal = start_row_index == end_row_index;
        bool vertical = start_column_index == end_column_index;
        require(horizontal || vertical, "Not horizontal or vertical");
      
        // verify the distance between the starting and ending square matches the length of the ship
        uint ship_length = getShipSingletonLength(shipId);
        if (horizontal) {
            require(end_column_index-start_column_index+1 == ship_length, "Ship placement doesn't match ship length");
        }
        else if (vertical) {
            require(end_row_index-start_row_index+1 == ship_length, "Ship placement doesn't match ship length");
        }
    }

    function placeShip(address add, 
        uint session, 
        uint player_number, 
        uint shipId, 
        string start_row, 
        uint start_column, 
        string end_row, 
        uint end_column) public {

        // verify the ship placement isn't diagnol
        verifyShipNotDiagnol(shipId, rowToIndex(start_row), start_column-1, rowToIndex(end_row), end_column-1);

        // verify the squares are unoccupied, then write the ship id
        uint[10][10] storage board = playerProfiles[add].sessions[session].battlefields[player_number].board;
     
        Ship memory ship = Ship({
            typeId: shipId,
            start_row: start_row,
            start_column: start_column,
            end_row: end_row,
            end_column: end_column,
            sunk: false,
            hit: 0
        });

        if (rowToIndex(start_row) == rowToIndex(end_row)) {
            for (uint i = start_column-1; i < end_column-1+1; i++) {
                require(board[rowToIndex(start_row)][i] == 0, "Square occupied");  
                playerProfiles[add].sessions[session].battlefields[player_number].ships[shipId] = ship;
                board[rowToIndex(start_row)][i] = shipId;
            }
        }
        else if (start_column-1 == end_column-1) {
            for (i = rowToIndex(start_row); i < rowToIndex(end_row)+1; i++) {
                require(board[i][start_column-1] == 0, "Square Occupied");
                playerProfiles[add].sessions[session].battlefields[player_number].ships[shipId] = ship;
                board[i][start_column-1] = shipId;
            }
        }

        playerProfiles[add].sessions[session].battlefields[player_number].shipsPlaced++;
    }
    
    // pass only lower case
    function rowToIndex(string row) public pure returns (uint) {
        bytes memory row_bytes = bytes(row);
        bytes32 row_hash = keccak256(row_bytes);
        if (row_hash == keccak256("a")) {
            return 0;
        }
        else if (row_hash == keccak256("b")) {
            return 1;
        }
        else if (row_hash == keccak256("c")) {
            return 2;
        }
        else if (row_hash == keccak256("d")) {
            return 3;
        }
        else if (row_hash == keccak256("e")) {
            return 4;
        }
        else if (row_hash == keccak256("f")) {
            return 5;
        }
        else if (row_hash == keccak256("g")) {
            return 6;
        }
        else if (row_hash == keccak256("h")) {
            return 7;
        }
        else if (row_hash == keccak256("i")) {
            return 8;
        }
        else if (row_hash == keccak256("j")) {
            return 9;
        }
    }
}