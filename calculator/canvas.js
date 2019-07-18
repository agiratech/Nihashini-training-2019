       
       
       var canvas = document.querySelector("#canvas");
        var c = canvas.getContext('2d');
        canvas.height = 500;
        canvas.width = 1000;
        var painting = false;

        function startPoint(e){
            painting = true;
            draw(e);
        }
    
            function draw(e){

            if(!painting) return;
            c.strokeStyle = document.getElementById("colour").value;
            console.log(document.getElementById("colour").value);
            c.lineWidth = document.getElementById("brushsize").value;
            c.lineCap = "round";
            c.lineTo(e.clientX, e.clientY);  
            c.stroke();
            c.beginPath();
            c.moveTo(e.clientX, e.clientY); 
        }
        
        function endPoint(){
            painting = false;
            c.beginPath();
        } 
        canvas.addEventListener("mousedown", startPoint);
        canvas.addEventListener("mousemove", draw);
        canvas.addEventListener("mouseup", endPoint);
        
function erase(){
            document.getElementById("colour").value = "#ffffff";

}
        