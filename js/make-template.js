let coordinates = [];
let coordinatesWithTime = [];
let t = 0;
let recursion;
let chart;
let flag = true

let table = document.getElementById('template-table')
// table.addEventListener('mouseenter', setTemplate);
table.addEventListener('mousemove', setTemplate);
table.addEventListener('mouseleave', clearCoordinates);


function setTemplate(event){
    let x = event.clientX;
    let y = event.clientY;
    let t = moment().valueOf()
    coordinatesWithTime.push([x,y,t])
}

// function setTime(event){  
//     flag = false
//     let x = coordinates[coordinates.length-1][0]
//     let y = coordinates[coordinates.length-1][1]
//     coordinatesWithTime.push([x,y,t])
//     recursion = setInterval( recur => {
//         t += 10;
//         x = coordinates[coordinates.length-1][0]
//         y = coordinates[coordinates.length-1][1]
//         coordinatesWithTime.push([x,y,t])
//     },10)
// } wrong

function clearCoordinates(event){
    if(chart){
        chart.destroy();
        chart = null
    }
    // t = 0;
    // clearInterval(recursion)
    // console.log(coordinatesWithTime)
    chart = generateChart()
    flag = true
    coordinates = []
    coordinatesWithTime = []
}

function generateChart(){
    let y =['y'];
    let x = ['x'];
    let t = ['t'];
    let v = ['v'];
    let i = 0
    // for( let pair of coordinatesWithTime){
    //     if(coordinatesWithTime.length > i){
            
    //     }
    //     x.push(pair[0])
    //     y.push(pair[1])
    //     t.push(pair[2])
    // }
    let array = []
    // array.push(['v','t'])
    for (let i = 0 ; i < coordinatesWithTime.length -1 ; i++){
        let dX = coordinatesWithTime[i+1][0] - coordinatesWithTime[i][0]
        let dY = coordinatesWithTime[i+1][1] - coordinatesWithTime[i][1]
        let dT = coordinatesWithTime[i+1][2] - coordinatesWithTime[i][2]
        let vX = dX / dT
        let vY = dY / dT
        let ti = coordinatesWithTime[i+1][2]
        let v = Math.sqrt(Math.pow(vX, 2) + Math.pow(vY, 2))
        x.push(v)
        t.push(ti)
    }
    array.push(x,t)
    // console.log(array)
    chart = c3.generate({
        bindto: '#chart',
        data: {
            xs: {
                x: 't',
            },
            columns: array,
        },
        axis: {
            x:{
                label:'Time'
            },
            y:{
                label:'Total Velocity'
            }
        }
    });
}