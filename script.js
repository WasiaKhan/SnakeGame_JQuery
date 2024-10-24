class Game {
    constructor() {
        this.element = $('<div class="game"></div>');
        $("body").append(this.element);

        this.game_over_overlay = $('<div class="game-over"><div class="wrapper"><h1>Game Over!!</h1><div class="">Score: <span class="final-score">0</span></div><div class="">High Score: <span class="high-score">0</span></div><a href="#" class="play-again">Play again</a></div></div>');

        this.element.append(this.game_over_overlay);
        this.game_over_overlay.hide();

        this.bind_buttons();

        this.width = 500;
        this.height = 500;
        this.score = 0;

        this.snakes = [];

        this.score_board = $('<div class="current-score">Score: 0</div>');
        this.element.append(this.score_board);

    }

    reset_game() {
        this.game_over_overlay.slideUp();
        this.snakes.forEach(function (snake) {
            snake.start();
            snake.reset_position();
            snake.reset_tails();

        });

        this.score = 0;
        this.score_board.text("Score: " + this.score);

    }

    bind_buttons() {
        $(document).on("click", ".play-again", function () {
            this.reset_game();
            return false;
        }.bind(this));
    }

    add_snake(snake) {
        this.element.append(snake.element);
        this.snakes.push(snake);
    }

    game_over() {
        this.snakes.forEach(function (snake) {
            if (typeof (snake) !== "undefined") {
                snake.stop();
            }
        }
        );

        //setting score & highscore before sliding down gaemover screen to updated data not 0, bc they were initilized to 0.
        if (this.get_highscore() < this.score) {
            this.set_highscore(this.score);
        }
        this.element.find('.final-score').text(this.score);
        this.element.find('.high-score').text(this.get_highscore());

        this.game_over_overlay.slideDown();

        console.log('Score: ' + this.score);



        console.log('High score: ' + this.get_highscore());
    }

    add_score() {
        this.score++;
        this.show_score();
    }

    show_score() {
        this.element.find('.current-score').text("Score: " + this.score);

    }

    get_highscore() {
        return Number(localStorage.getItem("snake_highscore"));
    }

    set_highscore(score) {
        localStorage.setItem("snake_highscore", score);

    }

}

class Snake {
    constructor(game) {
        this.element = $('<div class="snake"><div class="eye1"></div><div class="eye2"></div></div>');
        this.game = game;
        game.add_snake(this);
        this.x = 240;
        this.y = 240;
        this.stopped = false;


        this.angle = 0;
        this.speed = 5;
        this.size = 20;
        this.tail = [];
        this.position_history = [];
        this.food;


        this.set_interval();
        this.bind_arrow_keys();
        this.init_tail();
        this.element.show();

        this.add_food();


    }

    add_food() {
        this.food = new Food(this);
    }

    start() {
        this.stopped = false;
    }

    stop() {
        this.stopped = true;
    }

    reset_position() {
        this.x = 240;
        this.y = 240;
        this.angle = 0;
        this.speed = 5;
        this.size = 20;
    }

    reset_tails() {
        this.tail.forEach(function (tail) {
            tail.remove();
        }.bind(this));

        this.tail = [];
        this.position_history = [];
        this.init_tail();
    }

    set_interval() {
        setInterval(function () {
            this.draw();
        }.bind(this), 50);
    }

    draw() {
        if (!this.stopped) {
            this.calculate_direction();

            this.check_overflow();

            this.position_tails();

            this.element.show();

            this.check_tail_collision();

            this.detect_food();

            this.element.css({
                left: this.x,
                top: this.y,
            });

            this.position_history.push({
                x: this.x,
                y: this.y
            });
            ;
        }


    }


    detect_food() {
        if (this.food.hits_food()) {
            this.food.remove();
            this.food = new Food(this);
            this.game.add_score();
            this.speed++;
        }
    }

    bind_arrow_keys() {
        $(document).on("keydown", function (event) {
            if (event.keyCode == 37) {
                // left arrow
                this.change_angle(-5);
            }
            else if (event.keyCode == 39) {
                //right arrow
                this.change_angle(5);
            }
        }.bind(this));

    }

    change_angle(degrees) {
        this.angle += degrees;

        this.element.css({
            transform: "rotate(" + this.angle + "deg)"
        });

        // if (this.angle > 359)   //Math.cos automatically handles -ive angles.
        // {this.angle=0;}

        // else if (this.angle  < 0 )
        // {this.angle = 359;}


        // console.log(this.angle);
    }

    calculate_direction() {
        let angle_in_radian = this.angle * (Math.PI / 180);
        this.x += this.speed * Math.cos(angle_in_radian);
        this.y += this.speed * Math.sin(angle_in_radian);

        // console.log(this.x);
        // console.log(this.y);
    }
    check_overflow() {
        if (this.x + this.size < 0) {
            this.x = this.game.width;
        }
        if (this.x > this.game.width) {
            this.x = -this.size;
        }
        if (this.y > this.game.height) {
            this.y = -this.size;
        }
        if (this.y + this.size < 0) {
            this.y = this.game.height;
        }

    }

    init_tail() {
        let starting_tail = 12;
        for (let i = 0; i < starting_tail; i++) {
            this.add_tail();
        }
    }

    add_tail() {
        let tail = new Tail(this);
        this.tail.push(tail);
    }

    position_tails() {
        let tail_position = [];
        let position_count = 0;
        for (let i = this.position_history.length - 1; i > 0; i--) {
            if (tail_position.length < this.tail.length) {
                position_count++;
                if (position_count > 5) {
                    tail_position.push(this.position_history[i]);
                    position_count = 0;
                }
            }
            else {
                this.position_history.splice(i, 1);
            }
        }

        // console.log(this.tail.length);
        // console.log(tail_position.length);

        this.tail.forEach(function (tail, index) {
            // console.log(tail);
            if (typeof tail_position[index] !== "undefined") {
                // console.log(tail_position[index]);
                tail.move(tail_position[index]);
            }

        });
    }

    check_tail_collision() {
        this.tail.forEach(function (tail) {
            if (tail.hits_snake()) {
                this.game.game_over();
            }
        }.bind(this))
    }
}

class Tail {
    constructor(snake) {
        this.snake = snake;
        this.element = $("<div class='tail'></div>");
        this.snake.game.element.append(this.element);

        this.x = 0;
        this.y = 0
        this.size = 20;
    }

    remove() {
        this.element.remove();
    }

    move(position) {
        this.element.show();
        this.element.css({
            left: position.x,
            top: position.y,
        });

        this.x = position.x;
        this.y = position.y;

    }

    hits_snake() {
        return (this.x < this.snake.x + this.snake.size && this.x + this.size > this.snake.x
            && this.y < this.snake.y + this.snake.size && this.y + this.size > this.snake.y
        );
    }
}

class Food {

    constructor(snake) {

        this.snake = snake;
        this.element = $('<div class="food"></div>');
        this.snake.game.element.append(this.element);

        this.size = 20;

        this.getRandomFruitPosition(this.snake.game.width, this.snake.game.height,
            this.snake.game.score_board.position().left, this.snake.game.score_board.position().top, this.snake.game.score_board.width(), this.snake.game.score_board.height(), this.size, this.size
        );

        // // old implementation...
        // this.x = Math.ceil(Math.random() * (this.snake.game.width - this.size));
        // this.y = Math.ceil(Math.random() * (this.snake.game.height - this.size));

        this.draw();
    }


    getRandomFruitPosition(gameWidth, gameHeight, scoreX, scoreY, scoreWidth, scoreHeight, fruitWidth, fruitHeight) {

        // debugger;
        let validPosition = false;
        let fruitX, fruitY;

        while (!validPosition) {
            fruitX = Math.floor(Math.random() * (gameWidth - fruitWidth));
            fruitY = Math.floor(Math.random() * (gameHeight - fruitHeight));

            // Check for overlap
            /**
            fruitX < scoreX + scoreWidth: This checks if the left edge of the fruit is to the left of the right edge of the score div. If true, the fruit is not completely to the right of the score div.

            fruitX + fruitWidth > scoreX: This checks if the right edge of the fruit is to the right of the left edge of the score div. If true, the fruit is not completely to the left of the score div.

            fruitY < scoreY + scoreHeight: This checks if the top edge of the fruit is above the bottom edge of the score div. If true, the fruit is not completely below the score div.

            fruitY + fruitHeight > scoreY: This checks if the bottom edge of the fruit is below the top edge of the score div. If true, the fruit is not completely above the score div.
             **/

            // fruitX = Number('57');
            // fruitY = Number('9');
            // console.log('fruitX < scoreX + scoreWidth', fruitX, '<', scoreX, scoreWidth, fruitX < scoreX + scoreWidth);
            // console.log('fruitX + fruitWidth > scoreX', fruitX, '>', fruitWidth, scoreX, fruitX + fruitWidth > scoreX);
            // console.log('fruitY < scoreY + scoreHeight', fruitY, '<', scoreY, scoreHeight, fruitY < scoreY + scoreHeight);
            // console.log('fruitY + fruitHeight > scoreY', fruitY, '>', fruitHeight, scoreY, fruitY + fruitHeight > scoreY);

            // console.log(!(
            //     (fruitX < scoreX + scoreWidth &&
            //         fruitX + fruitWidth > scoreX) ||
            //     (fruitY < scoreY + scoreHeight &&
            //         fruitY + fruitHeight > scoreY)
            // ));
            // debugger;
            if (!(
                (fruitX < scoreX + scoreWidth &&
                    fruitX + fruitWidth > scoreX) ||
                (fruitY < scoreY + scoreHeight &&
                    fruitY + fruitHeight > scoreY)
            )) {
                validPosition = true;
            }
        }

        //<div class="food" style="left: 57px; top: 9px;"></div>
        this.x = fruitX;
        this.y = fruitY;
    }


    draw() {
        this.element.show();
        this.element.css({
            left: this.x,
            top: this.y,
        });

    }

    hits_food() {

        return (this.x < this.snake.x + this.snake.size && this.x + this.size > this.snake.x
            && this.y < this.snake.y + this.snake.size && this.y + this.size > this.snake.y
        );
    }

    remove() {
        this.element.remove();
    }

}


const game = new Game();
const snake = new Snake(game);
