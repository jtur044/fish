let fish_body = [ 
  [ 116.9185,  102.6403 ],
  [ 120.7168,   89.7261 ],
  [ 134.3908,   75.2924 ],
  [ 151.8630,   64.6571 ],
  [ 165.5370,   61.6185 ],
  [ 178.4513,   60.0992 ],
  [ 197.4429,   60.0992 ],
  [ 221.7521,   63.8975 ],
  [ 239.2244,   68.4555 ],
  [ 255.9370,   75.2924 ],
  [ 270.3706,   81.3697 ],
  [ 283.2849,   66.1765 ],
  [ 293.9202,   55.5412 ],
  [ 301.5168,   47.1849 ],
  [ 307.5941,   44.1462 ],
  [ 315.9504,   50.9832 ],
  [ 318.2294,   59.3395 ],
  [ 318.2294,   73.7731 ],
  [ 297.7185,  116.3143 ],
  [ 320.5084,  156.5765 ],
  [ 321.2681,  170.2504 ],
  [ 315.1908,  180.1261 ],
  [ 308.3538,  185.4437 ],
  [ 297.7185,  180.8857 ],
  [ 272.6496,  147.4605 ],
  [ 254.4176,  154.2975 ],
  [ 236.9454,  161.1345 ],
  [ 216.4345,  164.1731 ],
  [ 195.1639,  165.6924 ],
  [ 172.3739,  165.6924 ],
  [ 154.1420,  161.1345 ],
  [ 135.1504,  152.7782 ],
  [ 124.5151,  141.3832 ],
  [ 116.9185,  127.7092 ],
  [ 119.1975,  122.3916 ],
  [ 141.2277,  117.0739 ],
  [ 137.4294,  112.5160 ],
  [ 116.9185,  102.6403 ]];


let fish_upper_fin = [   [169.9096, 60.0080 ],
                      [177.1416,   51.3296 ],
                      [190.8824,   44.8208 ],
                      [207.5160,   39.0352 ],
                      [224.8728,   37.5888 ],
                      [240.7832,   41.2048 ],
                      [248.7384,   51.3296 ],
                      [249.4616,   62.9008 ],
                      [245.8456,   70.1328 ]];
                            
let fish_lower_fin = [
  [ 155.0102,  163.8204 ],
  [ 158.7000,  173.6599 ],
  [ 170.3844,  180.4245 ],
  [ 180.8388,  184.7293 ],
  [ 194.9830,  189.6490 ],
  [ 210.9721,  193.3388 ],
  [ 230.6510,  195.7986 ],
  [ 244.7952,  194.5687 ],
  [ 252.7898,  187.8041 ],
  [ 253.4048,  175.5048 ],
  [ 246.6401,  167.5102 ],
  [ 241.7204,  158.2857 ]];


let fish_eye = [ 
  [ 151.5883,   90.7226 ],
  [ 154.3993,   84.5386 ],
  [ 161.1455,   82.2898 ],
  [ 167.3296,   81.7276 ],
  [ 173.5137,   87.3495 ],
  [ 173.5137,   96.3445 ],
  [ 166.2052,   101.9664 ],
  [ 157.7724,   100.2799 ],
  [ 152.7127,   96.9067 ],
  [ 151.5883,   90.7226 ]];


const offsetX = +170; 
const offsetY = +120;



fish_body = fish_body.map (elem => {return [elem[0]-offsetX, elem[1]-offsetY]});
fish_upper_fin = fish_upper_fin.map (elem => {return [elem[0]-offsetX, elem[1]-offsetY]});
fish_lower_fin = fish_lower_fin.map (elem => {return [elem[0]-offsetX, elem[1]-offsetY]});
fish_eye = fish_eye.map (elem => {return [elem[0]-offsetX, elem[1]-offsetY]});


function createFish (paper) {

  const controlPointCalc  = controlPoint(line, smoothing)
  const bezierCommandCalc = bezierCommand(controlPointCalc)
  let svg_fish_eye       = svgPathString(fish_eye, bezierCommandCalc);
  let svg_fish_body      = svgPathString(fish_body, bezierCommandCalc);
  let svg_fish_upper_fin = svgPathString(fish_upper_fin, bezierCommandCalc);
  let svg_fish_lower_fin = svgPathString(fish_lower_fin, bezierCommandCalc);

  var fishBodyPath     = paper.path(svg_fish_body);
  var fishEyePath      = paper.path(svg_fish_eye);
  var fishUpperFinPath = paper.path(svg_fish_upper_fin);
  var fishLowerFinPath = paper.path(svg_fish_lower_fin);

  let fish_outer = paper.set (fishBodyPath, fishEyePath, fishUpperFinPath, fishLowerFinPath).attr({ fill: "none", stroke: "#000000", "stroke-width" : 6});
  fish_outer.translate(0,0);

  var fishBodyPath2    = paper.path(svg_fish_body);
  var fishEyePath2   = paper.path(svg_fish_eye);
  var fishUpperFinPath2 = paper.path(svg_fish_upper_fin);
  var fishLowerFinPath2 = paper.path(svg_fish_lower_fin);

  let fish_inner = paper.set (fishBodyPath2, fishEyePath2, fishUpperFinPath2, fishLowerFinPath2).attr({ fill: "none", stroke: "#FFFFFF", "stroke-width" : 2});
  fish_inner.translate(0,0);

  let fishSet = paper.set(fish_inner, fish_outer);
  let fish_box = fishSet.getBBox ();
  let fishBox  = paper.rect(0, 0, fish_box.width, fish_box.height).attr({ fill: "none", "stroke-width" : 2});
  return fishSet.push (fishBox);

}




