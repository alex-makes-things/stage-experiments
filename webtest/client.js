const ws = new WebSocket("ws://localhost:8080");
const button = document.getElementById("readBTN");
const resultText = document.getElementById("Data");
const addressInput = document.getElementById("addressText");
ws.onopen = () => {
        console.log("Connected to WebSocket");
    };


ws.onmessage = event => {
        console.log("Received:", event.data);
   
        if(event.data == '{"error":"Port Not Open"}'){
            console.log(typeof(event.data));
            resultText.textContent = "Reload server";
            console.error("Error in request: ", event.data.error);

        }else{
            resultText.textContent = parseFloat(event.data).toFixed(2);;
        }
    };


button.addEventListener("click", function(){
    
    if(ws.readyState == 1){
        ws.send(JSON.stringify({address: addressInput.value, length: 2}));
        console.log("Sent Modbus request.");
    }
    
})