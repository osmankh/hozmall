import * as p5 from 'p5/lib/p5.min';
import Config from './config';

export default class Background {
  constructor() {
    this.config = new Config();
  }

  getBackgroundImage(src){
    var img = p5.loadImage(this.config.baseUrl() + src);
    return img;
  }

  resizeImage(_img, width, height){
    var img = p5.createImage(width, height);
    _img.copy(img, 0, 0, _img.width, _img.height, 0, 0, img.width, img.height);
    return img;
  }
}
