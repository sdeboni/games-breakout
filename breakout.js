const initialSpeed = 5; // px/sec
const paddle = {};
const ball = {};
const blocks = {};

let isGameOver = false;

window.addEventListener("DOMContentLoaded", () => {
  // add blocks
  blocks.block = [];
  blocks.ele = document.querySelector("#blocks");

  // Build blocks
  for (let row = 1; row < 4; row++) {
    for (let col = 0; col < 6; col++) {
      const div = document.createElement("div");
      div.classList.add(`row-${row.toString()}`);
      blocks.ele.appendChild(div);

      const rect = div.getBoundingClientRect();

      const block = {
        ele: div,
        top: rect.top,
        left: rect.left,
        bottom: rect.top + rect.height,
        right: rect.left + rect.width,
        width: rect.width,
        height: rect.height,
      };
      blocks.block.push(block);
    }
  }

  const gameRect = document.querySelector("#game").getBoundingClientRect();

  // Position paddle
  paddle.ele = document.querySelector("#paddle");

  let rect = paddle.ele.getBoundingClientRect();
  paddle.height = rect.height;
  paddle.width = rect.width;

  paddle.top = gameRect.height - (1.5 * paddle.height);
  paddle.left = (gameRect.width - paddle.width)/2;
  paddle.maxRight = game.width - paddle.width;

  paddle.ele.style.top = `${paddle.top}px`;
  paddle.ele.style.left = `${paddle.left}px`;
  paddle.ele.style.visibility = "visible";
  
  // Position ball
  ball.ele = document.querySelector("#ball");

  rect = ball.ele.getBoundingClientRect();
  ball.diameter = rect.width;
  ball.radius = rect.width/2;

  ball.top = paddle.top - (ball.diameter);
  ball.cy = paddle.top - ball.radius;
  ball.cx = gameRect.width/2

  ball.top = paddle.top - ball.diameter;
  ball.left = ball.cx - ball.radius;

  ball.dx = -initialSpeed; 
  ball.dy = -initialSpeed;
  ball.minX = ball.diameter/2;
  ball.minY = ball.diameter/2;
  ball.maxX = gameRect.width - ball.radius;
  ball.maxY = gameRect.height - ball.radius;

  ball.ele.style.visibility = "visible";

  const minOffsetLeft = paddle.width/2;
  const maxOffsetRight = game.width - (paddle.width/2);
  
  // Add mobility to paddle 
  document.addEventListener("mousemove", event => {
    const offset = event.pageX - gameRect.left;
    if (offset < 0 || offset > game.width || isGameOver) {
      return;
    }

    if (offset < minOffsetLeft) {
      paddle.left = 0; 
    } else if (offset > paddle.maxOffsetRight) {
      paddle.left = paddle.maxRight;
    } else {
      paddle.left = offset - (paddle.width/2) ;
    }
  });

  requestAnimationFrame(gameloop);
});

function travel(elapsed) {
  const x = ball.cx + (ball.dx * elapsed / 1000.0);
  const y = ball.cy + (ball.dy * elapsed / 1000.0);

  if (x < ball.minX) {
    ball.cx = ball.minX;
  } else if (x > ball.maxX) {
    ball.cx = ball.maxX;
  } else {
    ball.cx = x;
  }

  if (y < ball.minY) {
    ball.cy = ball.minY;
  } else if (y > ball.maxY) {
    ball.cy = ball.maxY;
  } else {
    ball.cy = y;
  }
}

function updatePosition() {
  console.log(ball.left, ball.cx, ball.radius)
  ball.left = ball.cx - ball.radius;
  ball.top = ball.cy - ball.radius;
}

function handleCollision() {
  if (hitLeft()) {
  } else if (hitRight()) {
  } else if (hitTop()) {
  } else if (hitBottom()) {
  } else if (hitPaddle()) {
  } else if (hitBlock()) {
  }
}

function hitLeft() {
  return false;
}
function hitRight() {
  return false;
}
function hitTop() {
  return false;
}
function hitBottom() {
  return false;
}
function hitPaddle() {
  return false;
}
function hitBlock() {
  return false;
}

function showGameOver() {
  const game = document.querySelector("#game");
  game.style.background = "darkred";
  paddle.ele.style.opacity = "0.2";
}

function renderBall() {
  ball.ele.style.top = `${ball.top}px`;
  ball.ele.style.left = `${ball.left}px`;
}

let lastRender;
function gameloop(timestamp) {
  if (lastRender == undefined) {
    lastRender = timestamp;
  }
  let elapsed = timestamp - lastRender;
  let deltaPx = travel(elapsed)

  if (deltaPx < 1) {
    requestAnimationFrame(gameloop);
    return;
  }

  lastRender = timestamp;
  updatePosition();
  handleCollision();

  if (isGameOver) {
    showGameOver();
    return;
  }
  renderBall();

  //requestAnimationFrame(gameloop);
}
