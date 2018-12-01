import * as $ from 'jquery/dist/jquery.min';

export default class Config {

  constructor(){
    this.path = "http://localhost:8001/";
    this.apiPath = "http://www.elhoz.com/";
    this.loading = null;
    this.alert = null;
    this.isAlertAnimated = false;


    let header = document.getElementById('header');
    let headerHeight = 0;

    let iphone_x_bar = document.getElementById('iphone-x-bar');
    let iphone_x_bar_height = 0;
    if(header)
      headerHeight = header.offsetHeight;

    if(iphone_x_bar) {
      iphone_x_bar_height = window.getComputedStyle(iphone_x_bar, null).getPropertyValue('padding');
      iphone_x_bar_height = iphone_x_bar_height.replace("px", "");
      iphone_x_bar_height = parseInt(iphone_x_bar_height);
    }
    let _width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
      _height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - headerHeight - iphone_x_bar_height - 10;

    this.init();
    this.showLoading();
    this.verifyToken();
    this.setWidth(_width);
    this.setHeight(_height);
  }

  setWidth(width){
    this.width = width;
  }

  setHeight(height){
    this.height = height;
  }

  getWidth(){
    return this.width;
  }

  getHeight(){
    return this.height;
  }

  init(){
    this.loading = $('<div class="loading-overlay"><img class="center-block" src="img/loading.gif" alt="Loading..." /></div>');
    this.alert = $('<div id="animated-alert"><h4></h4></div>');
    this.updateHeaders();
  }

  baseUrl(){
    return "";//this.path;
  }

  updateHeaders() {

    $.ajaxSetup({
      beforeSend: function(xhr, settings) {
        let userData = localStorage.getItem('user-data');
        if (userData && userData.length) {
          userData = JSON.parse(userData);
          if (userData.token) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + userData.token);
          }
        }
      }
    });
  }

  showLoading() {
    $('body').append(this.loading).fadeIn();
  }

  hideLoading() {
    $(this.loading).fadeOut(function () {
      $(this.loading).remove();
    })
  }


  showAlert(message, showHint, callback, color, time){
    if(!$("#animated-alert").lenght)
      $('body').append(this.alert);

    if (this.isAlertAnimated == true) {
      return;
    }

    if (!time) {
      time = 1500;
    }

    this.isAlertAnimated = true;
    if (color) {
      $('#animated-alert').css('color', color);
    } else {
      $('#animated-alert').css('color', 'red');
    }

    $("#animated-alert h4").html(message);
    $("#animated-alert")
      .stop( true, true )
      .fadeIn()
      .css({top:'50%',position:'absolute'})
      .animate({top:'20%'}, time, function() {
        setTimeout(function(){
          $("#animated-alert h4").html('');
          $("#animated-alert").fadeOut();
          Config.isAlertAnimated = false;
          if (showHint)
            showAlert(showHint);
        }, 9000);
        if(callback) {
          callback();
        }
      });
  }

  login(event) {
    event.preventDefault();
    Config.showLoading();

    $.ajax({
      "type": "POST",
      "url": Config.apiPath + "api/auth/login",
      "data": $('form').serialize(),
      success: function(data){
        Config.hideLoading();
        if (data && data.success == true) {
          localStorage.setItem('user-data', JSON.stringify(data));
          Config.showAlert("Login Success. Redirecting!", null, function () {
            window.location = "index.html";
          }, 'green');
        } else if (data) {
          if (data.message) {
            Config.showAlert(data.message);
          }
        } else {
          Config.showAlert("An Error Occured while submitting your request");
        }
      },
      error: function(jqXHR){
        Config.hideLoading();
        Config.showAlert(jqXHR.responseJSON.Message);
        $('#password').val('');
      }
    })
  }

  register() {
    Config.showLoading();
    $.ajax({
      "type": "POST",
      "url": Config.apiPath + "api/auth/register",
      "data": {
        card_number: $('#card_number').val(),
        phone: $('#phone').val(),
        username: $('#username').val(),
        email: $('#email').val(),
        password: $('#password').val()
      },
      success: function(data){
        Config.hideLoading();
        if (data && data.success == true) {
          localStorage.setItem('user-data', JSON.stringify(data));
          Config.showAlert("Registration Success. Redirecting!", null, function () {
            window.location = "index.html";
          }, 'green');
        } else if (data) {
          if (data.message) {
            Config.showAlert(data.message);
          }
        } else {
          Config.showAlert("An Error Occured while submitting your request");
        }
        $('#password').val('');
      },
      error: function(jqXHR){
        Config.hideLoading();
        Config.showAlert(jqXHR.responseJSON.Message);
        $('#password').val('');
      }
    })
  }

  logout(){
    localStorage.removeItem('user-data');
    Config.showAlert("Logout Success. Redirecting!", null, function () {
      window.location = "index.html";
    }, 'green');
  }

  updateUserInfo() {
    let userData = localStorage.getItem('user-data');
    userData = JSON.parse(userData);
    $.ajax({
      'url': Config.apiPath + "api/auth/user_data?card_number="+userData.user.card_number,
      success: function(data) {
        if (data.success == true) {
          userData.user = data.user;
          localStorage.setItem('user-data', JSON.stringify(userData));
          Config.fillProfile(true);
        }
      }
    })
  }

  fillProfile(isUpdated) {
    let userData = localStorage.getItem('user-data');

    if (userData) {
      userData = JSON.parse(userData);
      console.log(userData);
      if(userData.success == true) {
        $('#card .content').text(userData.user.card_number);
        $('#name .content').text(userData.user.name);
        $('#username .content').text(userData.user.username);
        $('#phone .content').text(userData.user.phone);
        $('#email .content').text(userData.user.email);
        console.log(userData.user.points);
        $('#points .content').text(userData.user.points + " Points");
        if (!isUpdated)
          Config.updateUserInfo();
        return;
      }
    }

    Config.showAlert("!!!You are not Logged In. Redirecting!!!", null, function () {
      window.location = "index.html";
    })
  }

  verifyToken() {

  }

  refreshToken() {

  }

  isUserLoggedIn(){
    let userData = localStorage.getItem('user-data');

    if (userData) {
      userData = JSON.parse(userData);
      if(userData.success == true) {
        return true;
      }
    }

    return false;
  }
}
