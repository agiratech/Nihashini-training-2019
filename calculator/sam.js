       
       
      var canvas = document.querySelector("#canvas");
      var c = canvas.getContext('2d');
      canvas.height = 500;
      canvas.width = 1000;
      var painting = false;
     var brush = document.getElementById("brush");

      function startPoint(e){
          painting = true;
          c.lineTo(e.clientX, e.clientY);  
          c.stroke();
          c.beginPath();
          c.moveTo(e.clientX, e.clientY); 
      }
  
          function draw(e){
          if(!painting) return;
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
      
      
 function brushcli(){
          c.strokeStyle = document.getElementById("colour").value;
          c.lineWidth = document.getElementById("brushsize").value;
}
canvas.addEventListener("mousedown", startPoint);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", endPoint);
brush.addEventListener("click", brushcli);
    
      