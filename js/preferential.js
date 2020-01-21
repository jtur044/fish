/* --------------------------------------------------------------

GRATINGS Specific functions for running a grating stimulus demo 
This will allow sinusoids, stripes, disks 

 ----------------------------------------------------------------- */


let FizzyText, gui;
let camera, scene, geometry, material, renderer;
let requestId;
var uniforms, stamp;

/* PARAMETERS */

let parameters = { 	animation 	  : "cycle", 																				
					stimulus_type : "gabor", 
					duration      : 2.5,
					gabor         : { frequency : 1.0,
									  contrast  : 1.0,									
									  size      : 2 }  
					};


let last_parameters = JSON.parse(JSON.stringify(parameters));

/* ------------------------------------------------------------------------------

STARTUP PARAMETERS 

--------------------------------------------------------------------------------- */

function destroyMenu () {
	if (gui) {		
		log ('destroyed menu');
	    gui.destroy ();
	   	gui = undefined;
	   }
}
    

function buildMenu (callback) {

  if (gui)	{
  	 console.log (gui);
  	 log ('build called. gui is not empty.');
     destroyMenu ();
  }


  log (`build the menu`);
  gui   = new dat.GUI();

  gui.add(parameters, 'stimulus_type', [ 'gabor' ] ).name('Stimulus').onFinishChange(callback);
  gui.add(parameters, 'animation', [ 'cycle', 'random' ]).name('Animation').onFinishChange(callback);
  gui.add(parameters, 'duration', 0, 10).name('Duration').onFinishChange(callback);
  gui.add(display, 	  'distance', [ 50, 70, 100, 150 ] ).name('Distance (cm)').onFinishChange(callback);
  

  var options = gui.addFolder('Stimulus Options');

  setupMenu (options);

  function setupMenu (options) {

	  switch (parameters.stimulus_type) {

	  	case "gabor":

 			options.add(parameters.gabor, 'contrast',  0.0, 1.0).name('Contrast').onFinishChange(callback);
			options.add(parameters.gabor, 'frequency',  0.0, 15).name('Freq.(cpd)').onFinishChange(callback);
			options.add(parameters.gabor, 'size',       0.0, 5).name('Size.(deg.)').onFinishChange(callback);
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




//----DISK Functions Begin----



function initializeStimulus () {

	log ("initialize stimulus");

	if (isStimulusActive)
		stopStimulus ();

	experiment = document.getElementById("experiment");

	let shader_frag;
	let v;

	switch (parameters.stimulus_type) {

		case "gabor":

			/* DISKS UNIFORM */
			var lambda = 1/parameters.gabor.frequency; 				 // cwavelength in deg 
			var f = 1/angle2pix(display, lambda);  						 // cyc/px 

			/* DISKS UNIFORM */
			uniforms = {
				"Contrast": 		{ value: 1.0 }, //parameters.sinusoids.contrast },
				"Frequency": 		{ value: f },
				"Location": 		{ type: "v2", value: new THREE.Vector2() },						
			};


			shader_frag = getGaborShader ();
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
	// renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
	renderer.setSize( window.innerWidth, window.innerHeight ); 

	log (window.innerWidth);
	log (window.innerHeight);

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

function unit_step (x) {
	return Math.sign(Math.sin (x));
}


function animate() {

	requestId = requestAnimationFrame( animate );
	
	let now = (new Date()).getTime();
	let dt = (now - last)/1000; // seconds 

	/* UPDATE THE POSITIONING */

	switch (parameters.animation) {

		case "random" :

		  var x = window.innerWidth * unit_step(2*Math.Pi*parameters.duration*now);
		  var y = window.innerWidth * unit_step(2*Math.Pi*parameters.duration*now + Math.Pi/2);

	      uniforms.Location.value.x = window.innerWidth;
	      uniforms.Location.value.y = window.innerHeight;

			//mesh.material.uniforms.Location.x.value 	 += 0.1; // parameters.disks.central_radius;
			break;

		case "cycle" :

		  var Ax = window.innerWidth/2; Ay = window.innerHeight/2;
		  var phi = Math.PI*dt/parameters.duration;
		  var x = Ax * unit_step(phi) + 2*Ax;
		  var y = Ay * unit_step(phi + Math.PI/2) + 2*Ay;

		  //log(JSON.stringify(parameters,null,4));
		  //log(`cycle phi=${phi}, x = ${x}`);
		  //log(`cycle phi=${phi}, y = ${y}`);
	      uniforms.Location.value.x = x;//window.innerWidth;
	      uniforms.Location.value.y = y;//window.innerHeight;

			//mesh.material.uniforms.Location.x.value 	 += -0.1; // parameters.disks.central_radius;
			break;

	}

	renderer.render( scene, camera );
	//last = (new Date()).getTime();

}





/* -----------------------------------------------------------------------------------------------------------------------------------

EMPTY SHADER 

-------------------------------------------------------------------------------------------------------------------------------------- */


function getGaborShader () {


let shader_frag = 

"		  const float Pi = 3.1415927;"+
"	      const float BackgroundIntensity = 0.5;"+

"		  uniform float Contrast;"+
"		  uniform float Frequency;"+  
"		  uniform vec2 Location;"+  

//"		 float gauss(float x) {" +
//"    		return exp(-(x*x)*20.);" + 
//"		 }"+


"		 float gauss(float x) {" +
"    		return exp(-x*x*0.0001);" + 
"		 }"+

"         void main(void) {"+
"		  vec2  uv  = gl_FragCoord.xy;"+
"		  float g = gauss(uv.x - Location.x)*gauss(uv.y - Location.y);"+
// "		  float sv = g*(0.5*Contrast)*( sin (2.0*Pi*Frequency*uv.x) ) + BackgroundIntensity;"+     
"		  float sv = g*(0.5*Contrast)*( sin (2.0*Pi*Frequency*uv.x) ) + BackgroundIntensity;"+     
//"		  float sv = 0.5*g + BackgroundIntensity;"+     

"		  float b = 1.0;"+
"		  gl_FragColor = vec4(b*sv, b*sv, b*sv, 1.0);"+
"		  }";

return shader_frag;
}
