console.log('ml5 version:', ml5.version);

let video;
let poseNet;
let poses = [];
let umbrellaImage;

let handX = 0; // Hand's x-coordinate
let handY = 0; // Hand's y-coordinate

let raindrops = [];

class Raindrop {
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.size = 10; // 비밥의 크기
    this.angle = 0; // 비밥의 기울기
    this.umbrellaHit = false; // 우산에 닿은 여부를 나타내는 플래그
  }

  fall() {
    this.y += this.speed;
    if (this.y > height) {
      this.y = random(-200, -100);
      this.x = random(width);
      this.umbrellaHit = false; // 비밥이 새로 떨어질 때 우산에 닿은 여부 초기화
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle); // 비밥의 기울기를 적용
    stroke(255, 95); // 흰색과 투명도
    strokeWeight(2);
    line(0, 0, 0, this.size); // 비밥을 선으로 표현 (세로로 떨어지는 선)
    pop();
  }

  // 비밥이 우산에 닿았는지 체크하는 함수
  checkCollision(umbrellaX, umbrellaY, umbrellaSize) {
    if (!this.umbrellaHit) {
      let d = dist(this.x, this.y, umbrellaX, umbrellaY);
      if (d < umbrellaSize / 2) {
        this.angle = random(-QUARTER_PI, QUARTER_PI); // -45도에서 45도 사이의 각도로 기울임
        this.umbrellaHit = true; // 우산에 닿은 상태로 플래그 설정
      }
    } else {
      // 우산이 움직였을 때, 우산과 충돌한 비밥은 다시 직선으로 떨어지도록 설정
      let d = dist(this.x, this.y, umbrellaX, umbrellaY);
      if (d >= umbrellaSize / 2) {
        this.angle = 0; // 다시 선으로 내리기
        this.umbrellaHit = false; // 우산과 충돌하지 않은 상태로 플래그 재설정
      }
    }
  }
}

function preload() {
  umbrellaImage = loadImage('umbrella.png');
  // Load the umbrella image file.
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);

  // 비밥 객체 초기화
  for (let i = 0; i < 100; i++) {
    raindrops.push(new Raindrop(random(width), random(-200, -100), random(1, 5)));
  }

  // Create a new poseNet
  poseNet = ml5.poseNet(video, modelLoaded);

  // Listen to new 'pose' events
  poseNet.on('pose', (results) => {
    poses = results;
  });

  video.hide();
}

function modelLoaded() {
  console.log('PoseNet Model Loaded!');
}

function gotPoses() {
  if (poses.length > 0) {
    // Get the hand's position from PoseNet.
    let hand = poses[0].pose.keypoints[9];
    handX = hand.position.x;
    handY = hand.position.y;
  }
}

function draw() {
  background(255);
  // Draw the video stream.
  translate(width, 0); // 화면을 오른쪽 끝으로 이동
  scale(-1, 1); // 좌우 반전을 적용
  image(video, 0, 0, width, height);

  gotPoses();

  // Draw the umbrella graphic around the hand's position.
  image(umbrellaImage, handX - 50, handY - 50, 200, 200);

  // Draw random raindrops.
  for (let i = 0; i < raindrops.length; i++) {
    raindrops[i].fall();
    raindrops[i].checkCollision(handX, handY, 200); // 우산의 크기를 200으로 고정
    raindrops[i].display();
  }
}
