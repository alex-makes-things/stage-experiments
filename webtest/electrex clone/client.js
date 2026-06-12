var ws = new WebSocket("ws://localhost:8080");
const button = document.getElementById("btn-read");
const resultText = document.getElementById("uln-l1");
const addressInput = document.getElementById("ip-input");
const deviceInput = document.getElementById("dev-input");
const autoCheckbox = document.getElementById("auto-chk");
ws.onopen = () => {
        console.log("Connected to WebSocket");
    };


ws.onmessage = event => {
        console.log("Received:", event.data);
   
        if(event.data == "INVALIDIP"){
            addressInput.style.border = "0.5px solid red";
        }else if(event.data == "CONNECTIONERROR"){
            ws.close()
            ws = new WebSocket("ws://localhost:8080");
        }
        else{
            addressInput.style.border = "0.5px solid var(--border-input)";

            const values = JSON.parse(event.data);
            for(const cell of values){
                const obj = document.getElementById(cell[0]);
                obj.textContent = parseFloat(cell[1]).toFixed(2);
            }
        }
    };

autoCheckbox.addEventListener("click", function(){
    
    if(ws.readyState == ws.OPEN){
        ws.send(JSON.stringify({address: "CHECKBOX", device_id: autoCheckbox.checked}))
        console.log("Sent checkbox event");
    }
})

button.addEventListener("click", function(){
    
    if(ws.readyState == ws.OPEN){
        ws.send(JSON.stringify({address: addressInput.value, device_id: deviceInput.value}));
        console.log("Sent Modbus request.");
    }
    
})