import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import Config from '../../classes/config';
import Background from "../../classes/background";
import Circle from "../../classes/circle";
import * as p5 from 'p5/lib/p5.min';
import * as Matter from 'matter-js/build/matter';
import * as $ from 'jquery/dist/jquery.min';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

  constructor(public navCtrl: NavController) {
    let sketch = p => {
      let config = new Config();
      let background = new Background();

      let Engine = Matter.Engine,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Constraint = Matter.Constraint,
        Mouse = Matter.Mouse,
        MouseConstraint = Matter.MouseConstraint;

      let engine;
      let world;
      let circles = [];
      let leftWall, rightWall, roof, ground, thikness;
      let menuItems = new Array();
      let isMouseDragged = false;
      let mouseDraggedCount = 0;
      let bg;
      let footer, footer_side;
      let sponsor;
      let carouselTimeOut;
      let carouselTimeOutTime = 500;
      let jumping = false;
      let sponsor1, sponsor2, currentPosX1, currentPosX2, renderPosition1, renderPosition2;
      let sponsors = [];
      let footer_max_height;
      let headerHeight = 0;

      p.preload = () => {
        bg = background.getBackgroundImage("img/background.PNG");
        footer = p5.loadImage(Config.baseUrl() + "img/offer/footer-offer.png");
        footer_side = p5.loadImage(Config.baseUrl() + "img/offer/footer-offer-side.png");
        $.ajax({
          type: 'GET',
          url: Config.apiPath + "sponsors/get",
          success: function (data) {
            if (data.length > 0)
              data.forEach(function(sponsor) {
                sponsors.push(p5.loadImage(Config.apiPath + 'sponsors/render/' + sponsor.id));
              });
          }
        });

        sponsor = 0;

        let indexes = [
          {
            "name": "events",
            "url": "events.html"
          },
          {
            "name": "contact-us",
            "url": "contact-us.html"
          },
          {
            "name": "new-item",
            "url": "new-item.html"
          },
          {
            "name": "gift-loyality",
            "url": "gift-points.html"
          },
          {
            "name": "hot-offers",
            "url": "hot-offers.html"
          },
          {
            "name": "scratch-n-score",
            "url": "scratch.html"
          }
        ];
        let item;
        for (let i = 0; i < indexes.length; i++) {
          item = new Object();
          item.image = p5.loadImage(Config.baseUrl() + 'img/'+indexes[i].name+'.PNG');
          item.url = indexes[i].url;
          menuItems[indexes[i].name] = item;
        }
      }

      p.setup = () => {
        p5.pixelDensity(1);
        p5.createCanvas(config.getWidth(), config.getHeight());
        p5.background(bg);
        engine = Engine.create();
        engine.world.gravity.y = 0;
        world = engine.world;

        let options = {
          isStatic: true
        };

        thikness = 200;
        p.circleRadius = config.getWidth()/7;


        let _h = config.getHeight();


        footer_max_height = footer.height;
        if (footer_max_height > p5.height/5) {
          footer_max_height = Math.floor(p5.height/5);
        }

        //buttons
        circles.push(
          new Circle(config.getWidth()/4, _h/5, p.circleRadius + 10, menuItems['hot-offers'], World, Bodies)
        );
        circles.push(
          new Circle(config.getWidth() - config.getWidth()/4, _h/5, p.circleRadius, menuItems['contact-us'], World, Bodies)
        );
        circles.push(
          new Circle(config.getWidth()/5, _h - _h/1.7, p.circleRadius - 10, menuItems['new-item'], World, Bodies)
        );
        circles.push(
          new Circle(config.getWidth() - config.getWidth()/5, _h - _h/1.5, p.circleRadius - 10, menuItems['gift-loyality'], World, Bodies)
        );
        circles.push(
          new Circle(config.getWidth() - config.getWidth()/3, _h - _h/2, p.circleRadius - 10, menuItems['events'], World, Bodies)
        );
        circles.push(
          new Circle(config.getWidth() - config.getWidth()/1.6, _h - footer_max_height - p.circleRadius, p.circleRadius + 10, menuItems['scratch-n-score'], World, Bodies)
        );

        //walls
        ground = Bodies.rectangle(config.getWidth()/2, _h - footer_max_height + thikness/2, config.getWidth(), thikness, options);
        roof =  Bodies.rectangle(config.getWidth()/2, headerHeight -thikness/2, config.getWidth(), thikness, options);
        leftWall = Bodies.rectangle(-thikness/2, _h/2, thikness, _h, options);
        rightWall = Bodies.rectangle(config.getWidth() + thikness/2, _h/2, thikness, _h, options);

        World.add(world, [
          ground,
          roof,
          leftWall,
          rightWall
        ]);

        addMouseGesture();
        p5.setCarouselTimeOut();
        Config.hideLoading();
      };

      function addMouseGesture(){
        let canvasmouse = Mouse.create(p5.canvas.elt);
        canvasmouse.pixelRatio = p5.pixelDensity();

        let options = {
          mouse: canvasmouse
        };
        let mConstraint = MouseConstraint.create(engine, options);
        World.add(world, mConstraint);
      }

      p.mousePressed = () => {
        isMouseDragged = false;
        mouseDraggedCount = 0;
      }

      p.mouseReleased = () => {
        if( $( event.target ).parents('a').length ) {
          window.location.href = $( event.target ).parents('a').attr('href');
        }
        if (isMouseDragged) {
          return false;
        }
        let circleClicked = false;
        for (let i = 0; i < circles.length; i++) {
          let d = p5.dist(p5.mouseX, p5.mouseY, circles[i].x, circles[i].y);
          if(d < circles[i].r){
            circles[i].clicked();
            circleClicked = true;
          }
        }

        if (!circleClicked) {
          offerClicked();
        }
      }

      function offerClicked(){
        if (p5.mouseY > p5.height - footer_max_height) {
          // TODO
          console.log("The Offer is clicked");
          //window.location = "sponsors.html";
        }
      }

      p.mouseDragged = () => {
        mouseDraggedCount++;
        if (mouseDraggedCount == 2){
          isMouseDragged = true;
        }
      }

      function setCarouselTimeOut(){
        jumping = false;
        carouselTimeOut = setTimeout(function(){
          clearTimeout(carouselTimeOut);
          carouselTimeOut = 'jump';
        }, carouselTimeOutTime);
      }

      function getNextSponser(){
        if (sponsor + 1 >= sponsors.length){
          return 0;
        }
        return sponsor + 1;
      }

      function jumpToNext(){
        jumping = true;
        sponsor1 = sponsors[sponsor];
        sponsor2 = sponsors[getNextSponser()];

        renderPosition1 = getRenderPositions(sponsor);
        renderPosition2 = getRenderPositions(getNextSponser());

        currentPosX1 = renderPosition1.posX;
        currentPosX2 = p5.width;

        let interval = setInterval(function(){
          currentPosX1 = currentPosX1 - 5;

          if (currentPosX2 > renderPosition2.posX) {
            currentPosX2 = currentPosX2 - 3;
            if (currentPosX2 < renderPosition2.posX) {
              currentPosX2 = renderPosition2.posX;
            }
          }

          if (currentPosX1 <= -renderPosition1.width && currentPosX2 <= renderPosition2.posX) {
            clearInterval(interval);
            sponsor = getNextSponser();
            setCarouselTimeOut();
          }
        }, 15);
      }

      function moveSponsor(x, _sponsor, renderPosition){
        p5.image(_sponsor, x, renderPosition.posY, renderPosition.width, renderPosition.height);
      }

      function isJumpToNext(){
        if (carouselTimeOut == 'jump') {
          return true;
        }
      }

      function getRenderPositions(_sponsor){
        let offerPadding = 5;
        let offerMaxWidth = p5.width - (p5.width/4);
        let offerWidth = sponsors[_sponsor].width;
        let offerHeight = sponsors[_sponsor].height;
        let aspectRatio = (sponsors[_sponsor].width / sponsors[_sponsor].height);

        if(offerWidth > offerMaxWidth - offerPadding*2){
          offerWidth = offerMaxWidth - offerPadding*2;
          offerHeight = Math.floor(offerWidth / aspectRatio);
        }

        if (offerHeight > footer_max_height - offerPadding*2){
          offerHeight = footer_max_height - offerPadding*2;
          offerWidth = Math.floor(offerHeight * aspectRatio);
        }

        let offerOffset = (offerMaxWidth - offerWidth) /2;

        return {
          posX: p5.width/4 + offerOffset,
          posY: p5.height - footer_max_height + offerPadding,
          width: offerWidth,
          height: offerHeight
        };
      }

      function renderSponsor(sponsor){
        let renderPosition = getRenderPositions(sponsor);
        p5.image(sponsors[sponsor], renderPosition.posX, renderPosition.posY, renderPosition.width, renderPosition.height);
      }

      p.draw = () => {
        p5.background(bg);
        //render footer sponsor.
        p5.image(footer, 0, p5.height - footer_max_height, p5.width, footer_max_height);
        //end rendering footer sponsor.
        if(sponsors.length > 2) {
          if (isJumpToNext()) {
            if (jumping) {
              moveSponsor(currentPosX1, sponsor1, renderPosition1);
              moveSponsor(currentPosX2, sponsor2, renderPosition2);
            } else {
              jumpToNext();
            }
          } else {
            renderSponsor(sponsor);
          }
        }


        //render footer green side.
        p5.image(footer_side, 0, p5.height - footer_max_height, p5.width, footer_max_height);
        //end rendering footer green side.

        Engine.update(engine);
        for (let i = 0; i < circles.length; i++) {
          circles[i].display();
        }
      }

      document.body.onload = function() {
        onBodyLoad();
      };

      function onBodyLoad()
      {
        document.addEventListener("deviceready", onDeviceReady, true);
      }

      function onDeviceReady() {
        document.addEventListener("backbutton", onBackButton, false);
      }

      function exitFromApp()
      {
        //navigator.app.exitApp();
      }

      function onBackButton() {
        exitFromApp();
      }
    };

    let homepageSketch = new p5(sketch);
  }

}
