


function loadJSON(path, success, error)
{
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON5.parse(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}

function loadConfiguration ( filename, success ) {
	loadJSON (filename, function (data) {
		success (data);
	});
}

// ... angle in minutes of arc
function logMAR2SW(value) {
    return Math.pow(10, value);
}

// ... angle to pixels where angle is in degrees
function angle2pix(display, ang) {
    pixSize = display.dimension.width/display.resolution.width;  // cm/pix
    sz = 2.0*display.distance*Math.tan(Math.PI*ang/360);   // deg/sec
    pix = sz/pixSize;   
    return pix; 
}

// ... angle in minutes of arc
function logMAR2px(display, value) {
	let m = logMAR2SW (value);
	let px = angle2pix(display, m/60)

	console.log (m);
	console.log (px);
	console.log (display);

	return px;
}

