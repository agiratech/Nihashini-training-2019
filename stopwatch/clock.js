var seconds = 0;
var minutes = 0;
var hours = 0;

let displaySeconds = 0;
let displayMinutes = 0;
let displayHours = 0;

let interval = null;
let status = "stopped";

function stopWatch(){
    seconds++;

    if(seconds/60 === 1){
        seconds = 0;
        minutes++;

        if(minutes/60 === 1){
            minutes = 0;
            hours++;
        }
    }
    
    if(seconds < 10){
        displaySeconds = "0" + seconds.toString();
    }
    else{
        displaySeconds = seconds;
    }
    if(minutes < 10){
        displayMinutes = "0" + minutes.toString();
    }
    else{
        displayMinutes = minutes;
    }
    if(hours < 10){
        displayHours = "0" + hours.toString();
    }
    else{
        displayHours = hours;
    }
    document.getElementById("display").innerHTML = displayHours + ":" + displayMinutes + ":" + displaySeconds;
}

function startStop(){
    if(status === "stopped"){
        interval = window.setInterval(stopWatch, 10);
        document.getElementById("startStop").innerHTML = "Stop";
        status = "started";
    }
    else{
        window.clearInterval(interval); 
        document.getElementById("startStop").innerHTML = "Start";
        status = "stopped";

    }
}

function count(){
    var node = document.createElement("LI");
    var textnode = document.createTextNode(displayHours + ":" + displayMinutes + ":" + displaySeconds);
    node.appendChild(textnode);
    document.getElementById("myList").appendChild(node);
}

function reset(){
    // window.clearInterval(interval);
    // seconds = 0;
    // minutes = 0;
    // hours = 0;
    // document.getElementById("display").innerHTML = "00:00:00";
    // document.getElementById("startStop").innerHTML = "Start";
    // above codes for just to restart and will never erase the entries but then the next line reload it as before
    window.location.reload();
}