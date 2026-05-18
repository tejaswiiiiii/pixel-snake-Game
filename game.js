const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const gameOverBox = document.getElementById("gameOverBox");
const finalScoreText = document.getElementById("finalScore");

let box = 20;
let snake;
let food;
let dx, dy;
let score = 0;
let gameInterval;
let playerName = "";

// -------------------- START GAME --------------------
function startGame() {
    menu.style.display = "none";
    canvas.style.display = "block";
    gameOverBox.style.display = "none";

    snake = [{ x: 200, y: 200 }];
    dx = box;
    dy = 0;
    score = 0;

    food = generateFood();

    document.addEventListener("keydown", changeDirection);

    gameInterval = setInterval(draw, 120);
}

// -------------------- DRAW GAME --------------------
function draw() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    snake.forEach((s, i) => {
        ctx.fillStyle = i === 0 ? "lime" : "green";
        ctx.fillRect(s.x, s.y, box, box);
    });

    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    let head = {
        x: snake[0].x + dx,
        y: snake[0].y + dy
    };

    if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= canvas.width ||
        head.y >= canvas.height ||
        snake.some(s => s.x === head.x && s.y === head.y)
    ) {
        gameOver(); // ✅ sirf call karo — andar mat daalo
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        food = generateFood();
    } else {
        snake.pop();
    }
}

// -------------------- MOVE CONTROL --------------------
function changeDirection(e) {
    if (e.key === "ArrowUp" && dy === 0) { dx = 0; dy = -box; }
    if (e.key === "ArrowDown" && dy === 0) { dx = 0; dy = box; }
    if (e.key === "ArrowLeft" && dx === 0) { dx = -box; dy = 0; }
    if (e.key === "ArrowRight" && dx === 0) { dx = box; dy = 0; }
}

// -------------------- FOOD --------------------
function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * 20) * box,
            y: Math.floor(Math.random() * 20) * box
        };
    } while (snake.some(s => s.x === newFood.x && s.y === newFood.y));
    return newFood;
}

// -------------------- GAME OVER --------------------
function gameOver() {
    clearInterval(gameInterval);
    document.removeEventListener("keydown", changeDirection);

    canvas.style.display = "none";
    gameOverBox.style.display = "flex";

    finalScoreText.innerText = "Your Score: " + score;
    document.getElementById("playerName").value = ""; // ✅ name clear
}

// -------------------- SAVE SCORE --------------------
function saveScore() {
    playerName = document.getElementById("playerName").value;

    if (!playerName) {
        alert("Enter your name!");
        return;
    }

    fetch("http://localhost:3000/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: playerName, score: score })
    })
    .then(res => res.json())
    .then(data => {
        // alert("Score Saved!");
        backToMenu();
    })
    .catch(err => console.log(err));
}

// -------------------- MENU FUNCTIONS --------------------
function backToMenu() {
    gameOverBox.style.display = "none";
    menu.style.display = "flex";
    canvas.style.display = "none";
}

function showRules() {
    document.getElementById("output").innerText =
        "Use Arrow Keys to move. Eat food to grow. Avoid walls and yourself.";
}

// -------------------- LEADERBOARD --------------------
function showLeaderboard() {
    fetch("http://localhost:3000/api/scores")
        .then(res => res.json())
        .then(data => {
            let html = "<h3>Leaderboard</h3>";
            data.forEach((d, i) => {
                html += `<p>${i + 1}. ${d.name} - ${d.score}</p>`;
            });
            document.getElementById("output").innerHTML = html;
        });
}

// -------------------- HIGHEST SCORE --------------------
function showHighestScore() {
    fetch("http://localhost:3000/api/scores")
        .then(res => res.json())
        .then(data => {
            if (data.length === 0) return;
            let top = data[0];
            document.getElementById("output").innerText =
                `Highest Score: ${top.name} - ${top.score}`;
        });
}