/* --------------------------------------------------------------

STIMULUS 

	disks 

	stripes 

	sinusoid

 ----------------------------------------------------------------- */



let FizzyText, gui;

let camera, scene, geometry, material, renderer;

let requestId;

var uniforms, stamp;

let isStimulusActive = false;

/* PARAMETERS */

let parameters = { 	brightness : 1.0,					
					speed : 10.0,						
					direction : "left", 																				
					stimulus_type : "sinusoids", 

					ratio: { "2:1" : 2.0, 
							 "1:2" : 1.5 },

					bars: { frequency : 1.0,
							contrast  : 1.0 }, 
					sinusoids: { 	frequency : 1.0,
									contrast  : 1.0 }, 
					disks: { 	logMAR     			: 1.0,
								ratio    			: "2:1",
								central_intensity  	: 1.0, 
								surround_intensity 	: 0.4,
								background_intensity : 0.5,				
								field_spacing 		: 1.0 } 
					};


let last_parameters = JSON.parse(JSON.stringify(parameters));


/* ------------------------------------------------------------------------------

CONVERSION  

--------------------------------------------------------------------------------- */

let display = { name: "Alienware Laptop (15-inch)",
                distance: 100,
                dimension: { width:  34.93, 
                            height: 24.07, 
                            depth:  1.55  },
                resolution: { width:  1920,
               	 			  height: 1080 }};


function angle2pix(display, ang) {
pixSize = display.dimension.width/display.resolution.width;  // pixel size in cm (cm/px)
sz = 2.0*display.distance*Math.tan(Math.PI*ang/360);   		 // element size in cm 
pix = Math.round(sz/pixSize);   						     // value in pixels 
return pix; 
}

function logMAR2deg(val) {
return Math.pow(10, val) / 60;  							// logMAR in degrees
}

/* ------------------------------------------------------------------------------

STARTUP PARAMETERS 

--------------------------------------------------------------------------------- */

function buildMenu (callback) {

 if (gui) {
 	gui.destroy ();
 	log (`build the menu`);
 }
 	
  gui   = new dat.GUI();

  gui.add(parameters, 'stimulus_type', [ 'sinusoids', 'bars', 'disks', 'fish' ] ).name('Stimulus').onFinishChange(callback);
  gui.add(parameters, 'speed', 0.0, 15.0).name('Speed (deg/s)').onFinishChange(callback);
  gui.add(parameters, 'direction', [ 'left', 'right' ]).name('Direction').onFinishChange(callback);
  gui.add(display, 	  'distance', [ 50, 70, 100, 150 ] ).name('Distance (cm)').onFinishChange(callback);
  gui.add(parameters, 'brightness', 0.0, 1.0).name('Brightness').onFinishChange(callback);  


  var options = gui.addFolder('Stimulus Options');

  setupMenu (options);

  function setupMenu (options) {

	  switch (parameters.stimulus_type) {

	  	case "disks":


		  	options.add(parameters.disks, 'logMAR',       		  0.0, 2.0).name('logMAR').onFinishChange(callback);
		  	options.add(parameters.disks, 'ratio',        [ '2:1', '1:1' ]).name('Ratio').onFinishChange(callback);
		  	options.add(parameters.disks, 'central_intensity',    0.0, 1.0).name('Central Intensity').onFinishChange(callback);
		  	options.add(parameters.disks, 'surround_intensity',   0.0, 1.0).name('Surround Intensity').onFinishChange(callback);
		  	options.add(parameters.disks, 'field_spacing',        0.0, 20.0).name('Spacing (deg)').onFinishChange(callback);
/*
		  	options.add(parameters.disks, 'central_radius',       0.0, 20.0).name('Central Radius').onFinishChange(callback);
		  	options.add(parameters.disks, 'surround_radius',      0.0, 20.0).name('Surround Radius').onFinishChange(callback);
		  	options.add(parameters.disks, 'central_intensity',    0.0, 1.0).name('Central Intensity').onFinishChange(callback);
		  	options.add(parameters.disks, 'surround_intensity',   0.0, 1.0).name('Surround Intensity').onFinishChange(callback);
		  	options.add(parameters.disks, 'field_spacing',        0.0, 100.0).name('Field Spacing').onFinishChange(callback);
*/

			break;

	  	case "bars":

	  	case "sinusoids":

 			options.add(parameters.sinusoids, 'contrast',  0.0, 1.0).name('Contrast').onFinishChange(callback);
			options.add(parameters.sinusoids, 'frequency',  0.0, 15).name('Freq.(cpd)').onFinishChange(callback);
		  	break;



		 default:
		 	throw ('error'); 	

	  }
  }



  //options.add(parameters.bars, 'speed', 0.0, 1.0).name('Speed').onFinishChange(callback);
  //options.add(parameters.bars, 'frequency', 0.0, 1.0).name('Frequency').onFinishChange(callback);
  //options.add(parameters.bars, 'direction', [ 'left', 'right' ]).name('Direction').onFinishChange(callback);
  options.open();

}




/* Get the documentElement (<html>) to display the page in fullscreen */

var elem = document.documentElement;

/* View in fullscreen */
function openFullscreen() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE/Edge */
    elem.msRequestFullscreen();
  }
}

/* Close fullscreen */
function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) { /* Firefox */
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE/Edge */
    document.msExitFullscreen();
  }
}

/*--- REQUEST INFORMATION ---*/

//var requestId;

/* startFullScreenHandler : activated when started or finished  */

function startFullScreenHandler (start, finish) {

function check () {

  if (
      document.fullscreenElement ||       /* Standard syntax */
      document.webkitFullscreenElement || /* Chrome, Safari and Opera syntax */
      document.mozFullScreenElement ||    /* Firefox syntax */
      document.msFullscreenElement        /* IE/Edge syntax */
  ) {

    $("html").css("overflow", "hidden");
    start ();

  } else {

    $("html").css("overflow", "auto");
    finish ();
  }

}

// EVENT LISTENERS 
document.addEventListener('webkitfullscreenchange', function(e) { check(); }, false);
document.addEventListener('mozfullscreenchange', function(e) { check(); }, false);
document.addEventListener('fullscreenchange', function(e) { check(); }, false);
document.addEventListener('msfullscreenchange', function(e) { check(); }, false);

}



//----DISK Functions Begin----



function stopStimulus () {

		if (!isStimulusActive)
			return;

		log ('stopped stimulus');

		let experiment = document.getElementById("experiment");
		cancelAnimationFrame (requestId);

		if (scene == undefined) {
				log ('WARNING: stimulus stoppped - but not yet created.');
				return
		}

		/* TRY TO REMOVE */
		
		scene.remove (mesh);
		geometry.dispose ();
		material.dispose ();
		scene.dispose();
		renderer.forceContextLoss();
		renderer.dispose();

		/* CLEAN SLATE */

		emptyChildren (experiment);

		isStimulusActive = false;

}


function startStimulus () {


		log ("start stimulus");

		count = 0;
		
		cancelAnimationFrame (requestId);
		stamp = (new Date()).getTime();
		requestId = requestAnimationFrame( animate );				

		isStimulusActive = true;

		
}


function emptyChildren (container) {
	while (container.firstChild) {
	    container.removeChild(container.firstChild);
	}
}


function onWindowResize() {
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function initializeStimulus () {

	log ("initialize stimulus");

	if (isStimulusActive)
		stopStimulus ();

	experiment = document.getElementById("experiment");

	let shader_frag;


	let v;

	switch (parameters.stimulus_type) {

		case "disks":

			let k   = parameters.ratio[parameters.disks.ratio];
			let c   = angle2pix(display, logMAR2deg (parameters.disks.logMAR)); 
			let s   = c * k;
			let fsp = angle2pix(display, parameters.disks.field_spacing); 
			v   = -direction * angle2pix(display, parameters.speed);   // px/sec 


			//log (JSON.stringify(parameters, null, 4));

			/* DISKS UNIFORM */
			uniforms = {
				"CentralRadius": 		{ value: c },
				"PerimeterRadius": 		{ value: s },
				"CentralIntensity": 	{ value: parameters.disks.central_intensity },
				"PerimeterIntensity": 	{ value: parameters.disks.surround_intensity },
				"FieldSpacing": 		{ value: fsp },
				"Brightness": 			{ value: parameters.brightness },	
				"FieldDisplacementX": 	{ value: 0.0 },
				"Velocity": 			{ value: v },									
					"iTime": 			{ value: 0.0 }						
			};

			// /log (JSON.stringify(uniforms, null, 4));

			shader_frag = getDisksShader ();
			break;

		case "bars":

			/* DISKS UNIFORM */
			var lambda = 1/parameters.bars.frequency; 				 // cwavelength in deg 
			v = -direction * angle2pix(display, parameters.speed);   // deg/sec -> pixels/sec 
			var f = 1/angle2pix(display, lambda);  						 // cyc/px 

			/* DISKS UNIFORM */
			uniforms = {
				"Contrast": 		{ value: 1.0 }, //parameters.sinusoids.contrast },
				"Frequency": 		{ value: f },
				"Brightness": 		{ value: parameters.brightness },	
				"Velocity": 		{ value: v },					
					"iTime": 		{ value: 0.0 },						
			};


			shader_frag = getSquareShader ();
			break;

		case "sinusoids":

			var lambda = 1/parameters.sinusoids.frequency; 				 	  // cwavelength in deg 
			v 		   = -direction * angle2pix(display, parameters.speed);   // deg/sec -> pixels/sec 
			var f      = 1/angle2pix(display, lambda);  					  // cyc/px 

			/* DISKS UNIFORM */
			uniforms = {
				"Contrast": 		{ value: 1.0 }, //parameters.sinusoids.contrast },
				"Frequency": 		{ value: f },
				"Brightness": 		{ value: parameters.brightness },	
				"Velocity": 		{ value: v },					
					"iTime": 		{ value: 0.0 },						
			};

			shader_frag = getSinusoidalShader ();
			break;


	}


	camera 		= new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );				
	scene 		= new THREE.Scene();
	geometry 	= new THREE.PlaneBufferGeometry( 2, 2 );


	material = new THREE.ShaderMaterial( {
		uniforms: uniforms,
		fragmentShader: shader_frag  
	} );

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );

	experiment.appendChild( renderer.domElement );

	onWindowResize();
	window.addEventListener( 'resize', onWindowResize, false );

}

//

var count = 0;
var dt = 0;
var last = (new Date()).getTime();
var direction = 0.0;

// var stamp = 0;
// var fieldShiftDX = 0;

function animate() {

	requestId = requestAnimationFrame( animate );
	
	let now = (new Date()).getTime();
	let dt = (now - last)/1000; // seconds 

	// display.distance = parameters.viewing_distance;


	/* UPDATE DISKS UNIFORM */

	switch (parameters.direction) {
		case "left":
			direction = -1.0;
			break;
		case "right":
			direction = +1.0;
			break;
		default:
			direction = 0.0;
	}


	/* UPDATE THE CORRECT PARAMETERS */

	let v;

	switch (parameters.stimulus_type) {

		case "disks" :

			let k   = parameters.ratio[parameters.disks.ratio];
			let c   = angle2pix(display, logMAR2deg (parameters.disks.logMAR)); 
			let s   = c * k;
			let fsp = angle2pix(display, parameters.disks.field_spacing); 
			v   = -direction * angle2pix(display, parameters.speed);   // px/sec 

			mesh.material.uniforms.CentralRadius.value 		= c; // parameters.disks.central_radius;
			mesh.material.uniforms.PerimeterRadius.value 	= s; // parameters.disks.surround_radius; 
			mesh.material.uniforms.CentralIntensity.value 	= parameters.disks.central_intensity; 
			mesh.material.uniforms.PerimeterIntensity.value = parameters.disks.surround_intensity; 
			mesh.material.uniforms.FieldSpacing.value 		= fsp; 
			mesh.material.uniforms.Brightness.value 		= parameters.brightness;
			mesh.material.uniforms.Velocity.value 			= v;
			break;

		case "bars" :

/*			mesh.material.uniforms.CentralRadius.value 		= parameters.disks.central_radius;
			mesh.material.uniforms.PerimeterRadius.value 	= parameters.disks.surround_radius; 
			mesh.material.uniforms.CentralIntensity.value 	= parameters.disks.central_intensity; 
			mesh.material.uniforms.PerimeterIntensity.value = parameters.disks.surround_intensity; 
			mesh.material.uniforms.FieldSpacing.value 		= parameters.disks.field_spacing;
			mesh.material.uniforms.Brightness.value 		= parameters.brightness;
			break;
*/

		case "sinusoids" : 

			let lambda = 1/parameters.sinusoids.frequency; 		// wavelength in deg 
			let f = 1/angle2pix(display, lambda);  // cyc/px 
			v = -direction * parameters.speed * 1/lambda;   // cyc/sec 
			

			mesh.material.uniforms.Contrast.value 		= parameters.sinusoids.contrast;
			mesh.material.uniforms.Frequency.value 		= f; 
			mesh.material.uniforms.Brightness.value 	= parameters.brightness;
			mesh.material.uniforms.Velocity.value 		= v;
			break;

	}


	uniforms[ "iTime" ].value += dt; // UPDATE TIME IN SECONDS 
	renderer.render( scene, camera );
	last = (new Date()).getTime();

}





/* -----------------------------------------------------------------------------------------------------------------------------------

EMPTY SHADER 

-------------------------------------------------------------------------------------------------------------------------------------- */

function getEmptyShader () {

  let shader_frag = 
    "const float Pi = 3.1415926;"+

	"uniform float CentralRadius;"+
	"uniform float PerimeterRadius;"+
	"uniform float FieldSpacing;"+
	"uniform float CentralIntensity;"+
	"uniform float PerimeterIntensity;"+
	"uniform float FieldDisplacementX;"+
	"uniform float iTime;"+
	"uniform float Brightness;"+

 	"const float BackgroundIntensity = 0.5;"+
 	"const float dR = 1.0;"+
 	"const float FieldDisplacementY = 0.0;"+

 	"vec2 MCposition;"+
 	"vec2 CellSpacing = vec2(FieldSpacing, FieldSpacing);"+

  	"void main(void) {"+

  	 "float b = Brightness;" +

	 "gl_FragColor = vec4(0.7*b, 0.7*b, 0.7*b, 1.0);"+

  "}";

 return shader_frag;
}



/* -----------------------------------------------------------------------------------------------------------------------------------

DISKS SHADER 

-------------------------------------------------------------------------------------------------------------------------------------- */


function getDisksShader () {

  let shader_frag =

"          const float Pi = 3.1415926;"+

"          uniform float CentralRadius;"+
"          uniform float PerimeterRadius;"+
"          uniform float FieldSpacing;"+
"          uniform float CentralIntensity;"+
"          uniform float PerimeterIntensity;"+
"          uniform float FieldDisplacementX;"+
"          uniform float iTime;"+
"          uniform float Brightness;"+
"          uniform float Velocity;"+

 "         const float BackgroundIntensity = 0.5;"+
 "         const float dR = 1.0;"+
 "         const float FieldDisplacementY = 0.0;"+

 "         vec2 MCposition;"+
 "         vec2 CellSpacing = vec2(FieldSpacing, FieldSpacing);"+

"          void main(void) {"+
"          float sv;"+

"          MCposition = gl_FragCoord.xy + vec2(Velocity*iTime, 0.00);"+
"          vec2  CellLocation        = MCposition/CellSpacing;"+
"          vec2  CellArrayID         = floor(CellLocation + vec2(0.5, 0.5));"+
"          vec2  CellLocalLocation   = fract(CellLocation);"+
"          float CellRadialPosition  = length(MCposition - CellArrayID*CellSpacing);"+
"          sv = (CentralIntensity-PerimeterIntensity)*(1.0-smoothstep(CentralRadius-0.5*dR, CentralRadius+0.5*dR, CellRadialPosition));"+
"          sv = sv + (BackgroundIntensity-PerimeterIntensity)*smoothstep(PerimeterRadius-0.5*dR, PerimeterRadius+0.5*dR,CellRadialPosition);"+
"          sv = sv + PerimeterIntensity;"+
"          gl_FragColor = vec4(sv*Brightness, sv*Brightness, sv*Brightness, 1.0);"+
"          }";

  return shader_frag;
}


function getSinusoidalShader () {


let shader_frag = 

"		  const float Pi = 3.1415927;"+
"	      const float BackgroundIntensity = 0.5;"+

"		  uniform float Contrast;"+
"		  uniform float Frequency;"+  
"         uniform float iTime;"+
"         uniform float Brightness;"+
"         uniform float Velocity;"+

"         void main(void) {"+
"		  float uv  = gl_FragCoord.x;"+
//"		  float phi = 2.0*Pi*iTime;"+
"		  float phi = 2.0*Pi*Velocity*iTime;"+
"		  float sv = (0.5*Contrast)*( sin (2.0*Pi*Frequency*uv + phi) ) + BackgroundIntensity;"+     
//"		  float sv = 0.7;"+     
"		  float b = Brightness;" +
"		  gl_FragColor = vec4(b*sv, b*sv, b*sv, 1.0);"+
"		  }";

return shader_frag;
}



function getSquareShader () {


let shader_frag = 

"		  const float Pi = 3.1415927;"+
"	      const float BackgroundIntensity = 0.5;"+

"		  uniform float Contrast;"+
"		  uniform float Frequency;"+  
"         uniform float iTime;"+
"         uniform float Brightness;"+
"         uniform float Velocity;"+

"         void main(void) {"+
"		  float uv  = gl_FragCoord.x;"+
//"		  float phi = 2.0*Pi*iTime;"+
"		  float phi = 2.0*Pi*Velocity*iTime;"+
"		  float sv = sign((0.5*Contrast)*( sin (2.0*Pi*Frequency*uv + phi) )) + BackgroundIntensity;"+     
//"		  float sv = 0.7;"+     
"		  float b = Brightness;" +
"		  gl_FragColor = vec4(b*sv, b*sv, b*sv, 1.0);"+
"		  }";

return shader_frag;
}
   

