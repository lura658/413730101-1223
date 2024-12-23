let spriteSheets = {
  character1: {},
  character2: {}
};

let character1 = {
  x: 100,
  y: 100,
  speed: 8,
  currentFrame: 0,
  currentAction: 'idle', // 預設動作
  facingLeft: false,  // 新增：面向左邊
  health: 100,        // 新增：生命值
  // 為每個動作設定不同的參數
  animations: {
    idle: {
      totalFrames: 3,
      frameWidth: 49,
      frameHeight: 97
    
    },
    walk: {
      totalFrames: 6,
      frameWidth: 57,
      frameHeight: 100
    },
    attack: {
      totalFrames: 10,
      frameWidth: 108,
      frameHeight: 130
    },
    jump: {
      totalFrames: 4,
      frameWidth: 121,
      frameHeight: 112
    },
    down: {
      totalFrames: 1,
      frameWidth: 97,
      frameHeight: 47
    }
  },
  isAttacking: false
};

let character2 = {
  x: 300,
  y: 110,
  speed: 10,
  currentFrame: 0,
  currentAction: 'idle',
  facingLeft: false,  // 新增：面向左邊
  health: 100,        // 新增：生命值
  animations: {
    idle: {
      totalFrames: 10,
      frameWidth: 84,
      frameHeight: 86
    },
    walk: {
      totalFrames: 6,
      frameWidth: 68,
      frameHeight: 109
    },
    attack: {
      totalFrames: 5,
      frameWidth: 151,
      frameHeight: 140
    },
    jump: {
      totalFrames: 5,
      frameWidth: 71,
      frameHeight: 120
    },
    down: {
      totalFrames: 1,
      frameWidth: 112,
      frameHeight: 59
    }
  },
  isAttacking: false
};

let gameOver = false;
let winner = null;
let groundY; // 地面高度
let backgroundImg;

// 添加縮放比例常數
const SCALE_FACTOR = 2.0; // 角色放大2倍

// 在全局變量區域添加特效陣列
let attackEffects = [];

// 新增字體變量
let customFont;

// 添加特效圖片變量
let effectImage;

// 在 preload 函數中載入字體
function preload() {
  // 載入字體
  customFont = loadFont('YuPearl-ExtraLight.ttf');  // 請確保有此字體檔案
  
  // 載入背景和特效圖片
  backgroundImg = loadImage('0.png');
  effectImage = loadImage('effect.png');  // 請確保有此圖片
  
  // 載入角色1的精靈圖
  spriteSheets.character1.idle = loadImage('all1-2.png');
  spriteSheets.character1.walk = loadImage('all1-1.png');
  spriteSheets.character1.attack = loadImage('all1-3.png');
  spriteSheets.character1.jump = loadImage('all1-4.png');
  spriteSheets.character1.down = loadImage('all1-5.png');

   // 載入角色2的精靈圖
   spriteSheets.character2.idle = loadImage('all2-1.png');
   spriteSheets.character2.walk = loadImage('all2-2.png');
   spriteSheets.character2.attack = loadImage('all2-3.png');
   spriteSheets.character2.jump = loadImage('all2-4.png');
   spriteSheets.character2.down = loadImage('all2-5.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(12);
  groundY = height * 0.7;
  
  // 修改初始位置
  character1.x = 100;
  character1.y = height * 0.6; // 設定在畫面60%的位置
  character2.x = width - 300;
  character2.y = height * 0.6;
}

function draw() {
  // 繪製背景
  if (backgroundImg) {
    image(backgroundImg, 0, 0, width, height);
  } else {
    background(220); // 如果圖片載入失敗，使用灰色背景
  }
  
  if (!gameOver) {
    // 處理兩個角色的移動和動作
    handleMovement(character1, true);
    handleMovement(character2, false);
    
    // 查碰撞並造成傷害
    checkCollision();
    
    // 檢查遊戲是否結束
    checkGameOver();
    
    // 更新和繪製攻擊特效
    updateAttackEffects();
  }
  
  // 繪製兩個角色
  drawCharacter(character1, spriteSheets.character1);
  drawCharacter(character2, spriteSheets.character2);
  
  // 如果遊戲結束，顯示獲勝訊息
  if (gameOver) {
    displayWinner();
  }
  
  // 在最後添加文字說明
  drawInstructions();
}

function handleMovement(character, useArrowKeys) {
  let isMoving = false;
  
  if (!character.isAttacking && !gameOver) {
    if (useArrowKeys) {
      // 左右移動
      if (keyIsDown(LEFT_ARROW)) {
        character.x -= character.speed;
        character.facingLeft = true;
        isMoving = true;
      }
      if (keyIsDown(RIGHT_ARROW)) {
        character.x += character.speed;
        character.facingLeft = false;
        isMoving = true;
      }
      // 上下移動
      if (keyIsDown(UP_ARROW)) {
        character.y = constrain(character.y - character.speed, 
                              height * 0.2,  // 限制上邊界為畫面20%處
                              height * 0.8); // 限制下邊界為畫面80%處
        isMoving = true;
      }
      if (keyIsDown(DOWN_ARROW)) {
        character.y = constrain(character.y + character.speed, 
                              height * 0.2,
                              height * 0.8);
        isMoving = true;
      }
    } else {
      // 左右移動
      if (keyIsDown(65)) { // A
        character.x -= character.speed;
        character.facingLeft = true;
        isMoving = true;
      }
      if (keyIsDown(68)) { // D
        character.x += character.speed;
        character.facingLeft = false;
        isMoving = true;
      }
      // 上下移動
      if (keyIsDown(87)) { // W
        character.y = constrain(character.y - character.speed, 
                              height * 0.2,
                              height * 0.8);
        isMoving = true;
      }
      if (keyIsDown(83)) { // S
        character.y = constrain(character.y + character.speed, 
                              height * 0.2,
                              height * 0.8);
        isMoving = true;
      }
    }
  }

  // 更新角色狀態
  if (character.health <= 0) {
    character.currentAction = 'down';
  } else if (character.isAttacking) {
    character.currentAction = 'attack';
  } else if (isMoving) {
    character.currentAction = 'walk';
  } else {
    character.currentAction = 'idle';
  }

  // 限制角色在畫面中
  const currentAnim = character.animations[character.currentAction];
  let scaledWidth = currentAnim.frameWidth * SCALE_FACTOR;
  character.x = constrain(character.x, 0, width - scaledWidth);
}

function drawCharacter(character, sprites) {
  const currentAnim = character.animations[character.currentAction];
  
  character.currentFrame = (character.currentFrame + 1) % currentAnim.totalFrames;

  if (character.isAttacking && character.currentFrame === currentAnim.totalFrames - 1) {
    character.isAttacking = false;
  }

  let currentSprite = sprites[character.currentAction];
  let sx = character.currentFrame * currentAnim.frameWidth;
  
  // 計算縮放後的尺寸
  let scaledWidth = currentAnim.frameWidth * SCALE_FACTOR;
  let scaledHeight = currentAnim.frameHeight * SCALE_FACTOR;
  
  push(); // 保存當前繪圖狀態
  
  if (character.facingLeft) {
    // 翻轉圖片，基準點為左下角
    translate(character.x + scaledWidth, character.y);
    scale(-1, 1);
    image(
      currentSprite,
      0,
      -scaledHeight,
      scaledWidth,
      scaledHeight,
      sx,
      0,
      currentAnim.frameWidth,
      currentAnim.frameHeight
    );
  } else {
    // 正常繪製，基準點為左下角
    image(
      currentSprite,
      character.x,
      character.y - scaledHeight,
      scaledWidth,
      scaledHeight,
      sx,
      0,
      currentAnim.frameWidth,
      currentAnim.frameHeight
    );
  }
  
  pop(); // 恢復繪圖狀態
  
  // 修改生命值條的位置
  drawHealthBar(character, scaledWidth, scaledHeight);
}

function drawHealthBar(character, scaledWidth, scaledHeight) {
  const barWidth = scaledWidth * 0.8; // 生命值條寬度為角色寬度的80%
  const barHeight = 10;
  const x = character.x;
  const y = character.y - scaledHeight - 15; // 生命值條位置上移
  
  // 繪製背景
  fill(255, 0, 0);
  rect(x, y, barWidth, barHeight);
  
  // 繪製當前生命值
  fill(0, 255, 0);
  rect(x, y, (character.health / 100) * barWidth, barHeight);
}

function keyPressed() {
  // 按R鍵重新開始遊戲
  if (keyCode === 82) { // R鍵
    restartGame();
    return;
  }

  if (!gameOver) {
    if (keyCode === 32 && !character1.isAttacking) {
      character1.isAttacking = true;
      character1.currentFrame = 0;
      let effectX = character1.x + (character1.facingLeft ? 0 : character1.animations.attack.frameWidth * SCALE_FACTOR);
      let effectY = character1.y - character1.animations.attack.frameHeight * SCALE_FACTOR * 0.5;
      //傷害值
      attackEffects.push(new AttackEffect(effectX, effectY, character1.facingLeft, 15, 10));
    }
    
    if (keyCode === 69 && !character2.isAttacking) {
      character2.isAttacking = true;
      character2.currentFrame = 0;
      let effectX = character2.x + (character2.facingLeft ? 0 : character2.animations.attack.frameWidth * SCALE_FACTOR);
      let effectY = character2.y - character2.animations.attack.frameHeight * SCALE_FACTOR * 0.5;
      //傷害值
      attackEffects.push(new AttackEffect(effectX, effectY, character2.facingLeft, 15, 10));
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function checkCollision() {
  if (character1.isAttacking && isHitting(character1, character2)) {
    character2.health = max(0, character2.health - 5);
  }
  if (character2.isAttacking && isHitting(character2, character1)) {
    character1.health = max(0, character1.health - 8);
  }
}

function isHitting(attacker, target) {
  const attackerAnim = attacker.animations[attacker.currentAction];
  const targetAnim = target.animations[target.currentAction];
  
  // 計算縮放後的碰撞箱
  let attackerWidth = attackerAnim.frameWidth * SCALE_FACTOR;
  let attackerHeight = attackerAnim.frameHeight * SCALE_FACTOR;
  let targetWidth = targetAnim.frameWidth * SCALE_FACTOR;
  let targetHeight = targetAnim.frameHeight * SCALE_FACTOR;
  
  return (
    attacker.x < target.x + targetWidth &&
    attacker.x + attackerWidth > target.x &&
    attacker.y - attackerHeight < target.y &&
    attacker.y > target.y - targetHeight
  );
}

function checkGameOver() {
  if (character1.health <= 0) {
    gameOver = true;
    winner = "角色2";
    character2.currentAction = 'idle';
    character1.currentAction = 'down';
  } else if (character2.health <= 0) {
    gameOver = true;
    winner = "角色1";
    character1.currentAction = 'idle';
    character2.currentAction = 'down';
  }
}

function displayWinner() {
  push();
  textFont(customFont);
  
  // 顯示獲勝文字
  textAlign(CENTER, CENTER);
  textSize(60);
  fill(255);
  stroke(255);
  strokeWeight(2);
  text(winner + " 獲勝！", width/2, height/2);
  
  // 繪製重新開始按鈕
  let buttonX = width/2;
  let buttonY = height/2 + 60;
  let buttonWidth = 200;
  let buttonHeight = 50;
  
  // 按鈕背景
  fill(0, 200, 0);
  stroke(255);
  strokeWeight(2);
  rectMode(CENTER);
  rect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
  
  // 按鈕文字
  fill(255);
  noStroke();
  textSize(30);
  text("重新開始", buttonX, buttonY);
  pop();
}

// 修改特效更新函數，添加碰撞檢測
function updateAttackEffects() {
  for (let i = attackEffects.length - 1; i >= 0; i--) {
    let effect = attackEffects[i];
    effect.update();
    effect.draw();
    
    // 檢查特效是否擊中角色
    if (!effect.hasHit) {
      // 檢查是否擊中角色1
      if (checkEffectHit(effect, character1) && effect.facingLeft) {
        character1.health = max(0, character1.health - effect.damage);
        effect.hasHit = true;
        effect.lifetime = 3; // 擊中後快速消失
      }
      // 檢查是否擊中角色2
      if (checkEffectHit(effect, character2) && !effect.facingLeft) {
        character2.health = max(0, character2.health - effect.damage);
        effect.hasHit = true;
        effect.lifetime = 3; // 擊中後快速消失
      }
    }
    
    // 移除特效的條件
    if (effect.lifetime <= 0 || 
        effect.x < 0 || 
        effect.x > width ||
        effect.size <= 0) {
      attackEffects.splice(i, 1);
    }
  }
}

// 新增特效碰撞檢測函數
function checkEffectHit(effect, character) {
  const charAnim = character.animations[character.currentAction];
  const charWidth = charAnim.frameWidth * SCALE_FACTOR;
  const charHeight = charAnim.frameHeight * SCALE_FACTOR;
  
  return (
    effect.x > character.x &&
    effect.x < character.x + charWidth &&
    effect.y > character.y - charHeight &&
    effect.y < character.y
  );
}

// 新增滑鼠點擊檢測函數
function mousePressed() {
  if (gameOver) {
    // 檢查是否點擊重新開始按鈕
    let buttonX = width/2;
    let buttonY = height/2 + 60;
    let buttonWidth = 200;
    let buttonHeight = 50;
    
    if (mouseX > buttonX - buttonWidth/2 && 
        mouseX < buttonX + buttonWidth/2 && 
        mouseY > buttonY - buttonHeight/2 && 
        mouseY < buttonY + buttonHeight/2) {
      restartGame();
    }
  }
}

// 新增重新開始遊戲函數
function restartGame() {
  // 重置遊戲狀態
  gameOver = false;
  winner = null;
  
  // 重置角色1
  character1.x = 100;
  character1.y = height * 0.6;
  character1.health = 100;
  character1.isAttacking = false;
  character1.currentFrame = 0;
  character1.currentAction = 'idle';
  character1.facingLeft = false;
  
  // 重置角色2
  character2.x = width - 300;
  character2.y = height * 0.6;
  character2.health = 100;
  character2.isAttacking = false;
  character2.currentFrame = 0;
  character2.currentAction = 'idle';
  character2.facingLeft = false;
  
  // 清空特效
  attackEffects = [];
}

// 新增繪製說明文字的函數
function drawInstructions() {
  push();
  textFont(customFont);
  textSize(25);
  fill(255);
  stroke(255);
  strokeWeight(2);
  
  // 左下角 - 角色1操作說明
  textAlign(LEFT, BOTTOM);
  text('角色1操作說明:\n← → ↑ ↓ : 移動\nSPACE : 攻擊', 20, height - 20);
  
  // 右下角 - 角色2操作說明
  textAlign(RIGHT, BOTTOM);
  text('角色2操作說明:\nWASD : 移動\nE : 攻擊', width - 20, height - 20);
  
  // 右上角 - 系所名稱
  textAlign(RIGHT, TOP);
  textSize(30);
  text('教育科技系', width - 20, 20);
  
  // 添加重製遊戲說明
  textAlign(CENTER, TOP);
  textSize(20);
  text('按 R 鍵重新開始遊戲', width/2, 20);
  
  pop();
}

// 修改 AttackEffect 類別，使用圖片
class AttackEffect {
  constructor(x, y, facingLeft, speed = 15, damage = 5) {
    this.x = x;
    this.y = y;
    this.facingLeft = facingLeft;
    this.lifetime = 15;
    this.size = 40;
    this.speed = facingLeft ? -speed : speed;
    this.damage = damage;
    this.hasHit = false;
    this.rotation = 0;  // 添加旋轉角度
  }

  update() {
    this.x += this.speed;
    this.lifetime--;
    this.rotation += 0.2;  // 更新旋轉角度
  }

  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    
    // 使用圖片繪製特效
    let alpha = map(this.lifetime, 15, 0, 255, 0);
    tint(255, alpha);
    imageMode(CENTER);
    image(effectImage, 0, 0, this.size, this.size);
    
    pop();
  }
}