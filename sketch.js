let myvideo;
let vScale;
let phrase = ["豆", "包", "A", "I", "生", "成"];
let streams = [];
let numStreams = 90;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, TOP);
  textFont("monospace");
  pixelDensity(1);

  if (width < height) {
    vScale = width / 30;
  } else {
    vScale = height / 30;
  }

  myvideo = createCapture(VIDEO, { flipped: true });
  myvideo.size(width / vScale, height / vScale);
  myvideo.hide();

  for (let i = 0; i < numStreams; i++) {
    let x = map(i, 0, numStreams - 1, vScale / 2, width - vScale / 2);
    streams.push(new Stream(x));
  }
}

function draw() {
  background(0, 100);
  myvideo.loadPixels();

  for (let s of streams) {
    s.update(myvideo);
    s.show();
  }
}

// ───────────────────────────────
class Stream {
  constructor(x) {
    this.x = x;
    this.yOffset = random(-height, 0);
    this.speed = random(3, 8);
    this.vScale = vScale * random(0.8, 1.2);
    this.isWhite = random() < 0.1;
    this.symbols = [];

    let totalSymbols = int(random(8, 16));
    for (let i = 0; i < totalSymbols; i++) {
      let ch = phrase[i % phrase.length];
      let y = i * this.vScale * 1.5 + this.yOffset;
      this.symbols.push(
        new Glyph(ch, this.x, y, this.speed, this.vScale, this.isWhite)
      );
    }
  }

  update(video) {
    for (let sym of this.symbols) {
      sym.update(video);
    }

    if (this.symbols[this.symbols.length - 1].y > height + this.vScale * 8) {
      let offset = random(-height, 0);
      for (let i = 0; i < this.symbols.length; i++) {
        this.symbols[i].y = i * this.vScale * 1.5 + offset;
      }
    }
  }

  show() {
    for (let sym of this.symbols) {
      sym.show();
    }
  }
}

// ───────────────────────────────
class Glyph {
  constructor(ch, x, y, speed, vScale, isWhite) {
    this.ch = ch;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.vScale = vScale;
    this.size = this.vScale * 1.5;
    this.brightness = 255;
    this.isWhite = isWhite;
  }

  update(video) {
    this.y += this.speed;

    let vx = int(map(this.x, 0, width, 0, video.width));
    let vy = int(map(this.y, 0, height, 0, video.height));
    let index = (vx + vy * video.width) * 4;

    if (index >= 0 && index < video.pixels.length - 3) {
      let r = video.pixels[index];
      let g = video.pixels[index + 1];
      let b = video.pixels[index + 2];
      let bright = (r + g + b) / 3;
      this.brightness = map(bright, 0, 255, 50, 255);
    }
  }

  show() {
    if (this.isWhite) {
      fill(this.brightness); // still responsive to camera
    } else {
      fill(0, this.brightness, 0);
    }
    textSize(this.size);
    text(this.ch, this.x, this.y);
  }
}

function keyPressed() {
  if (key === "s") {
    saveCanvas("matrix_phrase", "jpg");
  }
}
