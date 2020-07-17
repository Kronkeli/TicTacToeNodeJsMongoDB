// Some global variables
var boord;
var boardData = [];
var playerTurn;
var gameOverEvent;

// Setting up a XMLHttpRequest
let xhr = new XMLHttpRequest();
xhr.open('GET', 'http://localhost:8080/rows/');
xhr.responseType = 'json';
xhr.setRequestHeader('Accept', 'application/json');

// Setting up a marking XMLHttpRequest
let mark_xhr = new XMLHttpRequest();

function post(path, params, method = "post") {
  // The rest of this code assumes you are not using a library.
  // It can be made less wordy if you use one.
  const form = document.createElement("form");
  form.method = method;
  form.action = path;

  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const hiddenField = document.createElement("input");
      hiddenField.type = "hidden";
      hiddenField.name = key;
      hiddenField.value = params[key];

      form.appendChild(hiddenField);
    }
  }
  document.body.appendChild(form);
  form.submit();
}

var createClickHandler = function(element, rowNum, colNum) {
  return function() {
    if (element.innerHTML === "") {
      var sign;
      var color;
      if (playerTurn === 1) {
        sign = "X";
        // color = "rgb(124, 252, 0)";
      } else {
        sign = "O";
        //  color = "rgb(250, 128, 114)";
      }
      element.innerHTML = sign;
      element.style.backgroundColor = color;
      console.log(
        "nyt tapahtuu rivillä " +
          rowNum +
          " ja sarakkeella " +
          colNum +
          " jotakin!"
      );
      boardData[rowNum][colNum] = sign;

      var rowData = [];
      for (let i = 0; i < 5; i++) {
        rowData.push(boardData[rowNum][i]);
      }

      switchTurn();
      var postData = {
        rowNumber: rowNum,
        colNumber: colNum,
        rowContent: rowData,
        newPlayerNumber: playerTurn
      };
      console.log("lähtee " + postData.rowNumber + " " + postData.rowContent + " " + postData.newPlayerNumber);
      mark_xhr.open('POST', 'http://localhost:8080/rows/mark/');
      mark_xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
      mark_xhr.send(JSON.stringify(postData));
      // post("/rows/mark", postData);
    }
  };
};

if (document.readyState !== "loading") {
  console.log("Document read, executing");
  initializeCode();
} else {
  document.addEventListener("DOMContentLoaded", function() {
    console.log("Document ready, executing after a wait");
    initializeCode();
  });
}

function initializeCode() {
  console.log("initializing!!");
  
  // Initiating player turn system and rendering board
  var playerText = document.getElementById("turnIndicator").innerHTML;
  if (playerText === "Second persons turn") {
    playerTurn = 2;
  } else {
    playerTurn = 1;
  }
  boord = document.getElementById("board");
  var rows = boord.getElementsByTagName("tr");
  var cells;
  initBoardData();
  var index = 0;
  for (let i = 0; i < 5; i++) {
    rows[i].classList.add("rowClass");
    cells = rows[i].getElementsByTagName("td");
    for (let j = 0; j < 5; j++) {
      cells[j].addEventListener(
        "click",
        createClickHandler(cells[j], Math.floor(index / 5), index % 5)
      );
      cells[j].classList.add("cellClass");
      boardData[i][j] = cells[j].innerHTML;
      index++;
    }
  }

  // Game ending event system for document
  gameOverEvent = document.createEvent("Event");
  gameOverEvent.initEvent("gameOver", true, true);
  document.addEventListener("gameOver", gameEnded);

  // HTTPS-request stuff (alternative AJAX or XMLHTTPREQUESTS)
  // loadAjax();
  xhr.send();
}

function initBoardData() {
  for (let i = 0; i < 5; i++) {
    var rowData = [];
    for (let j = 0; j < 5; j++) {
      rowData.push("");
    }
    boardData.push(rowData);
  }
}

xhr.onload = function() {
  if (xhr.status == 200) {
    console.log("xhr-status: " + xhr.status);
    console.log(JSON.stringify(xhr.response));
    // Response has rows_list and playernumber
    let newBoardData = xhr.response.rows_list;
    let newPlayerNumber = xhr.response.playerturn;

    // Updating the playernumber
    updatePlayerNumber(newPlayerNumber);
    console.log("chr-jotain: " + newBoardData[1].content);
    var rows = boord.getElementsByTagName("tr");
      var cellsInRow;
      for ( let i = 0; i < 5; i++ ) {
        cellsInRow = rows[i].getElementsByTagName("td");
        console.log("löydetty rivi: " + cellsInRow);
        for ( let j = 0; j < 5; j++ ) {
          console.log("onko löydetty cell riviltä: " + cellsInRow[j].innerHTML);
          cellsInRow[j].innerHTML = newBoardData[i].content[j];
          boardData[i][j] = newBoardData[i].content[j];
        }
      }
      if ( checkWinningCondition() === true ) {
        console.log("peli päättynyt on");
        document.dispatchEvent(gameOverEvent);
      }
      else {
        xhr.open('GET', 'http://localhost:8080/rows/');
        xhr.responseType = 'json';
        xhr.setRequestHeader('Accept', 'application/json');
        window.setTimeout(function() {xhr.send()}, 2000);
      }
  }
  else {
    xhr.open('GET', 'http://localhost:8080/rows/');
    xhr.responseType = 'json';
    xhr.setRequestHeader('Accept', 'application/json');
    console.log("xhr status muutakuin 200. OIkeasti on: " + xhr.status);
    window.setTimeout(function() {xhr.send()}, 2000);
  }
}

xhr.onerror = function() {
  console.log("XHR kusee");
}

mark_xhr.onload = function() {
  console.log("merkki on merkattu");
  // Tässä voisi freezata kaikki ikkunat kunnes toinen pelaaja ton tehnyt siirtonsa
  // Lisäisi taulukon classeihin (tai block content, tai html bodyyn) "freeze"-classin
  // document.getElementsByTag("body").classList.add("freeze");
  // Ja tämä -> css.tiedostoon:
  // .freeze { pointer-events: none; }
}

mark_xhr.onerror = function() {
  console.logo("mark_XHR kusee");
}

function updatePlayerNumber(number) {
  playerTurn = number;
  var playerText = document.getElementById('turnIndicator');
  if (playerTurn === 1) {
    playerText.innerHTML = "First persons turn";
  }
  else if ( playerTurn === 2) {
    playerText.innerHTML = "Second persons turn";
  }
  else {
    playerText.innerHTML = "First to reach 5 in a row wins!";
  }
}

// See https://www.npmjs.com/package/superagent
function loadAjax() {
  superagent
    .get("http://localhost:8080/rows/")
    .set('Accept', 'application/json')
    .then(res => {
      // res.body, res.headers, res.status
      console.log(res.status);
      console.log(res.body);
      // Neat! Superagent automatically parsed the JSON data
      var rows = boord.getElementsByTagName("tr");
      var cellsInRow;
      for ( let i = 0; i < 5; i++ ) {
        cellsInRow = rows[i].getElementsByTagName("td");
        console.log("löydetty rivi: " + cellsInRow);
        for ( let j = 0; j < 5; j++ ) {
          console.log("onko löydetty cell riviltä: " + cellsInRow[j].innerHTML);
          cellsInRow[j].innerHTML = res.body[i].content[j];
        }
      }
      window.setTimeout(loadAjax, 1000);
    })
    .catch(err => {
      // err.message, err.response
      console.log("ERROR");
      console.log(err.message);
      console.log(err.response);
      window.setTimeout(loadAjax, 1000);
    });
}

function switchTurn() {
  playerTurn = (playerTurn % 2) + 1;
}

function checkWinHorizontal() {
  var counterX;
  var lastSignX;
  var currentSign;
  for (let i = 0; i < boardData.length; i++) {
    counterX = 1;
    lastSignX = boardData[i][0];
    for (let j = 1; j < boardData[0].length; j++) {
      currentSign = boardData[i][j];
      if ((currentSign === lastSignX) & (currentSign !== "")) {
        counterX++;
      } else {
        lastSignX = currentSign;
        counterX = 1;
      }
      if (counterX === 5) {
        return true;
      }
    }
  }
  return false;
}

function checkWinVertical() {
  var counterY;
  var lastSignY;
  var currentSign;
  for (let i = 0; i < boardData[0].length; i++) {
    counterY = 1;
    lastSignY = boardData[0][i];
    for (let j = 1; j < boardData.length; j++) {
      currentSign = boardData[j][i];
      if ((currentSign === lastSignY) & (currentSign !== "")) {
        counterY++;
      } else {
        lastSignY = currentSign;
        counterY = 1;
      }
      if (counterY === 5) {
        return true;
      }
    }
  }
  return false;
}

function checkWinDiagonal1() {
  let j;
  var lastSign;
  var currentSign;
  for (let i = 0; i < boardData.length; i++) {
    j = 1;
    var counter = 1;
    lastSign = boardData[i][0];
    while ((j + i < boardData.length) & (j < boardData[0].length)) {
      currentSign = boardData[i + j][j];
      if ((currentSign === lastSign) & (currentSign !== "")) {
        counter++;
      } else {
        counter = 1;
        lastSign = currentSign;
      }
      if (counter === 5) {
        return true;
      }
      j++;
    }
  }
  return false;
}

function checkWinDiagonal2() {
  let i;
  var lastSign;
  var currentSign;
  for (let j = boardData[0].length - 1; j > 0; j--) {
    i = 1;
    var counter = 1;
    lastSign = boardData[0][j];
    while ((j + i < boardData[0].length) & (i < boardData.length)) {
      currentSign = boardData[i][i + j];
      if ((currentSign === lastSign) & (currentSign !== "")) {
        counter++;
      } else {
        counter = 1;
        lastSign = currentSign;
      }
      if (counter === 5) {
        return true;
      }
      i++;
    }
  }
  return false;
}

function checkWinDiagonal3() {
  let j;
  var lastSign;
  var currentSign;
  var counter;
  for (let i = 0; i < boardData.length; i++) {
    j = 1;
    counter = 1;
    lastSign = boardData[i][0];
    while ((i - j > -1) & (j < boardData[0].length)) {
      currentSign = boardData[i - j][j];
      if ((currentSign === lastSign) & (currentSign !== "")) {
        counter++;
      } else {
        counter = 1;
        lastSign = currentSign;
      }
      if (counter === 5) {
        return true;
      }
      j++;
    }
  }
}

function checkWinDiagonal4() {
  let i;
  var lastSign;
  var currentSign;
  var counter;
  for (let j = boardData[0].length - 1; j > 0; j--) {
    i = 1;
    counter = 1;
    lastSign = boardData[boardData.length - 1][j];
    while ((i + j < boardData[0].length) & (i < boardData.length)) {
      currentSign = boardData[boardData.length - 1 - i][j + i];
      if ((currentSign === lastSign) & (currentSign !== "")) {
        counter++;
      } else {
        counter = 1;
        lastSign = currentSign;
      }
      if (counter === 5) {
        return true;
      }
      i++;
    }
  }
}

function checkWinningCondition() {
  if (checkWinHorizontal() === true) {
    return true;
  } else if (checkWinVertical() === true) {
    return true;
  } else if (checkWinDiagonal1() === true) {
    return true;
  } else if (checkWinDiagonal2() === true) {
    return true;
  } else if (checkWinDiagonal3() === true) {
    return true;
  } else if (checkWinDiagonal4() === true) {
    return true;
  }
  return false;
}

function gameEnded() {
  playerTurn = (playerTurn % 2) + 1;
  alert("Player " + playerTurn + " won!");
}