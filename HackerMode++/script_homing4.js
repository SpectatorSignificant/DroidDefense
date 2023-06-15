const canvas = document.querySelector("canvas");

const pauseImage = new Image();
pauseImage.src = "pause.jpg";

const gameOverSound = new Audio("gameover.wav");
const hitSound = new Audio("hit.wav");

function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();

let c = canvas.getContext("2d");

let bullets = [];
let bots = [];
let homingBots = [];
let shootingBots = [];
let powerUps = [];
let circles = [];
let mouse = {x : 0, y : 0};
//localStorage.setItem("users",JSON.stringify([]));
//localStorage.removeItem("users");
let leaderboard = JSON.parse(localStorage.getItem("users")) || [];

let bulletWidth = 10;
let bulletHeight = 14;
let botWidth = 16;
let botHeight = 16;
let missileWidth = 20;
let missileHeight = 40;
let homeWidth = 140;
let homeHeight = 70;
let health = 100;
let bossHealth = 2000;
let score = 0;
let homeCount = 0;
let botCount = 0;
let homingBotCount = 0;
let shootingBotCount = 0;
let bossBotCount = 0;
let powerUpCount = 1;
let bulletSpeed = 8;
let botSpeed = 2;
let missileSpeed = 6;
let pinkBotSpeed = 4;

let rightKeyPressed = false;
let leftKeyPressed = false;
let upKeyPressed = false;
let downKeyPressed = false;
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
    c.fillRect(canvas.width/2 - homeWidth/2, canvas.height*0.7, 140, homeHeight);
    c.fillStyle = "black";
    c.fillStyle = "grey";
    c.fillRect(canvas.width/2 - homeWidth/2 + 65, canvas.height*0.7 -24, 10, 24);
    c.font = "30px Courier New";
    c.fillText("Home", canvas.width/2 - 35, canvas.height*0.77);
}

function drawHealthBar(){
    c.fillStyle = "white";
    c.fillRect(canvas.width*0.1, canvas.height*0.02, 200, 20);
    c.fillStyle = "green";
    c.fillRect(canvas.width*0.1, canvas.height*0.02, health*2, 20);
    c.fillStyle = "black";
    c.font = "20px Courier New";
    if (health < 0){
        health = 0;
    }
    c.fillText(`Home: ${health} %`, canvas.width*0.1 + 40, canvas.height*0.02 + 16);
}

function drawBossHealth(){
    c.fillStyle = "white";
    c.fillRect(canvas.width*0.42, canvas.height*0.02, 200, 20);
    c.fillStyle = "red";
    c.fillRect(canvas.width*0.42, canvas.height*0.02, bossHealth/10, 20);
    c.fillStyle = "black";
    c.font = "20px Courier New";
    c.fillText(`Boss: ${bossHealth/20} %`, canvas.width*0.42 + 40, canvas.height*0.02 + 16);
}

function drawScore(){
    c.fillStyle = "white";
    c.fillRect(canvas.width*0.7, canvas.height*0.02, 160, 20);
    c.fillStyle = "black";
    c.font = "20px Courier New";
    c.fillText(`Score: ${score}`, canvas.width*0.7 + 20, canvas.height*0.02 + 16);
}

function drawPauseButton(){
    c.drawImage(pauseImage, canvas.width*0.92, 0, 70, 70);
}

function drawLeaderboard(){
    c.fillStyle = "#EAF6F6";
    c.font = "30px Courier New";
    c.fillText("Leaderboard", canvas.width*0.435, canvas.height*0.2);
    for (var i = 0; i < leaderboard.length; i++){
        c.fillStyle = "#EAF6F6";
        c.fillRect(canvas.width*0.4, canvas.height*0.25 + 30*i, 300, 50);
        c.fillStyle = "black";
        c.font = "20px Courier New";
        c.fillText(`${leaderboard[i][1]} ${leaderboard[i][0]}`, canvas.width*0.42, canvas.height*0.25 + 30*i + 25);
    }
}

function updateLeaderboard(){
    leaderboard.push([score, username]);
    leaderboard.sort((a,b) => {return a[0]-b[0]});
    leaderboard.reverse();
    if (leaderboard.length > 10){
        while (leaderboard.length != 10){
            leaderboard.pop();
        }
    }
    localStorage.setItem("users", JSON.stringify(leaderboard));
}
function Home(){
    this.x = canvas.width/2 - homeWidth/2;
    this.y = canvas.height*0.7;
    this.newAngle = 0;
    this.draw = function(){     
        c.translate(this.x + homeWidth/2, this.y + 24);
        c.rotate((this.newAngle));
        c.translate(- this.x - homeWidth/2, - this.y - 24);
        c.fillStyle = "#EAF6F6";
        c.fillRect(this.x, this.y, homeWidth, homeHeight);
        c.fillStyle = "black";
        c.fillStyle = "grey";
        c.fillRect(this.x + 65, this.y -24, 10, 24);
        c.font = "30px Courier New";
        c.fillText("Home", this.x + 35, this.y + canvas.height*0.07);
        c.translate(this.x + homeWidth/2, this.y + 24);
        c.rotate(-(this.newAngle));
        c.translate(- this.x - homeWidth/2, - this.y - 24);
    }

}
let home = new Home();

function Player(){
    this.x = Math.floor(Math.random()*canvas.width);
    this.y = canvas.height*0.85
    this.velocityX = 0;
    this.newAngle = 0;

    this.draw = function(){
        c.translate(this.x + 10, this.y - 20);
        c.rotate((this.newAngle));
        c.translate(- this.x - 10, - this.y + 20);
        c.fillStyle = "grey";
        c.fillRect(this.x + 10, this.y - 24, 10, 24);
        c.fillStyle = "blue";
        c.fillRect(this.x, this.y, 30, 40);
        c.translate(this.x + 10, this.y - 20);
        c.rotate(-(this.newAngle));
        c.translate(- this.x - 10, - this.y + 20);
        
    }
    this.update = function (){
        if (rightKeyPressed === true){
            this.x += 5;
        }
        else if (leftKeyPressed === true){
            this.x -= 5;
        }
        else if (upKeyPressed === true){
            this.y -= 5;
        }
        else if (downKeyPressed === true){
            this.y += 5;
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

function Bullet(velocityX, velocityY){
    this.x = player.x + 10;
    this.y = player.y - 24 - bulletHeight;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.time = 0;
    this.spacePressed = false;
    this.falling = false;
    this.color = "yellow"

    this.draw = function(){
        c.fillStyle = this.color;
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
    this.speed = botSpeed;
    this.velocityX = 0;
    this.velocityY = this.speed;
    this.homing = false;
    this.color = "red"
    this.damage = 1;
    this.width = botWidth;
    this.height = botHeight;

    this.draw = function(){
        c.fillStyle = this.color;
        c.fillRect(this.x, this.y, this.width, this.height);
    }

    this.update = function(){
        this.y += this.velocityY;
        this.x += this.velocityX;
        this.draw();
    }
}

function ShootingBot(p, q){
    this.x = canvas.width*p + Math.floor(Math.random()*canvas.width*(q - p));
    this. y = canvas.height*0.1;
    this.time = 1;
    this.currentAngle = 0;
    this.newAngle = 0;

    this.draw = function(){
        c.translate(this.x + 16, this.y + 16);
        c.rotate((this.newAngle));
        c.translate(- this.x - 16, - this.y - 16);
        c.fillStyle = "red";
        c.fillRect(this.x, this.y, 32, 32);
        c.fillStyle = "grey";
        c.fillRect(this.x + 11, this.y + 32, 10, 24);
        c.translate(this.x + 16, this.y + 16);
        c.rotate(-(this.newAngle));
        c.translate(- this.x - 16, - this.y - 16);
        //this.currentAngle = this.newAngle;
        //this.newAngle = 0;
        //c.rotate(-Math.PI/2);
        this.time += 1;
    }
}

function BossBot(){
    this.x = canvas.width/2 - 30;
    this. y = canvas.height*0.1;
    this.time = 0;
    this.dead = false;
    this.newAngle = 0;

    this.draw = function(){
        c.translate(this.x + 30, this.y + 54);
        c.rotate((this.newAngle));
        c.translate(- this.x - 30, - this.y - 54);
        c.fillStyle = "red";
        c.fillRect(this.x, this.y, 60, 60);
        c.fillStyle = "white";
        c.font = "20px Courier New";
        c.fillText("BOSS", this.x + 5, this.y + 30);
        c.fillStyle = "grey";
        c.fillRect(this.x + 25, this.y + 60, 10, 24);
        c.translate(this.x + 30, this.y + 54);
        c.rotate((this.newAngle));
        c.translate(- this.x - 30, - this.y - 54);
        //this.currentAngle = this.newAngle;
        //this.newAngle = 0;
        //c.rotate(-Math.PI/2);
        this.time += 1;
    }
}

function PowerUp(){
    this.r = 20;
    this.x = Math.floor(Math.random()*canvas.width);
    this.y = canvas.height*0.15 + Math.round(Math.random()*canvas.height*0.38);
    this.power = 0;
    this.time = 0;
    this.color = 'orange';
    this.hit = false;

    this.draw = function(){
        c.fillStyle = this.color;
        c.arc(this.x, this.y, this.r, 0, 2*Math.PI);
        c.fill();
        //c.fillRect(this.x, this.y, 10, 10);
        c.fillStyle = "white";
        c.font = "12px Courier New";
        if (this.power == 0){
            c.fillText("clear", this.x - 18, this.y + 2);
        }
        //else if (this.power == 1){
        //    c.fillText("freeze", this.x - 10, this.y);
        //}
    }

    this.update = function(){
        this.time += 1;
        this.draw()
        if (this.power == 0 && this.hit){
            hitSound.play();
            for (var i = 0; bots.length > 0; i++) {
                bots.pop();
                score += 10;
                hitSound.play();
            }
            for (var i = 0; shootingBots.length > 0; i++) {
                shootingBots.pop();
                score += 30;
                hitSound.play();
            }
            //return [10, 0.5, 0.5];
            //bulletSpeed = 10;
            //botSpeed = 0.5;
            //pinkBotSpeed = 0.5;
            //this.time += 1;
        }

        //if (this.time >= 5000){
            //return [8, 2, 4];
            //bulletSpeed = 8;
            //botSpeed = 2;
            //pinkBotSpeed = 4;
        //}
        //return
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
function updateHome(){
    //console.log(homeCount);
    if (homeCount % 20 == 0){
        for (var i = 0; i < bots.length; i++){
            if ((((bots[i].x - home.x - homeWidth/2)**2+(bots[i].y - home.y)**2)**0.5) < 150 && bots[i].y < home.y - 20){
                console.log('hello');
                var dX = bots[i].x - home.x - homeWidth/2;
                var dY = bots[i].y - home.y;
                var distance = ((bots[i].x - home.x - homeWidth/2)**2+(bots[i].y - home.y)**2)**0.5;
                var angle = Math.atan(dX / dY);
                var velocityX = bulletSpeed*dX/distance;
                var velocityY = -bulletSpeed*dY/distance;
                var bullet = new Bullet(velocityX, velocityY);
                bullet.x = home.x + homeWidth/2 - bulletWidth/2
                bullet.y = home.y + 24;
                bullet.spacePressed = true;
                bullets.push(bullet);
                //if (dX < 0){
                //    home.newAngle = - Math.PI/2 + angle;
                //}
                //else{
                //    home.newAngle =  Math.PI/2 + angle;
                //}
                //home.newAngle = Math.atan(dY / dX);
                console.log(home.newAngle);
            }
        }
    }
    //else{
    //    home.newAngle = 0;
    //}
    home.draw();
    homeCount += 1;
}

function updateBots(){
    for (var i = 0; i < bots.length; i++){
        if (bots[i].y > canvas.height){
            bots.splice(i, 1);
        }
    }
    for (var i = 0; i < bots.length; i++){
        if (bots[i].homing == true){
            var dX = player.x - bots[i].x;
            var dY = player.y - bots[i].y;
            var distance = (dX**2+dY**2)**0.5;
            bots[i].velocityX = bots[i].speed*dX/distance;
            bots[i].velocityY = bots[i].speed*dY/distance;
            if (bots[i].y >= player.y - bots[i].height){
                bots[i].velocityX = 0;
                bots[i].velocityY = 3;
            }
        }
    }
    for (var i = 0; i < bots.length; i++){
        if ((bots[i].x >= player.x - bots[i].width && bots[i].x <= player.x + 30 && bots[i].y <= player.y + 40 && bots[i].y >= player.y - bots[i].height) || (bots[i].x >= player.x + 10 - bots[i].width && bots[i].x <= player.x + 20 && bots[i].y <= player.y && bots[i].y >= player.y - 24 - bots[i].height)) {
            bots.splice(i, 1);
            gameOver = true;
            break;
        }
    }
    for (var i = 0; i < bots.length; i++){
        if (bots[i].x >= canvas.width/2 - homeWidth/2 - bots[i].width && bots[i].x <= canvas.width/2 - homeWidth/2 + 140 && bots[i].y <= canvas.height*0.7 + homeHeight && bots[i].y >= canvas.height*0.7 - bots[i].height) {
            health -= 10*bots[i].damage;
            bots.splice(i, 1);
            if (health <= 0){
                drawHealthBar();
                gameOver = true;
            }
            break;
        }
    }
    if (botCount % 20 == 0 && bots.length < 4){
        var bot = new Bot();
        bots.push(bot);
    }
    if (homingBotCount % 600 == 0){
        var x = Math.random()*canvas.width;
        var y = 0
        for (var i = 0; i < 3; i++){
            var bot = new Bot();
            bot.x = x + i*10;
            bot.y = y + i*22;
            bot.homing = true;
            bot.color = "cyan";
            bots.push(bot);
        }
    }
    for (var i = 0; i < bullets. length; i++){
        bullets[i].update();

        for (var j = 0; j < bots.length; j++){
            if (bullets[i].x >= bots[j].x - 10 && bullets[i].x <= bots[j].x + bots[j].width && bullets[i].y <= bots[j].y + bots[j].height && bullets[i].y >= bots[j].y) {
                bots.splice(j, 1);
                bullets.splice(i, 1);
                hitSound.play();
                score += 10;
                break;
            }
        }
    }
    botCount += 1;
    homingBotCount +=1;
}

let bossBot = new BossBot();
function updateBossBot(bossBot){
    if (bossHealth > 0){
        bossBot.draw();
    }
    for (var j = 0; j < bullets.length && bossHealth > 0; j++){
        if ((bullets[j].x >= bossBot.x - bulletWidth && bullets[j].x <= bossBot.x + 60 && bullets[j].y <= bossBot.y + 60 && bullets[j].y >= bossBot.y - bulletHeight) || (bullets[j].x >= bossBot.x + 25 - bulletWidth && bullets[j].x <= bossBot.x + 25 + 10 && bullets[j].y <= bossBot.y + 60 + 24 && bullets[j].y >= bossBot.y + 60 - bulletHeight)){
            bullets.splice(j, 1);
            bossHealth -= 10;
            if (bossHealth <= 0 &&bossBot.dead == false){
                score += 100;
                bossBot.dead = true;
            }
            hitSound.play();
        }
    }
    if (bossBot.time % 100 == 0 && bossBot.dead == false){
        if (bossBotCount % 3 == 0){
            //var dX = bossBot.x + 30 - player.x;
            //var dY = bossBot.y + 60 + 24 - player.y;
            //var distance = (dX**2+dY**2)**0.5;
            var bot = new Bot();
            bot.x = bossBot.x + 30 - bulletWidth/2
            bot.y = bossBot.y + 84;
            bot.damage = 2;
            //bot.velocityX = -pinkBotSpeed*dX/distance;
            //bot.velocityY = -pinkBotSpeed*dY/distance;
            //bot.color = "pink";
            bots.push(bot);
            bossBot.newAngle = 0;
        }
        else{
            //for (var i = 0; i < 2; i++){
                var dX = bossBot.x + 30 - player.x;
                var dY = bossBot.y + 60 + 24 - player.y;
                var bot = new Bot();
                bot.x = bossBot.x + 30;
                bot.y = bossBot.y + 84;
                bot.homing = true;
                bot.color = "cyan";
                bot.speed = missileSpeed;
                bot.width = missileWidth;
                bot.height = missileHeight;
                bot.damage = 4;
                bots.push(bot);
                bossBot.newAngle = - Math.atan(dX/dY);
            //}
        }
    }
    bossBotCount += 1;
}

function updateShootingBots(shootingBots){
    //console.log(shootingBots.length);
    if (shootingBots.length == 0){
        var shootingBot = new ShootingBot(0, 0.4);
        shootingBots.push(shootingBot); 
        var shootingBot = new ShootingBot(0.6, 1);
        shootingBots.push(shootingBot); 
        
    }

    for (var i = 0; i < shootingBots.length; i++){
        if(shootingBots[i].time % (100 + 90*i) == 0 && shootingBots[i].time % 200 != 0 && shootingBots[i].time % 380 != 0){

            var dX = shootingBots[i].x + 16 - player.x;
            var dY = shootingBots[i].y + 44 - player.y;
            var distance = (dX**2+dY**2)**0.5;
            var bot = new Bot();
            bot.x = shootingBots[i].x + 16 - botWidth/2
            bot.y = shootingBots[i].y + 44;
            bot.speed = pinkBotSpeed;
            bot.velocityX = -bots[i].speed*dX/distance;
            bot.velocityY = -bots[i].speed*dY/distance;
            bot.color = "pink";
            bots.push(bot);
            shootingBots[i].newAngle = - Math.atan(dX/dY);

        }
        
        shootingBots[i].draw();
        for (var j = 0; j < bullets.length && shootingBots.length > 0; j++){
            if ((bullets[j].x >= shootingBots[i].x - bulletWidth && bullets[j].x <= shootingBots[i].x + 32 && bullets[j].y <= shootingBots[i].y + 32 && bullets[j].y >= shootingBots[i].y - bulletHeight) || (bullets[j].x >= shootingBots[i].x + 11 - bulletWidth && bullets[j].x <= shootingBots[i].x + 11 + 10 && bullets[j].y <= shootingBots[i].y + 32 + 24 && bullets[j].y >= shootingBots[i].y + 32 - bulletHeight)){
                shootingBots.splice(i, 1);
                bullets.splice(j, 1);
                hitSound.play();
                score += 30;
            }
        }
    }
    
    shootingBotCount += 1
    
}

function updatePowerUps(powerUps){
    console.log(powerUpCount)
    if (powerUpCount % 600 == 0 && powerUps.length < 1){
        for (var i = 0; i < 1; i++){
            var powerUp = new PowerUp();
            powerUps.push(powerUp);
        }
    }
    for (var i = 0; i < powerUps.length; i++){
        powerUps[i].draw();
        for (var j = 0; j < bullets.length; j++){
            if (((bullets[j].x + bulletWidth/2 - powerUps[i].x)**2 + (bullets[j].y + bulletHeight/2 - powerUps[i].y)**2)**0.5 <= powerUps[i].r){
                powerUps[i].hit = true;
            }
        }
        powerUps[i].update();
        if (powerUps[i].time >= 1000 || powerUps[i].hit){
            powerUps.splice(i, 1);
            break;
        }
    }
    powerUpCount += 1;
}

function updateCircles(circles){
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

            for (var i = 0; i < circles.length; i++){
                for (var j = i + 1; j < circles.length; j++){
                    if (circles[i].x == circles[j].x && circles[i].y == circles[j].y){
                        var vX = circles[i].velocityX;
                        var vY = circles[i].velocityY;
                        circles[i].velocityX = circles[j].velocityX;
                        circles[i].velocityY = circles[j].velocityY;
                        circles[j].velocityX = vX;
                        circles[j].velocityY = vY;
                    }
                }
            }
        }
        
        circle.update();
    });
}

function handleGameOver(){
    //gameOverSound.play();
    setTimeout(gameOverSound.play(), 100);
    updateLeaderboard();

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
    else if ((e.key == "w" || e.key == "ArrowUp") && (player.y >= canvas.height*0.72)){
        upKeyPressed = true;
    }
    else if ((e.key == "s" || e.key == "ArrowDown") && (player.y <= canvas.height*0.85)){
        downKeyPressed = true;
    }
    else if (e.key == " "){
        if (!spaceWasPressed){
            spaceWasPressed = true;
            var bullet = new Bullet(0, 8);
            bullet.spacePressed = true;
            bullets.push(bullet);
        }
    }
    else{
        leftKeyPressed = false;
        rightKeyPressed = false;
        upKeyPressed = false;
        downKeyPressed = false;
    }
    if (player.x < 0){
        leftKeyPressed = false;
    }
    if (player.x + 30 > canvas.width){
        rightKeyPressed = false;
    }
    if (player.y >= canvas.height*0.85){
        downKeyPressed = false;
    }
    if (player.y <= canvas.height*0.72){
        upKeyPressed = false;
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key == "d" || e.key == "ArrowRight"){
        rightKeyPressed = false;
    }
    else if (e.key == "a" || e.key == "ArrowLeft"){
        leftKeyPressed = false;
    }
    else if (e.key == "w" || e.key == "ArrowUp") {
        upKeyPressed = false;
    }
    else if (e.key == "s" || e.key == "ArrowDown"){
        downKeyPressed = false;
    }
    if (e.key == " "){
        spaceWasPressed = false;
    }
})

document.addEventListener("mousedown", function fireBullets(e){
    var dX = e.x - (player.x + 15);
    var dY = e.y - (player.y - 24);
    var angle = Math.atan(dY / dX);
    var vX = bulletSpeed*Math.cos(angle);
    var vY = Math.abs(bulletSpeed*Math.sin(angle));
    
    if (checkClick(e.x, e.y, canvas.width*0.92, 0, 70, 70)){
        gamePaused = !gamePaused;
        return;
    }
    if (angle > 0){
        vX = -vX;
    }
    if (e.y < player.y - 24){
        if (dX < 0){
            player.newAngle = - Math.PI/2 + angle;
        }
        else{
            player.newAngle =  Math.PI/2 + angle;
        }
        var bullet = new Bullet(vX, vY);
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
updateCircles(circles);

let username = prompt("Enter your username: ", "Guest");

function animate(){
    requestAnimationFrame(animate);

    resizeCanvas();

    c.clearRect(0, 0, canvas.width, canvas.height);

    if (gameOver){
        handleGameOver();
    }

    updateCircles(circles);

    //shootingBots[0].draw();
    //for (var i = 0; i < shootingBots.length; i++){
    //    shootingBots[i].draw();
    //}

    drawPauseButton();
    if (gamePaused == true){
        //bots.forEach((bot) => {
        //    bot.draw();
        //});
        //bullets.forEach((bot) => {
        //    bullet.draw();
        //})
        //player.draw();
        drawLeaderboard();
        return;
    }
    
    //home.draw();
    drawHealthBar();
    drawBossHealth();
    drawScore();
    
    player.update();
    updateBullets(bullets);
    updateBots();
    bots.forEach((bot) => {
        bot.update();
    })
    updateHome(home);
    updateShootingBots(shootingBots);
    updateBossBot(bossBot);
    updatePowerUps(powerUps);

    /*for (var i = 0; i < bullets. length; i++){
        bullets[i].update();

        for (var j = 0; j < bots.length; j++){
            if (bullets[i].x >= bots[j].x - 10 && bullets[i].x <= bots[j].x + 16 && bullets[i].y <= bots[j].y + 16 && bullets[i].y >= bots[j].y) {
                bots.splice(j, 1);
                bullets.splice(i, 1);
                hitSound.play();
                score += 10;
                break;
            }
        }
    }*/
}

animate();