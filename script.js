
// THIS IS THE BG
const width = 1000;
const height = 600;
const svg = d3.select("#canvas")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
const table_powersets = []; 
const rBase = 5;
var max_ps = 9; 
var g_setsize = 1; 
var justification = true;
var lines = true;
var colorIndex = 0;
var colorSchemeList = [
    {reference: d3.interpolateRainbow, name: "Rainbow"}, 
    {reference: d3.interpolateSpectral, name: "Spectral"},  
    {reference: d3.interpolateGreys, name: "Greyscale"}, 
    {reference: d3.interpolateViridis, name: "Viridis"}, 
    {reference: d3.interpolateCividis, name: "Cividis"}, 
    {reference: d3.interpolateInferno, name: "Inferno"}, 
    {reference: d3.interpolateMagma, name: "Magma"}, 
    {reference: d3.interpolatePlasma, name: "Plasma"}, 
    {reference: d3.interpolateWarm, name: "Warm"}, 
    {reference: d3.interpolateCool, name: "Cool"}, 
    {reference: d3.interpolateCubehelixDefault, name: "CubeHelix"}];
var colorScale = d3.scaleSequential(colorSchemeList[colorIndex].reference)
    .domain([0, g_setsize]);
d3.select("#setSizeSlider").attr("max", `${max_ps}`);
d3.select("#instructions").html(`Use the slider to choose a set size [ ${g_setsize} , ${max_ps} ]`);
d3.select("#setSize").html(`Size: ${g_setsize}`);
genAllPowerSets();
drawSubsets();

// THIS GENERATES ALL THE POWERSETS AND SAVES THEM INTO table_powersets
function genAllPowerSets(){
    for(let i = 0; i <= max_ps; i++)
        table_powersets.push(genPowerSet(i));
}

// THIS DETERMINES WHICH JUSTIFICATION TO DRAW THE SUBSETS IN
function drawSubsets(){
    if((justification && g_setsize > 1) || (!justification && g_setsize==1))
        drawSubsetsCenter(g_setsize);
    else
        drawSubsetsLeft(g_setsize);
}

// THIS HANDLES WHEN YOU UPDATE THE SLIDER VALUE
d3.select("#setSizeSlider").on("input", function(){          // any time the slider is triggered
    setSize = d3.select("#setSizeSlider").property("value"); // get the value of the slider
    //console.log(genPowerSet(setSize));                     
    d3.select("#setSize").html(`Size: ${setSize}`);          // update the set size with the value of the slider
    d3.selectAll("circle").remove();
    d3.selectAll("line").remove();
    g_setsize = setSize;
    colorScale = d3.scaleSequential(colorSchemeList[colorIndex].reference)
        .domain([0, g_setsize]);
    drawSubsets();
});

// THIS HANDLES WHEN YOU TOGGLE THE JUSTIFICATION BUTTON
d3.select("#justify").on("click", function(){
    d3.selectAll("circle").remove();
    d3.selectAll("line").remove();
    justification = !justification;
    drawSubsets(); 
});

// THIS HANDLES WHEN YOU TOGGLE THE DRAW LINES BUTTON
d3.select("#lines").on("click", function(){
    d3.selectAll("circle").remove();
    d3.selectAll("line").remove();
    lines = !lines;
    drawSubsets(); 
});

// THIS HANDLES WHEN YOU TOGGLE THE COLORS BUTTON
d3.select("#colors").on("click", function(){
    d3.selectAll("circle").remove();
    d3.selectAll("line").remove();
    colorIndex = ((colorIndex+1) % colorSchemeList.length);
    colorScale = d3.scaleSequential(colorSchemeList[colorIndex].reference)
        .domain([0, g_setsize]);
    d3.select("#colors").html(colorSchemeList[colorIndex].name)
    drawSubsets();
});

// genBinary : Nat -> Array of String where each string is a padded binary representation
//  - genBinary(1) -> ["0", "1"]
//  - genBinary(3) -> ["000", "001", "010", "011", "100", "101", "110", "111"]
function genBinary(n){
    var bin = [];
    for(let i = 0; i < Math.pow(2,n) ; i++) { // iterates through the number of subsets for a set of size n
        var str = i.toString(2);              //converts the index to a binary string, eg: 5 -> "101"
        while(str.length < n)                 //adds padding to the binary strings
            str = "0" + str; 
        bin.push(str);                        //pushes the binary string onto the list of strings
    }
    return bin; 
}

// genPowerSet : Array of String -> Array of Array of Array of Nat :D
//  - genPowerSet(0) -> [ [[]] 
//                      ] 
//  - genPowerSet(3) -> [  [[]]
//                           [[0], [1], [2]]
//                           [[0,1], [0,2], [1,2]]
//                           [[0,1,2]]
//                        ]    
function genPowerSet(n) {
    binaryList = genBinary(n);                   // list of binary strings
    var pS = [];                                 // where the subsets are stored
    for(let i = 0; i < binaryList.length; i++) { // iterate through the list of binary numbers
        var binStr = binaryList[i]; 
        var subset = []; 
        for(let s = 0; s < binStr.length; s++) { // for each index in the binary number, append the index to the subset if there is a 1
            if(binStr[s] == 1)
                subset.push(s); 
        }
        if(subset.length < pS.length) 
            pS[subset.length].unshift(subset); 
            // if the size of the subset is less than the number of distinct size containers in ps, 
            // then append this subset to the front of appropriate size container
        else
            pS.push([subset]);
            // if the size is equal to or greater than the number of distinct size containers in ps
            // eg. [A, B] has 2 elements and ps only has containers for size 0 and 1, 
            // make a new size container with the subset inside
    }
    return pS; 
}

// isSubset : [Array of X] [Array of X] -> Boolean
// This returns whether or not the first array is a subset of the second array
//  - isSubset([],     [1, 2, 3]) -> true
//  - isSubset([3, 1], [1, 2, 3]) -> true
//  - isSubset([2, 4], [1, 2, 3]) -> false 
function isSubset(set1, set2){
    for(var i = 0; i < set1.length; i++){ // for any element in set1
        if(!set2.includes(set1[i]))       // if not an element in set2
            return false;                 // then set1 is not a subset of set2
    }
    return true; 
}

function drawSubsetsCenter(size){
    let r = rBase + (2*rBase / size);
    let data = table_powersets[size];                            // this is a set of sets of size N
    let yScale = d3.scalePoint()                             // this partitions the heigh of the canvas by the number of different set sizes
        .domain(d3.range(0, data.length + 1))
        .range([r+1, height]);
    let largestNumX = data[Math.floor(data.length / 2)].length;
    let largestxScale = d3.scalePoint()
        .domain(d3.range(0,largestNumX))
        .range([r,width-1.1*size*r]);
    for(let setSize = 0; setSize < data.length; setSize++){  // this iterates through the set of sets of different sizes
        let setsOfSizeN = data[setSize];                     // all the sets of some size N
        let ypos = yScale(setSize);                          // the current y position we will place these
        let yBox = svg.append("g")
            .attr("transform", `translate(0, ${ypos})`);
       // let yBox = svg.append("g")
         //   .attr("transform", `translate(${(largestxScale(largestNumX-1)-largestxScale(setsOfSizeN.length-1))/2}, ${ypos})`);
        let xScale = d3.scalePoint()
            .domain(d3.range(0,setsOfSizeN.length))
            .range([(largestxScale(largestNumX-1)-largestxScale(setsOfSizeN.length-1))/2 + r, 
                (largestxScale(largestNumX-1)+largestxScale(setsOfSizeN.length-1))/2]);
        for(let subsetIndex = 0; subsetIndex < setsOfSizeN.length; subsetIndex++){
            let subset = setsOfSizeN[subsetIndex]; 
            let elementContainer = yBox.append("g")
                .attr("transform", `translate(${xScale(subsetIndex)}, 0)`);
            if(setSize == 0){
                drawEmptyCenter(elementContainer, r);
            }
            drawElements(subset, elementContainer, r);
        }
        if(setSize > 0 && lines)
                drawLines(size, setSize, data, largestxScale, yScale,true);
    }
}


function drawSubsetsLeft(size){
    let r = rBase + (2*rBase / size);
    let data = table_powersets[size];                            // this is a set of sets of size N
    let yScale = d3.scalePoint()                             // this partitions the heigh of the canvas by the number of different set sizes
        .domain(d3.range(0, data.length + 1))
        .range([r, height]);
    let largestNumX = data[Math.floor(data.length / 2)].length;
    let largestxScale = d3.scalePoint()
        .domain(d3.range(0,largestNumX))
        .range([r,width-1.1*size*r]);
    for(let setSize = 0; setSize < data.length; setSize++){  // this iterates through the set of sets of different sizes
        let setsOfSizeN = data[setSize];                     // all the sets of some size N
        let ypos = yScale(setSize);                          // the current y position we will place these
        let yBox = svg.append("g")
            .attr("transform", `translate(0, ${ypos})`);
        let xScale = d3.scalePoint()
            .domain(d3.range(0,setsOfSizeN.length))
            .range([largestxScale(0), largestxScale(setsOfSizeN.length-1)]);
        
        for(let subsetIndex = 0; subsetIndex < setsOfSizeN.length; subsetIndex++){
            let subset = setsOfSizeN[subsetIndex];
            let elementContainer = yBox.append("g")
                .attr("transform", `translate(${xScale(subsetIndex)}, 0)`);
            if(setSize == 0){
                drawEmptyCenter(elementContainer, r);
            }   
            drawElements(subset, elementContainer, r);
        }
        if(setSize > 0 && lines)
                drawLines(size,setSize,data,largestxScale,yScale,false);
    }
}
function drawLines(size, setSize, data, largestxScale, yScale, isCenter){
    let r = rBase + (rBase / size);
    let currData = data[setSize];
    let prevData = data[setSize-1];
    let largestNumX = data[Math.floor(data.length / 2)].length;
    let l_xScale_last = largestxScale(largestNumX-1);
    let prev_largest_xScale = largestxScale(prevData.length-1);
    let prev_xScale = d3.scalePoint()
        .domain(d3.range(0,prevData.length))
        .range([largestxScale(0),largestxScale(prevData.length-1)]);
    let curr_largest_xScale = largestxScale(currData.length-1);
    let curr_xScale = d3.scalePoint()
        .domain(d3.range(0,currData.length))
        .range([largestxScale(0),largestxScale(currData.length-1)]);
    if(isCenter){
        prev_xScale = d3.scalePoint()
            .domain(d3.range(0,prevData.length))
            .range([((l_xScale_last-prev_largest_xScale)/2)+r,((l_xScale_last+prev_largest_xScale)/2)]);
        curr_xScale = d3.scalePoint()
            .domain(d3.range(0,currData.length))
            .range([((l_xScale_last-curr_largest_xScale)/2)+r,((l_xScale_last+curr_largest_xScale)/2)]);
    }
    for(let p = 0; p < prevData.length; p++){
        for(let c = 0; c < currData.length; c++){
            if(isSubset(prevData[p],currData[c])){
                let avgIndex = 0;
                prevData[p].forEach(function(d){
                    avgIndex += d;
                });
                avgIndex = avgIndex / prevData[p].length;
                console.log(avgIndex);
                let color;
                if(prevData[p].length == 0){
                    color = "black";
                }
                else
                    color = colorScale(avgIndex);
                svg.append("line")
                    .attr("stroke", color)
                    .attr("stroke-width", 1)
                    .attr("opacity", 0.7)
                    .attr("x1", prev_xScale(p))
                    .attr("y1", yScale(setSize-1)+ (1.75*r))
                    .attr("x2", curr_xScale(c))
                    .attr("y2", yScale(setSize)- (1.75*r))
                    .attr("stroke-linecap", "round");
            }
        }
    }
}

// GIVEN THE SUBSET OF ELEMENTS TO BE DRAWN, AS WELL AS THE CONTAINER THAT THEY BELONG IN
// THIS DRAWS THE ELEMENTS NEXT TO EACH OTHER WITH THE APPROPRIATE COLOR
function drawElements(subset, elementContainer, r){
    subset.forEach(function(element, elementIndex){
        elementContainer.append("circle")
            .attr("r", r)
            .attr("cy", 0)
            .attr("cx", elementIndex * r * 2.1)
            .attr("fill", colorScale(element));
    });
}

function drawEmptyCenter(container, radius){
    container.append("circle")
        .attr("r", radius)
        .attr("cy", 1)
        .attr("cx", 1)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", "1");
}

function drawEmptyLeft(container, radius){
    container.append("circle")
        .attr("r", radius)
        .attr("cy", 1)
        .attr("cx", radius+1)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", "1");
}