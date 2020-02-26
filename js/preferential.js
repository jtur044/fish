/* --------------------------------------------------------------

GRATINGS Specific functions for running a grating stimulus demo 
This will allow sinusoids, stripes, disks 

 ----------------------------------------------------------------- */


let FizzyText, gui;
let camera, scene, geometry, material, renderer;
let requestId;
var uniforms, stamp;

/* PARAMETERS */

let parameters = { 	animation 	  : "rectangle", 																				
					stimulus_type : "gabor", 
					duration      : 2.5,
					gabor         : { frequency : 1.0,
									  contrast  : 1.0,									
									  sigma     : 1.0 },
					display       : { 	name  : "custom",   
										distance      : 100,
										dimension  : { 	width : 50.0,
														height: 30.0 },
										resolution : { 	width: screen.width,
														height: screen.height }}
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
  gui.add(parameters, 'animation', [ 'cycle', 'random', 'circle', 'rectangle' ]).name('Animation').onFinishChange(callback);
  gui.add(parameters, 'duration', 0, 10).name('Duration').onFinishChange(callback);
  

  var options = gui.addFolder('Stimulus Options');
  setupMenu (options);

  var display = gui.addFolder('Display Options');

  display.add(parameters.display, 'name', [ 'custom' ] ).name('Type').onFinishChange(callback);
  display.add(parameters.display, 'distance', [ 50, 70, 100, 150 ] ).name('Distance (cm)').onFinishChange(callback);
  display.add(parameters.display.dimension, 'height').step(0.01).name('Width (cm)').onFinishChange(callback);
  display.add(parameters.display.dimension, 'width').step(0.01).name('Height (cm)').onFinishChange(callback);
  display.add(parameters.display.resolution, 'height').step(1).name('Width (px)').onFinishChange(callback);
  display.add(parameters.display.resolution, 'width').step(1).name('Height (px)').onFinishChange(callback);


  function setupMenu (options) {

	  switch (parameters.stimulus_type) {

	  	case "gabor":

 			options.add(parameters.gabor, 'contrast',   0.0, 1.0).name('Contrast').onFinishChange(callback);
			options.add(parameters.gabor, 'frequency',  0.0, 15).name('Freq.(cpd)').onFinishChange(callback);
			options.add(parameters.gabor, 'sigma',       0.0, 5).name('Sigma (deg.)').onFinishChange(callback);
		  	break;

		 default:
		 	throw ('error'); 	

	  }


	  switch (parameters.display.name) {

	  	case "custom":

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

			log (`display`);
			log (JSON.stringify(parameters.display));

			var lambda = 1/parameters.gabor.frequency; 				// cwavelength in deg 
			var f = 1/angle2pix(parameters.display, lambda);  		// cyc/px 

			/* DISKS UNIFORM */
			uniforms = {
				"Contrast": 		{ type: "f", value: 1.0 }, //parameters.sinusoids.contrast },
				"Frequency": 		{ type: "f", value: f },
				"Sigma": 		    { type: "f", value: angle2pix(parameters.display, 1.0) },
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
	renderer.setPixelRatio(1); //window.devicePixelRatio ? window.devicePixelRatio : 1);
	renderer.setSize( window.innerWidth, window.innerHeight ); 

	log (window.innerWidth);
	log (window.innerHeight);

	experiment.appendChild( renderer.domElement );

	onWindowResize();
	window.addEventListener( 'resize', onWindowResize, false );

	updateStimulus ();

}


function updateStimulus () {

	switch (parameters.stimulus_type) {

		case "gabor":

			/* DISKS UNIFORM */
			var lambda = 1/parameters.gabor.frequency; 				 // cwavelength in deg 
			var f = 1/angle2pix(parameters.display, lambda);  		 // cyc/px 
			var s = angle2pix(parameters.display, parameters.gabor.sigma);  		 // cyc/px 

			/* DISKS UNIFORM */

			//uniforms = {
			//	"Contrast": 		{ type: "f", value: parameters.gabor.contrast }, //parameters.sinusoids.contrast },
			//	"Frequency": 		{ type: "f", value: parameters.gabor.frequency },
			//};


			//log(`frequency () = ${f}, lambda = ${lambda}, sigma = ${s}`)

			uniforms.Contrast.value  = parameters.gabor.contrast;
			uniforms.Frequency.value = f;
			uniforms.Sigma.value = s;			
			break;
	}

}


//

var count = 0;
var dt = 0;
var last = (new Date()).getTime();
var direction = 0.0;
var phi = 0;

// var stamp = 0;
// var fieldShiftDX = 0;

function unit_step (x) {
	return Math.sign(Math.sin (x));
}


function animate() {

	requestId = requestAnimationFrame( animate );
	
	let now 		= (new Date()).getTime();
	let elapsedTime = (now - last)/1000; // seconds 
	let T    		= parameters.duration;
	let phi  		= 2*Math.PI*elapsedTime/T;

	var w = window.innerWidth; h = window.innerHeight;

	/* UPDATE THE POSITIONING */

	switch (parameters.animation) {



		case "rectangle" :



			  a = w/4; b = h/4;

			  /* https://math.stackexchange.com/questions/1703952/polar-coordinates-vector-equation-of-a-rectangle */

			  var r;
			  var d = Math.abs(Math.tan(phi));
			  if (d <= b/a) {
			  	r = a/Math.abs(Math.cos(phi));
			  } else if (d >= b/a) {
			  	r = b/Math.abs(Math.sin(phi));
			  }

			  x = r*Math.cos(phi) + w/2;
			  y = r*Math.sin(phi) + h/2;

			 //log(`x = ${x}, y = ${y}, phi=${phi}, dt=${dt}`);

			 //console.log (uniforms);


			  uniforms.Location.value.x = x;//window.innerWidth;
		      uniforms.Location.value.y = y;//window.innerHeight;

 		  	  //last = (new Date()).getTime();

			break;


		case "circle" :
			  
			  var x = (w/4) * Math.sin(phi) + w/2;
			  var y = (h/4) * Math.cos(phi) + h/2;

			  uniforms.Location.value.x = x;//window.innerWidth;
		      uniforms.Location.value.y = y;//window.innerHeight;

			break;


		case "random" :

			if (elapsedTime > T) {

				phi = 2*Math.PI*Math.random ();

			  	var x = (w/4) * unit_step(phi) + w/2;
			  	var y = (h/4) * unit_step(phi + Math.PI/2) + h/2;

		      	uniforms.Location.value.x = x;
		      	uniforms.Location.value.y = y;

  			  	last = (new Date()).getTime();

			}

			break;

		case "cycle" :

		  var x = (w/4) * unit_step(phi) + w/2;
		  var y = (h/4) * unit_step(phi + Math.PI/2) + h/2;

		  uniforms.Location.value.x = x;//window.innerWidth;
	      uniforms.Location.value.y = y;//window.innerHeight;

		  //mesh.material.uniforms.Location.x.value 	 += -0.1; // parameters.disks.central_radius;
		  break;

	}

	renderer.render( scene, camera );

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
"		  uniform float Sigma;"+  
"		  uniform vec2 Location;"+  

//"		 float gauss(float x) {" +
//"    		return exp(-(x*x)*20.);" + 
//"		 }"+


"		 float gauss(float x, float s) {" +
"    		return exp(-x*x/(2.0*s*s));" + 
"		 }"+

"         void main(void) {"+
"		  vec2  uv  = gl_FragCoord.xy;"+
"		  float g = gauss(uv.x - Location.x, Sigma)*gauss(uv.y - Location.y, Sigma);"+
// "		  float sv = g*(0.5*Contrast)*( sin (2.0*Pi*Frequency*uv.x) ) + BackgroundIntensity;"+     
"		  float sv = g*(0.5*Contrast)*( sin (2.0*Pi*Frequency*(uv.x - Location.x))) + BackgroundIntensity;"+     
//"		  float sv = 0.5*g + BackgroundIntensity;"+     

"		  float b = 1.0;"+
"		  gl_FragColor = vec4(b*sv, b*sv, b*sv, 1.0);"+
"		  }";

return shader_frag;
}
