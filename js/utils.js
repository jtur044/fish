
  // Bring the page into full-screen mode - Works!
function requestFullScreen(elem) {

    console.log('attempt fullscreen');

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
      elem.msRequestFullscreen();
    }


 
}

// Exit fullscreen - Doesn't work!
function exitFullScreen(element){
    console.log('attempt small screen');
    
    //gui.hide();

    var requestMethod = element.mozCancelFullScreen  ||
        element.exitFullscreen                 || 
        element.webkitExitFullscreen           || 
        element.msExitFullscreen;
    if (requestMethod) {
        console.log('calling exit method');
        requestMethod.call(element);
    } else {
        console.log("Oops. Request method false.");
    }
}
  

function check(e) {


      if (
          document.fullscreenElement || /* Standard syntax */
          document.webkitFullscreenElement || /* Chrome, Safari and Opera syntax */
          document.mozFullScreenElement ||/* Firefox syntax */
          document.msFullscreenElement /* IE/Edge syntax */
      ) {
              // fullscreen is activated
              console.log('fullscreen display - STARTING');
              StimulusRunning = true;  
              gui.open();
              animate();

      } else {

              // fullscreen is cancelled
              console.log('fullscreen display - STOPPED');
              stopStimulusDisplay();
      }
  }

  // event listeners 
  document.addEventListener('webkitfullscreenchange', function(e) { check(); }, false);
  document.addEventListener('mozfullscreenchange', function(e) { check(); }, false);
  document.addEventListener('fullscreenchange', function(e) { check(); }, false);


  function startStimulusDisplay() {
        requestFullScreen(document.documentElement);
        toggle_visibility('displayer');        
    }


  function stopStimulusDisplay() {
        toggle_visibility('displayer');
        StimulusRunning = false;        
        gui.close();    
        exitFullScreen(document);
  };
