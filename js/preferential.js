/* --------------------------------------------------------------

GRATINGS Specific functions for running a grating stimulus demo 
This will allow sinusoids, stripes, disks 

 ----------------------------------------------------------------- */



/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR 
 * h, s, v
*/
function HSVtoRGB(h, s, v) {

    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }

    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255) / 255,
        g: Math.round(g * 255) / 255,
        b: Math.round(b * 255) / 255
    };
}


function RGBtoHSV (r, g, b) {
    let rabs, gabs, babs, rr, gg, bb, h, s, v, diff, diffc, percentRoundFn;

    rabs = r; // / 255;
    gabs = g; // / 255;
    babs = b; // / 255;
    v = Math.max(rabs, gabs, babs),
    diff = v - Math.min(rabs, gabs, babs);
    diffc = c => (v - c) / 6 / diff + 1 / 2;
    percentRoundFn = num => Math.round(num * 100) / 100;
    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(rabs);
        gg = diffc(gabs);
        bb = diffc(babs);

        if (rabs === v) {
            h = bb - gg;
        } else if (gabs === v) {
            h = (1 / 3) + rr - bb;
        } else if (babs === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        }else if (h > 1) {
            h -= 1;
        }
    }
    return {
        h: Math.round(h * 360),
        s: percentRoundFn(s * 100) / 100,
        v: percentRoundFn(v * 100) / 100
    };
}




let FizzyText, gui;
let camera, scene, geometry, material, renderer;
let requestId;
var uniforms, stamp;

/* PARAMETERS */

let parameters = { 	animation 	  : "rectangle", 																				
					stimulus_type : "gabor", 
					color_preset  : "custom", 					
					duration      : 2.5,
					gabor         : { frequency : 1.0,
									  contrast  : 1.0,									
									  sigma     : 1.0 },
					display       : { 	name  : "custom",   
										distance      : 100,
										dimension  : { 	width : 50.0,
														height: 30.0 },
										resolution : { 	width: screen.width,
														height: screen.height }},
					color         : { 	rgb : { r: 0.5, g: 0.5, b: 0.5 },
										window    : "step",
										threshold : 3,

										reset: function() {  
											 parameters.color.rgb = { r: 0.5, g: 0.5, b: 0.5 };
											 updateStimulus ();  }

										}


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
  gui.add(parameters, 'color_preset', [ 'achromatic (+)', 'achromatic (-)', 'S not L (+)', 'S not L (-)', 'L not S (+)', 'L not S (-)', 'custom' ]).name('Color Preset').onFinishChange(callback);
  gui.add(parameters, 'animation', [ 'cycle', 'random', 'circle', 'rectangle' ]).name('Animation').onFinishChange(callback);
  gui.add(parameters, 'duration', 0, 10).name('Duration').onFinishChange(callback);

  var options = gui.addFolder('Stimulus Options');
  setupMenu (options);


  var color_options = gui.addFolder('Color Options');
  //color_options.add(parameters.color, 'threshold', 0, 3).name('Threshold').onFinishChange(callback).listen();
  color_options.add(parameters.color.rgb, 'r', -0.5, 0.5).step(0.001).name('Red').onFinishChange(callback).listen();
  color_options.add(parameters.color.rgb, 'g', -0.5, 0.5).step(0.001).name('Green').onFinishChange(callback).listen();
  color_options.add(parameters.color.rgb, 'b', -0.5, 0.5).step(0.001).name('Blue').onFinishChange(callback).listen();

  var display = gui.addFolder('Display Options');

  display.add(parameters.display, 'name', [ 'custom' ] ).name('Type').onFinishChange(callback);
  display.add(parameters.display, 'distance', [ 50, 70, 100, 150 ] ).name('Distance (cm)').onFinishChange(callback);
  display.add(parameters.display.dimension, 'height').step(0.01).name('Width (cm)').onFinishChange(callback);
  display.add(parameters.display.dimension, 'width').step(0.01).name('Height (cm)').onFinishChange(callback);
  display.add(parameters.display.resolution, 'height').step(1).name('Width (px)').onFinishChange(callback);
  display.add(parameters.display.resolution, 'width').step(1).name('Height (px)').onFinishChange(callback);

  //gui.addColor(parameters.color, 'rgb').name('Color').onFinishChange(callback).listen();
  //gui.add(parameters.color, 'reset').name('Reset Color').onFinishChange(callback);


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
  color_options.open();


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
				"Color": 			{ type: "v3", value: new THREE.Color() },										
			};


			shader_frag = getGaborShader ();
			break;

	}


	camera 		= new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );				
	scene 		= new THREE.Scene();
	geometry 	= new THREE.PlaneBufferGeometry( 2, 2 );
	material    = new THREE.ShaderMaterial( {
	
			uniforms: uniforms,
			fragmentShader: shader_frag  
	
	});

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


	/* stimulus type */

	switch (parameters.stimulus_type) {

		case "gabor":

			/* disks uniform  */

			var f, lambda;
			if (parameters.gabor.frequency > 0) {
				lambda = 1/parameters.gabor.frequency; 				 // cwavelength in deg 
				f = 1/angle2pix(parameters.display, lambda);  		 // cyc/px 				
			} else {
				lambda = 0;
				f = 0;
			}

			var s = angle2pix(parameters.display, parameters.gabor.sigma);  		 // cyc/px 

			// let h = {...parameters.color.hsv};			
			// parameters.color.rgb     = HSVtoRGB(h.h/360, h.s, h.v);

			uniforms.Contrast.value  = parameters.gabor.contrast;
			uniforms.Frequency.value = f;
			uniforms.Sigma.value     = s;			
			break;
	}


	console.log (`method = ${parameters.stimulus_type}`);


	/* color preset */

	switch (parameters.color_preset) {

		case "achromatic (+)":
			parameters.color.rgb.r = 0.15;
			parameters.color.rgb.g = 0.15;
			parameters.color.rgb.b = 0.15;			
			break;

		case "achromatic (-)":
			parameters.color.rgb.r = - 0.15;
			parameters.color.rgb.g = - 0.15;
			parameters.color.rgb.b = - 0.15;						
			break;

		case "S not L (+)":
			parameters.color.rgb.r = +0.50;
			parameters.color.rgb.g = -0.09;
			parameters.color.rgb.b = +0.152;			
			break;

		case "S not L (-)":
			parameters.color.rgb.r = -0.50;
			parameters.color.rgb.g = +0.09;
			parameters.color.rgb.b = -0.152;						
			break;

		case "L not S (+)":
			parameters.color.rgb.r = +0.50;
			parameters.color.rgb.g = +0.168;
			parameters.color.rgb.b = -0.002;			
			break;

		case "L not S (-)":
			parameters.color.rgb.r = -0.50;
			parameters.color.rgb.g = -0.168;
			parameters.color.rgb.b = +0.002;			
			break;

		case "custom":
			break;

	}


	console.log (`method = ${parameters.color_reset}`);

	uniforms.Color.value.r   = parameters.color.rgb.r;
	uniforms.Color.value.g   = parameters.color.rgb.g;
	uniforms.Color.value.b   = parameters.color.rgb.b;


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
"	      const float bi = 0.5;"+

"		  uniform float Contrast;"+
"		  uniform float Frequency;"+  
"		  uniform float Sigma;"+  
"		  uniform vec2 Location;"+  
"		  uniform vec3 Color;"+  

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
"		  float sv = g*(0.5*Contrast)*( cos (2.0*Pi*Frequency*(uv.x - Location.x)));"+     
//"		  float sv = 0.5*g + BackgroundIntensity;"+     

"		  float dr = Color.r;"+
"		  float dg = Color.g;"+
"		  float db = Color.b;"+
"		  gl_FragColor = vec4(dr*sv + bi, dg*sv + bi, db*sv + bi, 1.0);"+
"		  }";

return shader_frag;
}
