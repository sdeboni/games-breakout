const initialSpeed = 400; // px/sec
const maxSpeed = initialSpeed * 1.5;
const minSpeed = initialSpeed * 0.75;
const paddle = {};
const ball = {};
const blocks = {};

let isGameOver = false;
let pause = false;

window.addEventListener("DOMContentLoaded", () => {
  // add blocks
  blocks.array = [];
  blocks.ele = document.querySelector("#blocks");

  const gameRect = document.querySelector("#game").getBoundingClientRect();

  // Build blocks
  for (let row = 1; row < 4; row++) {
    for (let col = 0; col < 6; col++) {
      const div = document.createElement("div");
      div.classList.add(`row-${row.toString()}`);
      blocks.ele.appendChild(div);

      const rect = div.getBoundingClientRect();

      const block = {
        ele: div,
        top: rect.top - gameRect.top,
        left: rect.left - gameRect.left,
        width: rect.width,
        height: rect.height,
				visible: true,
      };

			block.right = block.left + block.width;
			block.bottom = block.top + block.height;
      blocks.array.push(block);
    }
  }

  // Position paddle
  paddle.ele = document.querySelector("#paddle");

  let rect = paddle.ele.getBoundingClientRect();
  paddle.height = rect.height;
  paddle.width = rect.width;

  paddle.top = gameRect.height - (1.5 * paddle.height);
  paddle.left = (gameRect.width - paddle.width)/2;
  paddle.right = paddle.left + paddle.width;
  paddle.center = paddle.left + (paddle.width/2);

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
  const maxRight = gameRect.width - paddle.width;
  const maxOffsetRight = gameRect.width - (paddle.width/2);
  
  // Add mobility to paddle 
  document.addEventListener("mousemove", e => {
    const offset = e.pageX - gameRect.left;
    if (isGameOver) {
      return;
    }

    if (offset < minOffsetLeft) {
      paddle.left = 0; 
    } else if (offset > maxOffsetRight) {
      paddle.left = maxRight;
    } else {
      paddle.left = offset - (paddle.width/2) ;
    }
		paddle.right = paddle.left + paddle.width;
    paddle.center = paddle.left + (paddle.width/2);
  });

	document.addEventListener("mousedown", () => {
		pause = !pause;
		if (!pause) {
			lastRender = undefined;
			requestAnimationFrame(gameloop);
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
  ball.left = ball.cx - ball.radius;
  ball.top = ball.cy - ball.radius;
}

function handleCollision() {
  if (collisionSide()) {
  } else if (collisionBottom()) {
    isGameOver = true;
  } else if (collisionPaddle()) {
  } else if (collisionBlock()) {
  }
}

function collisionSide() {
  if (ball.cx <= ball.minX ||
    ball.cx >= ball.maxX) {
    ball.dx = -1 * ball.dx; 
    return true;
  } else if (ball.cy <= ball.minY) { 
    ball.dy = -1 * ball.dy;
    return true;
  }
  return false;
}

function collisionBottom() {
  return ball.cy >= ball.maxY;
}

function collisionPaddle() {
  if (ball.cx >= paddle.left - (ball.radius/4) && 
    ball.cx <= paddle.right + (ball.radius/4) && 
    ball.cy > paddle.top - ball.radius) {

    if (ball.cx > paddle.right - (ball.radius/2)) {
			if (ball.dx < 0) {
        ball.dx = Math.max(ball.dx*2, -maxSpeed)
				ball.dx = -1 * ball.dx;
			} else if (ball.dx == 0 ) {
        ball.dx = initialSpeed;
      }
    } else if (ball.cx < paddle.left + (ball.radius/2)) {
			if (ball.dx > 0) {
        ball.dx = Math.min(ball.dx*2, maxSpeed);
				ball.dx = -1 * ball.dx;
			} else if (ball.dx == 0) {
        ball.dx = -initialSpeed;
      }
    } else if (ball.cx < paddle.center+(ball.radius/2) && ball.cx > paddle.center-(ball.radius/2)) {
        ball.dx = 0;
        ball.dy = Math.max(3 * ball.dy/4, minSpeed);
    } else {
      if (ball.dx == 0) {
        if (ball.cx < paddle.center) {
          ball.dx = -initialSpeed * 0.1;
        } else {
          ball.dx = initialSpeed * 0.1;
        }
      }
      let v = Math.abs(2 * (ball.cx-paddle.center)/(paddle.width/2))

      let x = Math.abs(ball.dx);
      let y = Math.abs(ball.dy);

      const dx = Math.max(Math.min(v * Math.abs(ball.dx), maxSpeed), minSpeed)
      const dy = Math.max(Math.min(v * Math.abs(ball.dy), maxSpeed), minSpeed)

      if (ball.dx > 0) {
        ball.dx = dx
      } else {
        ball.dx = -dx;
      }
      if (ball.dy > 0) {
        ball.dy = dy;
      } else {
        ball.dy = -dy;
      }
      ball.cy = paddle.top - ball.radius;
    }
    ball.dy = -1 * ball.dy;
    return true;
  }
  return false;
}

function collisionBlock() {
  const top = ball.cy - ball.radius;
  const left = ball.cx - ball.radius;
  const bottom = top + ball.diameter;
  const right = left + ball.diameter;

  let visibleBlockCount = blocks.array.length;
	for (const block of blocks.array) {
		if (!block.visible) {
			visibleBlockCount--;
			continue;
		}
		if (top <= block.bottom &&
			bottom >= block.top &&
			left <= block.right &&
			right >= block.left) {
      block.visible = false;
      block.ele.style.visibility = "hidden";

			if (ball.cx > block.right - 10 && ball.cy < block.top + 10) {
				if (ball.dx < 0) {
					ball.dx = -1 * ball.dx;
				}
				ball.dy = -1 * ball.dy;
			} else if (ball.cx < block.left + 10 && ball.cy < block.top + 10) {
				if (ball.dx > 0) {
					ball.dx = -1 * ball.dx;
				}
				ball.dy = -1 * ball.dy;
			} else if (ball.cx > block.right - 10 && ball.cy > block.bottom - 10) {
				if (ball.dx < 0) {
					ball.dx = -1 * ball.dx;
				}
				ball.dy = -1 * ball.dy;
			} else if (ball.cx < block.left + 10 && ball.cy > block.bottom - 10) {
				if (ball.dx > 0) {
					ball.dx = -1 * ball.dx;
				}
				ball.dy = -1 * ball.dy;
			} else if (ball.cx > block.right || ball.cx < block.left) {
        ball.dx = -1 * ball.dx; 
			} else if (ball.cy > block.bottom || ball.cy < block.top) {
        ball.dy = -1 * ball.dy;
			}
      break;
		}
  }
	isGameOver = visibleBlockCount == 0;
}

function showGameOver() {
  const game = document.querySelector("#game");
	let won = true;
	for (const block of blocks.array) {
		if (block.visible) {
			won = false;
			break;
		}
	}
	if (won) {
		game.style.background = "green";
	} else {
		game.style.background = "darkred";
	}
  paddle.ele.style.opacity = "0.2";
}

function renderBall() {
  ball.ele.style.top = `${ball.top}px`;
  ball.ele.style.left = `${ball.left}px`;
}

function renderPaddle() {
  paddle.ele.style.top = `${paddle.top}px`;
  paddle.ele.style.left = `${paddle.left}px`;
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

  renderBall();
	renderPaddle();

  if (isGameOver) {
    showGameOver();
    return;
  }
	if (!pause) {
		requestAnimationFrame(gameloop);
	}
}
