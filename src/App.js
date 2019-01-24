import React, { Component } from 'react'
import BattleshipContractABI from '../build/contracts/Battleship.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

// need 2 boards and placeShips needs to be required on the contract level
class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      battleshipContract: null,
      logged_in_user: null,
      sessionLength: 0,
      sessions: [],
      joinGameAddress: "",
      joinGameSessionIndex: 0,
      gameInProgress: false,
      placingShips: false,
      submittedCoordinates: null,
      submittedRow: null,
      submittedColumn: null,
      currentSession: null,
      playerOneBoard: [
        Array(10).fill(0),
        Array(10).fill(0),
        Array(10).fill(0),
        Array(10).fill(0),
        Array(10).fill(0),
        Array(10).fill(0),
        Array(10).fill(0),
        Array(10).fill(0),
        Array(10).fill(0),
        Array(10).fill(0),
      ],
      playerTwoBoard: [
        Array(10).fill(0),
        Array(10).fill(0),
        Array(10).fill(0),
        Array(10).fill(0),
        Array(10).fill(0),
        Array(10).fill(0),
        Array(10).fill(0),
        Array(10).fill(0),
        Array(10).fill(0),
        Array(10).fill(0),
      ],
      fetchSessionAddress: null,
      fetchSessionIndex: null,
      fetchBoardPlayerNumber: null,
      player_one: false,
      player_two: false
    }
    
    this.instantiateContract = this.instantiateContract.bind(this)
    this.fetchSessionLength = this.fetchSessionLength.bind(this)

    this.getSessionLength = this.getSessionLength.bind(this)
    this.createSession = this.createSession.bind(this)
    this.fetchSessions = this.fetchSessions.bind(this)
    this.getSessions = this.getSessions.bind(this)

    this.updateState = this.updateState.bind(this)

    this.changeJoinGameAddress = this.changeJoinGameAddress.bind(this)
    this.changeJoinGameSession = this.changeJoinGameSession.bind(this)
    this.handleJoinGameSubmit = this.handleJoinGameSubmit.bind(this)
    this.joinGame = this.joinGame.bind(this)
    this.fetchBoard = this.fetchBoard.bind(this)
    this.fetchSession = this.fetchSession.bind(this)
    this.promptOpenBoard = this.promptOpenBoard.bind(this)
    this.onSquareClick = this.onSquareClick.bind(this)
  }

  componentWillMount() {
    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      }, () => {this.instantiateContract()})
    })
  }

  instantiateContract() {
    const contract = require('truffle-contract')
    const battleshipContract = contract(BattleshipContractABI)
    battleshipContract.setProvider(this.state.web3.currentProvider)

    this.state.web3.eth.getAccounts((error, accounts) => {
      if (error) {
        console.log(error);
      }

      this.setState({logged_in_user: accounts[0]}, () => {})

      battleshipContract.deployed().then((instance) => {
        this.setState({battleshipContract: instance}, () => {this.updateState()})
      })
    })
  }

  updateState() {
    return this.fetchSessionLength().then(() => {
      if (this.getSessionLength() > 0) {return this.fetchSessions()}
    }).then(() => {})
  }

  fetchSessionLength() {
    const battleshipInstance = this.state.battleshipContract
    const account = this.state.logged_in_user

    return battleshipInstance.getSessionLength(account, {from: account})
    .then((res) => {
      this.setState({sessionLength: res.toNumber()}, () => {})
    })
  }

  getSessionLength() {
    return this.state.sessionLength
  }

  fetchSessions() {
    console.log("Fetching sessions!")
    const battleshipInstance = this.state.battleshipContract
    const account = this.state.logged_in_user

    this.setState({sessions: []}, () =>{})
    for (let i = 0; i < this.getSessionLength(); i++) {
      console.log("Fetching session " + i)
      return battleshipInstance.getSession(account, i)
      .then((res) => {
        var session = new Map()
        
        session.open = res[0];
        session.player_one = res[1].toString();
        session.player_two = res[2].toString();
        session.whos_turn = res[3].toString();
        session.in_progress = res[4];
        session.winner = res[5].toString();
        session.index = i
        this.setState({sessions: [...this.state.sessions, session]}, () => {})
      })
    }    
  }

  fetchSession() {
    const battleshipInstance = this.state.battleshipContract
    const account = this.state.fetchSessionAddress
    const sessionIndex = this.state.fetchSessionIndex
    console.log(account)
    console.log(sessionIndex)
    return battleshipInstance.getSession(account, sessionIndex)
    .then((res) => {
      console.log(res)
      var newState = new Map()
      var session = new Map()
      
      session.open = res[0];
      session.player_one = res[1].toString();
      session.player_two = res[2].toString();
      session.whos_turn = res[3].toString();
      session.in_progress = res[4];
      session.winner = res[5].toString();
      session.index = sessionIndex
      session.shipsPlaced = res[6].shipsPlaced
      newState.session = session
      if (session.player_one === this.state.logged_in_user) {
        newState.player_one = true
      }
      else if (newState.session.player_two === this.state.logged_in_user) {
        newState.player_two = true
      }
      this.setState(newState, () => {})
    })
  }

  getSessions() {
    return this.state.sessions
  }

  createSession() {
    const battleshipInstance = this.state.battleshipContract
    const account = this.state.logged_in_user

    return battleshipInstance.createSession(account, {from: account}).then(()=>{
      return this.updateState()
    }).then(() => {})
  }

  joinGame() {
    const battleshipInstance = this.state.battleshipContract
    const account = this.state.logged_in_user
    var joinGameAddress = this.state.joinGameAddress
    var joinGameSessionIndex = this.state.joinGameSessionIndex
    return battleshipInstance.joinGame(joinGameAddress, joinGameSessionIndex, account, {from: account}).then(()=>{this.updateState()})
  }

  fetchBoard() {
    const battleshipInstance = this.state.battleshipContract
    var retBoard = [
      Array(10).fill(null),
      Array(10).fill(null),
      Array(10).fill(null),
      Array(10).fill(null),
      Array(10).fill(null),
      Array(10).fill(null),
      Array(10).fill(null),
      Array(10).fill(null),
      Array(10).fill(null),
      Array(10).fill(null),
    ]
    return battleshipInstance.getBoard(this.state.joinGameAddress, this.state.joinGameSessionIndex, this.state.fetchBoardPlayerNumber)
    .then((board) => {
      for (let i = 0; i < board.length; i++) {
        for (let g = 0; g < board[i].length; g++) {
          retBoard[i][g] = board[i][g].toNumber()
        }
      }
      console.log(retBoard)
      if ()
      this.setState({board: retBoard}, () => {})
    })
  }
  
  promptOpenBoard() {
    var currentSession = this.state.currentSession
    if (this.state.logged_in_user === currentSession.player_one) {
      // fetch board
      this.setState({fetchBoardPlayerNumber: 1}, () => {})
      this.fetchBoard()
      this.setState({gameInProgress: true}, () => {return true})
    }
    else if (this.state.logged_in_user === currentSession.player_two) {
      // fetch board
      this.setState({fetchBoardPlayerNumber: 2}, () => {})
      this.fetchBoard()
      this.setState({gameInProgress: true}, () => {return true})
    }
    return false
  }
  
  handleJoinGameSubmit(event) {
    event.preventDefault()
    // should probably set a state here, and indicate joining the game is happening

    console.log("welp")
    // fetch session
    this.setState({fetchSessionAddress: this.state.joinGameAddress, fetchSessionIndex: this.state.joinGameSessionIndex}, () => {
      this.fetchSession().then(() => {
        var currentSession = this.state.currentSession
         // check for open and in progress
         console.log(currentSession.in_progress)
        if (currentSession.in_progress) {
          if (this.promptOpenBoard()) {
            alert("Game is closed.")
          }
        }
        else if (currentSession.open) {
          if (this.state.logged_in_user === currentSession.player_one) {
            alert("You can't battle yourself!")
          }
          else {
            this.joinGame()
            this.promptOpenBoard()
            
          }
        }
        

      })
    })
  }

  changeJoinGameAddress(event) {
    console.log("ayyo")
    this.setState({joinGameAddress: event.target.value})
  }

  changeJoinGameSession(event) {
    this.setState({joinGameSessionIndex: Number(event.target.value)})
  }

  onSquareClick(row, column) {
    const battleshipInstance = this.state.battleshipContract
    const account = this.state.logged_in_user
    const sessionAddress = this.state.joinGameAddress
    const sessionIndex = this.state.joinGameSessionIndex

    if (this.state.shipsPlaced) {
      var board_number
      if (this.state.currentSession.player_one === account) {
        board_number = 2
      }
      else {
        board_number = 1
      }

      if (this.state.currentSession.whos_turn !== account) {
        alert("It's not your turn!")
      }
      else {
        console.log(sessionAddress)
        console.log(sessionIndex)
        console.log(board_number)
        console.log(rowIndextoLetter(row))
        console.log(column)
        return battleshipInstance.fireMissle(sessionAddress, sessionIndex, board_number, rowIndextoLetter(row), column, {from: account}).then(()=>{
          return this.updateState()
        }).then(() => {})
      }
    }
    else {
      // place ships...
    }
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link"><font size="48">Battleship</font></a>
            <font color="white">Logged in as: {this.state.logged_in_user}</font>
        </nav>
        
        <main className="container">
          <p>
            <br></br>
          </p>

          
            {!this.state.gameInProgress ? <Dashboard 
                                                createSession={this.createSession} 
                                                getSessionLength={this.getSessionLength} 
                                                getSessions={this.getSessions}
                                                changeJoinGameAddress={this.changeJoinGameAddress}
                                                changeJoinGameSession={this.changeJoinGameSession}
                                                joinGameAddress={this.joinGameAddress}
                                                joinGameSessionIndex={this.joinGameAddress}
                                                handleJoinGameSubmit={this.handleJoinGameSubmit}
                                              /> : <Board board={this.state.board} onSquareClick={this.onSquareClick}/>                      
            }
            
          
        </main>
      </div>
    );
  }
}

//https://medium.com/differential/react-native-basics-how-to-use-the-listview-component-a0ec44cf1fe8
function showSessions(props) {
  var sessions = props.getSessions()
  var sessionsList = sessions.map(function(session, index) {
    return (
      <table key={[index, "session"]}>
        <caption>Sessions</caption>
        <tbody>
            <tr>
                <th>Session</th>
                <td>{session.index}</td>
            </tr>
            <tr>
                <th>Player One</th>
                <td>{session.player_one}</td>
            </tr>
            <tr>
                <th>Player Two</th>
                <td>{session.player_two}</td>
            </tr>
            <tr>
                <th>Whos turn</th>
                <td>{session.whos_turn}</td>
            </tr>
            <tr>
                <th>In progress</th>
                <td>{session.in_progress.toString()}</td>
            </tr>
            <tr>
                <th>open</th>
                <td>{session.open.toString()}</td>
            </tr>
            <tr>
                <th>winner</th>
                <td>{session.winner}</td>
            </tr>
        </tbody>
    </table>
    ) 
  })

  return <div>{sessionsList}</div>
}

function rowIndextoLetter(row) {
  if (row === 0) {
    return "a"
  }
  else if (row === 1) {
      return "b"
  }
  else if (row ===  2) {
      return "c"
  }
  else if (row === 3) {
      return "d";
  }
  else if (row === 4) {
      return "e";
  }
  else if (row === 5) {
      return "f";
  }
  else if (row === 6) {
      return "g";
  }
  else if (row === 7) {
      return "h";
  }
  else if (row === 8) {
      return "i";
  }
  else if (row === 9) {
      return "i";
  }

}
function createSession(props) {
  return (
    <div>
      {createSessionButton(props)}
    </div>
  )
}

function createSessionButton(props) {
  return (
    <button onClick={props.createSession}>
      Start a new Session!
    </button>
  )
}

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

// session length, sessions (have a PLAY button here), create session, join session
class Dashboard extends Component {
  render() {
    return (
      <div>
        <p>Number of sessions: {this.props.getSessionLength()}</p>
        {showSessions(this.props)}
        {createSession(this.props)}
        <p></p>
        <form onSubmit={this.props.handleJoinGameSubmit}>
          <label>Enter friends address:</label>
          <input value={this.props.joinGameAddress} type="text" onChange={this.props.changeJoinGameAddress}/>
          <p></p>
          <label>Enter session number:</label>
          <input value={this.props.joinGameSessionIndex} type="number" onChange={this.props.changeJoinGameSession}/>
          <p></p>
          <button>Join game</button>
        </form>
      </div>
    )
  }
}

class Board extends Component {
  renderSquare(row, column) {
    return (
      <Square
        value={this.props.board[row][column]}
        onClick={() => this.props.onSquareClick(row, column, 0)}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="a">
          {this.renderSquare(0, 0)}
          {this.renderSquare(0, 1)}
          {this.renderSquare(0, 3)}
          {this.renderSquare(0, 4)}
          {this.renderSquare(0, 5)}
          {this.renderSquare(0, 6)}
          {this.renderSquare(0, 7)}
          {this.renderSquare(0, 8)}
          {this.renderSquare(0, 9)}
        </div>
        <div className="b">
          {this.renderSquare(1, 0)}
          {this.renderSquare(1, 1)}
          {this.renderSquare(1, 3)}
          {this.renderSquare(1, 4)}
          {this.renderSquare(1, 5)}
          {this.renderSquare(1, 6)}
          {this.renderSquare(1, 7)}
          {this.renderSquare(1, 8)}
          {this.renderSquare(1, 9)}
        </div>
        <div className="c">
          {this.renderSquare(2, 0)}
          {this.renderSquare(2, 1)}
          {this.renderSquare(2, 3)}
          {this.renderSquare(2, 4)}
          {this.renderSquare(2, 5)}
          {this.renderSquare(2, 6)}
          {this.renderSquare(2, 7)}
          {this.renderSquare(2, 8)}
          {this.renderSquare(2, 9)}
        </div>
        <div className="d">
          {this.renderSquare(3, 0)}
          {this.renderSquare(3, 1)}
          {this.renderSquare(3, 3)}
          {this.renderSquare(3, 4)}
          {this.renderSquare(3, 5)}
          {this.renderSquare(3, 6)}
          {this.renderSquare(3, 7)}
          {this.renderSquare(3, 8)}
          {this.renderSquare(3, 9)}
        </div>
        <div className="e">
          {this.renderSquare(4, 0)}
          {this.renderSquare(4, 1)}
          {this.renderSquare(4, 3)}
          {this.renderSquare(4, 4)}
          {this.renderSquare(4, 5)}
          {this.renderSquare(4, 6)}
          {this.renderSquare(4, 7)}
          {this.renderSquare(4, 8)}
          {this.renderSquare(4, 9)}
        </div>
        <div className="f">
          {this.renderSquare(5, 0)}
          {this.renderSquare(5, 1)}
          {this.renderSquare(5, 3)}
          {this.renderSquare(5, 4)}
          {this.renderSquare(5, 5)}
          {this.renderSquare(5, 6)}
          {this.renderSquare(5, 7)}
          {this.renderSquare(5, 8)}
          {this.renderSquare(5, 9)}
        </div>
        <div className="g">
          {this.renderSquare(6, 0)}
          {this.renderSquare(6, 1)}
          {this.renderSquare(6, 3)}
          {this.renderSquare(6, 4)}
          {this.renderSquare(6, 5)}
          {this.renderSquare(6, 6)}
          {this.renderSquare(6, 7)}
          {this.renderSquare(6, 8)}
          {this.renderSquare(6, 9)}
        </div>
        <div className="h">
          {this.renderSquare(7, 0)}
          {this.renderSquare(7, 1)}
          {this.renderSquare(7, 3)}
          {this.renderSquare(7, 4)}
          {this.renderSquare(7, 5)}
          {this.renderSquare(7, 6)}
          {this.renderSquare(7, 7)}
          {this.renderSquare(7, 8)}
          {this.renderSquare(7, 9)}
        </div>
        <div className="i">
          {this.renderSquare(8, 0)}
          {this.renderSquare(8, 1)}
          {this.renderSquare(8, 3)}
          {this.renderSquare(8, 4)}
          {this.renderSquare(8, 5)}
          {this.renderSquare(8, 6)}
          {this.renderSquare(8, 7)}
          {this.renderSquare(8, 8)}
          {this.renderSquare(8, 9)}
        </div>
        <div className="i">
          {this.renderSquare(9, 0)}
          {this.renderSquare(9, 1)}
          {this.renderSquare(9, 3)}
          {this.renderSquare(9, 4)}
          {this.renderSquare(9, 5)}
          {this.renderSquare(9, 6)}
          {this.renderSquare(9, 7)}
          {this.renderSquare(9, 8)}
          {this.renderSquare(9, 9)}
        </div>
      </div>
    );
  }
}

export default App
