const canvas = document.querySelector("canvas");


const pauseImage = new Image();
pauseImage.src = "pause.jpg";

function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();

let c = canvas.getContext("2d");

let bullets = [];
let bots = [];
let homingBots = [];
let circles = [];
let mouse = {x : 0, y : 0};

let bulletWidth = 10;
let bulletHeight = 14;
let health = 100;
let score = 0;
let botCount = 0;
let homingBotCount = 0;

let rightKeyPressed = false;
let leftKeyPressed = false;
let spaceWasPressed = false;
let gamePaused = false;
let gameOver = false;

function Circle(){
    this.x = Math.round(Math.random()*canvas.width);
    this.y = Math.round(Math.random()*canvas.height);
    this.r = 1.2;
    this.velocityX = (Math.random() - 0.5)*0.7;
    this.velocityY = (Math.random() - 0.5)*0.7;
    this.closeToMouse = false;

    this.draw = function(){
        c.beginPath();
        c.fillStyle = "white";
        c.arc(this.x, this.y, this.r, 0, Math.PI*2);
        c.fill();
    }

    this.update = function(){
        if (this.x + this.r > canvas.width || this.x < 0){
            this.velocityX = -this.velocityX;
        }
        if (this.y + this.r > canvas.height || this.y < 0){
            this.velocityY = -this.velocityY;
        }
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.draw();
    }
}

function drawHome(){
    c.fillStyle = "#EAF6F6";
    c.fillRect(canvas.width/2 - 70, canvas.height*0.7, 140, 70);
    c.fillStyle = "black";
    c.font = "30px Courier New";
    c.fillText("Home", canvas.width/2 - 35, canvas.height*0.77);
}

function drawHealthBar(){
    c.fillStyle = "white";
    c.fillRect(canvas.width*0.2, canvas.height*0.02, 200, 20);
    c.fillStyle = "green";
    c.fillRect(canvas.width*0.2, canvas.height*0.02, health*2, 20);
    c.fillStyle = "black";
    c.font = "20px Courier New";
    c.fillText(`${health} %`, canvas.width*0.2 + 80, canvas.height*0.02 + 16);
}

function drawScore(){
    c.fillStyle = "white";
    c.fillRect(canvas.width*0.6, canvas.height*0.02, 160, 20);
    c.fillStyle = "black";
    c.font = "20px Courier New";
    c.fillText(`Score: ${score}`, canvas.width*0.6 + 20, canvas.height*0.02 + 16);
}

function drawPauseButton(){
    c.drawImage(pauseImage, canvas.width*0.92, 0, 70, 70);
}
function Player(){
    this.x = Math.floor(Math.random()*canvas.width);
    this.y = canvas.height*0.85
    this.velocityX = 0;

    this.draw = function(){
        c.fillStyle = "blue";
        c.fillRect(this.x, this.y, 30, 40);
    }
    this.update = function (){
        if (rightKeyPressed === true){
            this.x += 5;
        }
        else if (leftKeyPressed === true){
            this.x -= 5;
        }
        if (this.x + 30 > canvas.width){
            this.x = canvas.width - 30;
        }
        if (this.x < 0){
            this.x = 0;
        }
        this.draw();
    }
}

let player = new Player();

function Bullet(x, velocityX, velocityY){
    this.x = x;
    this. y = canvas.height*0.85;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.time = 0;
    this.spacePressed = false;

    this.draw = function(){
        c.fillStyle = "yellow";
        c.fillRect(this.x, this.y, bulletWidth, bulletHeight);
    }

    this.update = function(){
        this.y -= this.velocityY;
        this.x += this.velocityX;
        if (this.spacePressed == false){
            c.globalAlpha = 1 - this.time/80;
            this.time += 1;
        }
        this.draw();
        c.globalAlpha = 1;
    }

}

function Bot(){
    this.x = Math.floor(Math.random()*canvas.width);
    this. y = canvas.height*0.1;
    this.velocityX = 0;
    this.velocityY = 3;
    this.homing = false;

    this.draw = function(){
        c.fillStyle = "red";
        c.fillRect(this.x, this.y, 16, 16);
    }

    this.update = function(){
        this.y += this.velocityY;
        this.x += this.velocityX;
        this.draw();
    }
}

function checkClick(mouseX, mouseY, x, y, width, height){
    return mouseX > x && mouseX < x + width && mouseY > y && mouseY < y + height;
}

function updateBullets(bullets){
    for (var i = 0; i < bullets.length; i++){
        if (bullets[i].y < 0){
            bullets.splice(i, 1);
        }
        else if (bullets[i].time >= 60){
            bullets.splice(i, 1);
        }
    }
}

function updateBots(){
    for (var i = 0; i < bots.length; i++){
        if (bots[i].y > canvas.height){
            bots.splice(i, 1);
        }
    }
    for (var i = 0; i < bots.length; i++){
        if (bots[i].homing == true){
            var speed = 3;
            var dx = player.x - bots[i].x;
            var dy = player.y - bots[i].y;
            var distance = (dx**2+dy**2)**0.5;
            bots[i].velocityX = speed*dx/distance;
            bots[i].velocityY = speed*dy/distance;
            if (bots[i].y >= player.y - 25){
                bots[i].velocityX = 0;
                bots[i].velocityY = 3;
            }
        }
    }
    for (var i = 0; i < bots.length; i++){
        if (bots[i].x >= player.x - 16 && bots[i].x <= player.x + 30 && bots[i].y <= player.y + 40 && bots[i].y >= player.y - 16) {
            bots.splice(i, 1);
            gameOver = true;
            break;
        }
    }
    for (var i = 0; i < bots.length; i++){
        if (bots[i].x >= canvas.width/2 - 70 - 16 && bots[i].x <= canvas.width/2 - 70 + 140 && bots[i].y <= canvas.height*0.7 + 70 && bots[i].y >= canvas.height*0.7 - 16) {
            bots.splice(i, 1);
            health -= 20;
            if (health <= 0){
                drawHealthBar();
                gameOver = true;
            }
            break;
        }
    }
    if (botCount % 20 == 0 && bots.length < 8){
        var bot = new Bot();
        bots.push(bot);
        console.log(bots);
    }
    if (homingBotCount % 300 == 0){
        var x = Math.random()*canvas.width;
        var y = 0
        for (var i = 0; i < 4; i++){
            var bot = new Bot();
            bot.x = x + i*10;
            bot.y = y + i*22;
            bot.homing = true;
            bots.push(bot);
        }
    }
    
    botCount += 1;
    homingBotCount +=1;
}

function handleGameOver(){
    alert("Game Over!");
    gameOver = false;
    window.location = "index.html";
}

document.addEventListener("keydown", function movePlayer(e){
    if ((e.key == "d" || e.key == "ArrowRight") && (player.x + 30 < canvas.width)){
        rightKeyPressed = true;
    }
    else if ((e.key == "a" || e.key == "ArrowLeft") && (player.x > 0)){
        leftKeyPressed = true;
    }
    else if (e.key == " "){
        if (!spaceWasPressed){
            spaceWasPressed = true;
            var bullet = new Bullet(player.x + 15, 0, 8);
            bullet.spacePressed = true;
            bullets.push(bullet);
        }
    }
    
});

document.addEventListener("keyup", (e) => {
    if (e.key == "d" || e.key == "ArrowRight"){
        rightKeyPressed = false;
    }
    else if (e.key == "a" || e.key == "ArrowLeft"){
        leftKeyPressed = false;
    }
    if (e.key == " "){
        spaceWasPressed = false;
    }
})

document.addEventListener("mousedown", function fireBullets(e){
    var angle = Math.atan((player.y - e.y)/(player.x - e.x));
    var vX = 8*Math.cos(angle);
    var vY = Math.abs(8*Math.sin(angle));
    
    if (checkClick(e.x, e.y, canvas.width*0.92, 0, 70, 70)){
        gamePaused = !gamePaused;
        return;
    }
    if (angle > 0){
        vX = -vX;
    }
    if (e.y < player.y){
        var bullet = new Bullet(player.x + 15, vX, vY);
        bullets.push(bullet);
    }
});

document.addEventListener("mousemove", (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
    if (checkClick(e.x, e.y, canvas.width*0.92, 0, 70, 70)){
        document.querySelector("body").style.cursor = "pointer";
    }
    else{
        document.querySelector("body").style.cursor = "auto";
    }
});

for (var i = 0; i < 120; i++){
    var circle = new Circle();
    circles.push(circle);
}

function animate(){
    requestAnimationFrame(animate);

    resizeCanvas();

    c.clearRect(0, 0, canvas.width, canvas.height);

    if (gameOver){
        handleGameOver();
    }

    circles.forEach((circle) => {
        if (Math.abs(circle.x - mouse.x) < 70 && Math.abs(circle.y - mouse.y) < 70){
            var speed = 0.9;
            var dx = mouse.x - circle.x;
            var dy = mouse.y - circle.y;
            var distance = (dx**2+dy**2)**0.5;
            circle.velocityX = speed*dx/distance;
            circle.velocityY = speed*dy/distance;
            circle.closeToMouse = true;
        }
        else if (circle.closeToMouse){
            circle.closeToMouse = false;
            circle.velocityX = Math.random() - 0.5;
            circle.velocityY = Math.random() - 0.5;
        }
        
        circle.update();
    });

    drawHome();
    drawHealthBar();
    drawScore();
    drawPauseButton();

    if (gamePaused == true){
        bots.forEach((bot) => {
            bot.draw();
        });
        bullets.forEach((bot) => {
            bullet.draw();
        })
        player.draw();

        return;
    }

    player.update();

    updateBullets(bullets);
    updateBots();

    /*bullets.forEach((bullet) => {
        bullet.update();
    });*/

    bots.forEach((bot) => {
        bot.update();
    })
    
    for (var i = 0; i < bullets. length; i++){

        bullets[i].update();

        for (var j = 0; j < bots.length; j++){
            if (bullets[i].x >= bots[j].x - 10 && bullets[i].x <= bots[j].x + 16 && bullets[i].y <= bots[j].y + 16 && bullets[i].y >= bots[j].y) {
                bots.splice(j, 1);
                bullets.splice(i, 1);
                score += 10;
                break;
            }
        }
    }
}

animate();