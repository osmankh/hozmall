import * as p5 from 'p5/lib/p5.min';

export default class Circle {
  constructor(x, y, r, item, World, Bodies) {
    this.x = x;
    this.y = y;
    this.img = item.image;
    this.url = item.url;
    this.body = Bodies.circle(x, y, r, options);
    this.r = r;
    World.add(world, this.body);
  }

  display() {
    let pos = this.body.position;
    let angle = this.body.angle;
    p5.push();
    p5.imageMode(CENTER);

    let headerHeight = 0;
    p5.image(this.img, pos.x, pos.y - headerHeight, Math.round(this.r*2 + this.r/3.5), Math.round(this.r*2 + this.r/3.5));
    p5.pop();
    this.x = pos.x;
    this.y = pos.y - headerHeight;
  }

  clicked() {
    window.location = this.url;
  }

}
