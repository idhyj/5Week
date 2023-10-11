// Print ml5 library version to the console
console.log('ml5 version:', ml5.version);

// Declare variables for video capture, PoseNet, poses, umbrella image, hand coordinates, and raindrops array
let video;
let poseNet;
let poses = [];
let umbrellaImage;

let handX = 0; // X-coordinate of the hand
let handY = 0; // Y-coordinate of the hand

let raindrops = []; // Array to store raindrop objects

// Class representing a raindrop
class Raindrop {
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.size = 10; // Size of the raindrop
    this.angle = 0; // Angle of the raindrop
    this.umbrellaHit = false; // Flag indicating if the raindrop hit the umbrella
  }

  // Function to make raindrop fall
  fall() {
    this.y += this.speed;
    if (this.y > height) {
      this.y = random(-200, -100);
      this.x = random(width);
      this.umbrellaHit = false; // Reset umbrella hit flag when raindrop falls again
    }
  }

  // Function to display raindrop
  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle); // Apply angle to raindrop
    stroke(255, 95); // White color with transparency
    strokeWeight(2);
    line(0, 0, 0, this.size); // Represent raindrop as a line (falling vertically)
    pop();
  }

  // Function to check if raindrop hits the umbrella
  checkCollision(umbrellaX, umbrellaY, umbrellaSize) {
    if (!this.umbrellaHit) {
      let d = dist(this.x, this.y, umbrellaX, umbrellaY);
      if (d < umbrellaSize / 2) {
        this.angle = random(-QUARTER_PI, QUARTER_PI); // Tilt raindrop between -45 to 45 degrees
        this.umbrellaHit = true; // Set umbrella hit flag
      }
    } else {
      let d = dist(this.x, this.y, umbrellaX, umbrellaY);
      if (d >= umbrellaSize / 2) {
        this.angle = 0; // Reset to vertical position
        this.umbrellaHit = false; // Reset umbrella hit flag
      }
    }
  }
}

// Preload function to load umbrella image
function preload() {
  umbrellaImage = loadImage('umbrella.png');
}

// Setup function to initialize canvas and PoseNet
function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);

  // Initialize raindrop objects
  for (let i = 0; i < 100; i++) {
    raindrops.push(new Raindrop(random(width), random(-200, -100), random(1, 5)));
  }

  // Create a new PoseNet object
  poseNet = ml5.poseNet(video, modelLoaded);

  // Listen to new 'pose' events
  poseNet.on('pose', (results) => {
    poses = results;
  });

  video.hide();
}

// Callback function when PoseNet model is loaded
function modelLoaded() {
  console.log('PoseNet Model Loaded!');
}

// Function to get hand coordinates from PoseNet
function gotPoses() {
  if (poses.length > 0) {
    let hand = poses[0].pose.keypoints[9];
    handX = hand.position.x;
    handY = hand.position.y;
  }
}

// Draw function to render video stream, umbrella, and raindrops
function draw() {
  background(255);
  // Draw the video stream (flip horizontally)
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);

  gotPoses(); // Get hand coordinates from PoseNet

  // Draw umbrella graphic around the hand's position
  image(umbrellaImage, handX - 50, handY - 50, 200, 200);

  // Update and display raindrops
  for (let i = 0; i < raindrops.length; i++) {
    raindrops[i].fall();
    raindrops[i].checkCollision(handX, handY, 200); // Umbrella size fixed at 200
    raindrops[i].display();
  }
}
