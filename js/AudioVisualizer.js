navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia);

var AudioVisualizer = function(){

  var self = this;
  var audioPlayer = new AudioPlayer();
  var audioLoader = new AudioLoader();
  var buffersize = 256;
  var audioDrawer, data;
  var bpm = 80;

  var autoplay = false;
  var autoplayTimeout;

  var tapTempo = 0;
  var tapTempoTs = 0;
  var modeChanged = false;
  var colorChanged = false;

  var modes = {
    background: true,
    blocks: false,
    circle: false,
    flower: false,
    smoke: false
  };

  var colorSchemes = [
    [0x0000ff, 0xff0099, 0x00ff22, 0xff9900],
    [0x3C75D2, 0x3C91D2, 0x62CCF9, 0x0D429A],
    [0xe51e5b, 0xe51e9c, 0xe5301e, 0xe56d1e],
    [0x00fa1d, 0x52fa00, 0xc2fa00, 0x2abc26]
  ];

  var selectedSheme = 0;

  this.initMic = function(){
    if (navigator.getUserMedia) {
      navigator.getUserMedia({
        audio: true
      },
      function(stream) {
        audioPlayer.micConnected(stream, buffersize);
        self.tick();
      },
      function(err){
        console.log(err);
      });
    } else {
       console.log('getUserMedia not supported on your browser!');
    }
  };

  this.init = function(songName){
    audioDrawer = new AudioDrawer();
    audioDrawer.init(modes, colorSchemes[selectedSheme]);
    window.addEventListener("keydown", dealWithKeyboard, false);

    window.addEventListener( 'resize', onWindowResize, false );
    function onWindowResize() {
      audioDrawer.resize();
    }
  };

  this.initLoadSong = function(songName, style){
    audioLoader.getSong(songName, songLoaded);
  };

  function songLoaded(request){
    audioPlayer.songLoaded(request, buffersize);
    self.tick();
  }

  this.tick = function(){
    requestAnimationFrame(self.tick);
    data = audioPlayer.getData();
    audioDrawer.render(data, bpm);
  };

  function autoplaySwitch() {
    for (var key in modes) {
      var rand = Math.random() >= 0.5;
      modes[key] = rand;
    }

    selectedSheme = Math.floor(Math.random()*colorSchemes.length)
    audioDrawer.changeColors(colorSchemes[selectedSheme]);

    audioDrawer.changeMode(modes);

    var delay = 2000 + Math.floor(Math.random() * 10000);
    autoplayTimeout = setTimeout(autoplaySwitch, delay);
  }

  function toggleAutoPlay() {
    if(autoplay === true) {
      clearTimeout(autoplayTimeout)
    }

    autoplay = autoplay === false;

    if(autoplay === true){
      autoplaySwitch()
    }
  }

  function dealWithKeyboard(e) {
    switch(e.keyIdentifier) {
      // Number 0
      case "U+0030":
        toggleAutoPlay();
        break;
      // Number 1
      case "U+0054":
        var tmpTime = new Date().getTime();
        tapTempo = tmpTime - tapTempoTs;
        tapTempoTs = tmpTime;
        bpm = Math.round(1 / (tapTempo / 1000) * 60);
        console.log(bpm + ' BPM');
        break;
      // Number 2
      case "U+0031":
        modeChanged = true;
        modes.background = modes.background === false;
        break;
      // Number 3
      case "U+0032":
        modeChanged = true;
        modes.blocks = modes.blocks === false;
        break;
      // Number 4
      case "U+0033":
        modeChanged = true;
        modes.circle = modes.circle === false;
        break;
      // Number 5
      case "U+0034":
        modeChanged = true;
        modes.flower = modes.flower === false;
        break;
      // Number 6
      case "U+0035":
        modeChanged = true;
        modes.smoke = modes.smoke === false;
        break;
      // Number 7
      case "U+0036":
        modeChanged = true;
        audioDrawer.blast();
        break;

      // --- Colors ---
      // A key
      case "U+0041":
        selectedSheme = 0;
        colorChanged = true;
        break;
      // S key
      case "U+0053":
        selectedSheme = 1;
        colorChanged = true;
        break;
      // D key
      case "U+0044":
        selectedSheme = 2;
        colorChanged = true;
        break;
      // F key
      case "U+0046":
        selectedSheme = 3;
        colorChanged = true;
        break;
    }

    if(modeChanged) {
      audioDrawer.changeMode(modes);
    }

    if(colorChanged) {
      audioDrawer.changeColors(colorSchemes[selectedSheme]);
    }
  }
};
