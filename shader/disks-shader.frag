precision mediump float;
const float Pi = 3.1415926;

uniform float CentralRadius;
uniform float PerimeterRadius;
uniform float FieldSpacing;
uniform float CentralIntensity;
uniform float PerimeterIntensity;
uniform float FieldDisplacementX;
uniform float Brightness;

//const float Brightness = 0.5;
const float BackgroundIntensity = 0.5;
const float dR = 1.0;
const float FieldDisplacementY = 0.0;

vec2 MCposition;
vec2 CellSpacing = vec2(FieldSpacing, FieldSpacing);

// angle is in degrees
float ang2pix( in float angle, in float distance, in vec2 dimension, in vec2 resolution ) {
float pixSize = dimension[0]/resolution[0];
float sz = 2.0*distance*tan(Pi*angle/360.0);
float pix = floor(sz/pixSize + 0.5);
return(pix);
} 

// main function
void main(void) {
float sv;

MCposition = gl_FragCoord.xy + vec2(FieldDisplacementX, FieldDisplacementY);
vec2  CellLocation        = MCposition/CellSpacing;
vec2  CellArrayID         = floor(CellLocation + vec2(0.5, 0.5));
vec2  CellLocalLocation   = fract(CellLocation);
float CellRadialPosition  = length(MCposition - CellArrayID*CellSpacing);
sv = (CentralIntensity-PerimeterIntensity)*(1.0-smoothstep(CentralRadius-0.5*dR, CentralRadius+0.5*dR, CellRadialPosition));
sv = sv + (BackgroundIntensity-PerimeterIntensity)*smoothstep(PerimeterRadius-0.5*dR, PerimeterRadius+0.5*dR,CellRadialPosition);
sv = sv + PerimeterIntensity;
gl_FragColor = vec4(sv*Brightness, sv*Brightness, sv*Brightness, 1.0);
}