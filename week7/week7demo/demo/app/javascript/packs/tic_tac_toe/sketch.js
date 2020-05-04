var canvas;
var board;
var human = 'O';
var computer = 'X';
var currentPlayer;
var available = []
var nodeWidth;
var nodeHeight;
var resultText = document.getElementById("result");
var canvasOffset = resultText.getBoundingClientRect().bottom;
var winner;
var gameInProgress;
var score = [
    parseInt("<%= @wins %>"),
    parseInt("<%= @losses %>"),
    parseInt("<%= @ties %>")
];

window.sketch = function (p) {
    p.setup = function () {
        p.createCanvas(windowWidth, windowHeight - canvasOffset * 2);;
        p.background(0);
    }
};
new p5(window.sketch, 'sketch_canvas');

var scoreText = document.getElementById("scoreText");

function newGame() {
    noLoop();

    resultText.innerHTML = "";
    board = [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
    ];
    available = board;
    currentPlayer = random([human, computer]);
    gameInProgress = true;
    loop();
}

function setup() {



    nodeWidth = width / 3;
    nodeHeight = height / 3;
    centerCanvas();
    newGame();
}

function centerCanvas() {
    var canvasX = (windowWidth - width) / 2;
    var canvasY = (windowHeight - height) / 2 + canvasOffset;
    canvas.position(canvasX, canvasY)
};

function windowResized() {
    resizeCanvas(windowWidth, windowHeight - canvasOffset * 2);
    nodeWidth = width / 3;
    nodeHeight = height / 3;
    centerCanvas();
    drawGrid();
}

function draw() {
    background(220);
    drawGrid();
    strokeWeight(4);

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let x = nodeWidth * i + nodeWidth / 2;
            let y = nodeHeight * j + nodeHeight / 2;
            let spot = board[i][j];
            let xRadius = nodeWidth / 4;
            let yRadius = nodeHeight / 4;

            if (spot == human) {
                noFill();
                ellipse(x, y, nodeWidth / 2, nodeHeight / 2);
            } else if (spot == computer) {
                line(x - xRadius, y - yRadius, x + xRadius, y + yRadius)
                line(x + xRadius, y - yRadius, x - xRadius, y + yRadius)
            }
        }
    }
    if (gameInProgress && checkWinner() && currentPlayer == computer) {
        nextTurn();
    }
}

function mousePressed() {
    if (gameInProgress && checkWinner() && currentPlayer == human) {
        if (mouseX >= 0 && mouseY >= 0 && mouseX <= width && mouseY <= height) {
            let i = floor(mouseX / nodeWidth);
            let j = floor(mouseY / nodeHeight);
            if (moveAvailable(i, j)) {
                board[i][j] = human;
                currentPlayer = computer;
            }
        }
    }
}

function keyReleased() {
    if (keyCode === 32) {
        newGame();
    }
}

function drawGrid() {
    line(nodeWidth, 0, nodeWidth, height);
    line(nodeWidth * 2, 0, nodeWidth * 2, height);
    line(0, nodeHeight, width, nodeHeight);
    line(0, nodeHeight * 2, width, nodeHeight * 2);
}

function equals3(a, b, c) {
    return a == b && b == c && a != '';
}

function checkWinner() {
    winner = null;
    let openSpots = 0;
    let result;
    // horizontal
    for (let i = 0; i < 3; i++) {
        if (equals3(board[i][0], board[i][1], board[i][2])) {
            winner = board[i][0];
        }
    }

    // Vertical
    for (let i = 0; i < 3; i++) {
        if (equals3(board[0][i], board[1][i], board[2][i])) {
            winner = board[0][i];
        }
    }

    // Diagonal
    if (equals3(board[0][0], board[1][1], board[2][2])) {
        winner = board[0][0];
    }
    if (equals3(board[2][0], board[1][1], board[0][2])) {
        winner = board[2][0];
    }


    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] == '') {
                openSpots++;
            }
        }
    }


    if (winner == null && openSpots == 0) {
        result = 'tie';
    } else {
        result = winner;
    }
    if (result !== null) {
        noLoop();
        gameInProgress = false;
        currentPlayer == null;
        if (result == 'tie') {
            resultText.innerHTML = 'Tie!';
        } else {
            resultText.innerHTML = `${result} wins!`;
        }
        setScore(result);
    }
    if (result === null) {
        return true;
    } else {
        return false;
    }
}

function nextTurn() {
    if (currentPlayer == computer) {
        let available = [];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (moveAvailable(i, j)) {
                    available.push({
                        i,
                        j
                    })
                }
            }
        }
        let move = random(available);
        board[move.i][move.j] = computer;
        currentPlayer = human;
    }
}

function moveAvailable(iPos, jPos) {
    let result;
    if (iPos > 2 || jPos > 2 || iPos < 0 || jPos < 0) {
        result = false;
    } else {
        result = board[iPos][jPos] === ''
    }
    return result;
}

function setScore(result) {
    switch (result) {
        case human:
            score[0] += 1;
            break;
        case computer:
            score[1] += 1;
            break;
        default:
            score[2] += 1;
            break;
    }
    setScoreText();
    updateScores(result);
}

function setScoreText() {
    scoreText.innerHTML = `${score[0]} Wins / ${score[1]} Losses / ${score[2]} Ties`;
}

function updateScores(result) {
    var formData = new FormData();
    switch (result) {
        case human:
            formData.append("win", 1)
            break;
        case computer:
            formData.append("loss", 1)
            break;
        default:
            formData.append("tie", 1)
            break;
    }
    formData.append("authenticity_token", "<%= form_authenticity_token %>");
    var request = new XMLHttpRequest();
    request.open("POST", "http://localhost:3000/played");
    request.send(formData);
}