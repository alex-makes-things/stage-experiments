var ws = new WebSocket("ws://localhost:8080");
const button = document.getElementById("btn-read");
const resultText = document.getElementById("uln-l1");
const addressInput = document.getElementById("ip-input");
const deviceInput = document.getElementById("dev-input");
const autoCheckbox = document.getElementById("auto-chk");
const ctx = document.getElementById('myChart');
const tableDataCells = document.getElementsByClassName("table-data-cell");
const resetBtn = document.getElementById("btn-reset");

var lastSentIp = "";
var lastRequestTime = 0;
var lastRequestSuccessful = true;

const tableIds = [
    "thd-uln-l1",
    "thd-uln-l2",
    "thd-uln-l3",
    "thd-ull-l1",
    "thd-ull-l2",
    "thd-ull-l3",
    "thd-i-l1",
    "thd-i-l2",
    "thd-i-l3",
    "f-sum",
    "uln-l1",
    "uln-l2",
    "uln-l3",
    "ull-l1",
    "ull-l2",
    "ull-l3",
    "i-l1",
    "i-l2",
    "i-l3",
    "in-sum",
    "p-l1",
    "p-l2",
    "p-l3",
    "q-l1",
    "q-l2",
    "q-l3",
    "s-l1",
    "s-l2",
    "s-l3",
    "pf-l1",
    "pf-l2",
    "pf-l3",
    "thd-uln-sum",
    "thd-ull-sum",
    "thd-i-sum",
    "uln-sum",
    "ull-sum",
    "i-sum",
    "p-sum",
    "q-sum",
    "s-sum",
    "pf-sum"]


const graphLabels = [
    "THD U_LN L1 [%]",
    "THD U_LN L2 [%]",
    "THD U_LN L3 [%]",
    "THD U_LL L1 [%]",
    "THD U_LL L2 [%]",
    "THD U_LL L3 [%]",
    "THD I L1 [%]",
    "THD I L2 [%]",
    "THD I L3 [%]",
    "f Σ [Hz]",
    "U_LN L1 [V]",
    "U_LN L2 [V]",
    "U_LN L3 [V]",
    "U_LL L1 [V]",
    "U_LL L2 [V]",
    "U_LL L3 [V]",
    "I L1 [A]",
    "I L2 [A]",
    "I L3 [A]",
    "I_N Σ [A]",
    "P L1 [kW]",
    "P L2 [kW]",
    "P L3 [kW]",
    "Q L1 [kvar]",
    "Q L2 [kvar]",
    "Q L3 [kvar]",
    "S L1 [kVA]",
    "S L2 [kVA]",
    "S L3 [kVA]",
    "PF L1",
    "PF L2",
    "PF L3",
    "THD U_LN Σ [%]",
    "THD U_LL Σ [%]",
    "THD I Σ [%]",
    "U_LN Σ [V]",
    "U_LL Σ [V]",
    "I Σ [A]",
    "P Σ [kW]",
    "Q Σ [kvar]",
    "S Σ [kVA]",
    "PF Σ"
]
const graphColors = [
    'rgb(255, 0, 0)',
    'rgb(255, 127, 0)',
    'rgb(255, 255, 0)',
    'rgb(127, 255, 0)',
    'rgb(0, 255, 0)',
    'rgb(0, 255, 127)',
    'rgb(0, 255, 255)',
    'rgb(0, 127, 255)',
    'rgb(0, 0, 255)',
    'rgb(127, 0, 255)',
    'rgb(255, 0, 255)',
    'rgb(255, 0, 127)',
    'rgb(255, 32, 0)',
    'rgb(255, 159, 0)',
    'rgb(223, 255, 0)',
    'rgb(95, 255, 0)',
    'rgb(0, 255, 32)',
    'rgb(0, 255, 159)',
    'rgb(0, 223, 255)',
    'rgb(0, 95, 255)',
    'rgb(32, 0, 255)',
    'rgb(159, 0, 255)',
    'rgb(255, 0, 223)',
    'rgb(255, 0, 95)',
    'rgb(255, 64, 0)',
    'rgb(255, 191, 0)',
    'rgb(191, 255, 0)',
    'rgb(64, 255, 0)',
    'rgb(0, 255, 64)',
    'rgb(0, 255, 191)',
    'rgb(0, 191, 255)',
    'rgb(0, 64, 255)',
    'rgb(64, 0, 255)',
    'rgb(191, 0, 255)',
    'rgb(255, 0, 191)',
    'rgb(255, 0, 64)',
    'rgb(255, 96, 0)',
    'rgb(255, 223, 0)',
    'rgb(159, 255, 0)',
    'rgb(32, 255, 0)',
    'rgb(0, 255, 96)',
    'rgb(0, 255, 223)'
]

var dataChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: []
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation:{
        duration: 100
      },
      plugins: {
          legend: {
            position: 'right',       // molto meglio con tanti dataset
            labels: {
              boxWidth: 10,
              font: { size: 14 },
              padding: 6
            }
          }
        },
      scales: {
        y: {
            border: {
                display: true,
                color: "rgb(50, 97, 124)"
            },
            grid: {
                display: true,
                color: "rgb(39, 39, 39)",
                drawOnChartArea: true,
                drawTicks: true,
            }
        },
        x: {
            border: {
                display: true,
                color: "rgb(50, 97, 124)"
            },
            grid: {
                display: true,
                color: "rgb(39, 39, 39)",
                drawOnChartArea: true,
                drawTicks: true,
            }
        }
      }
    }
  });

let counter = 0;
for(let label of graphLabels){
    dataChart.data.datasets.push({
        label: label,
        data: [],
        borderColor: graphColors[counter],
        backgroundColor: graphColors[counter],
        borderWidth: 1,
        tension: 0.15,
        pointRadius:0.4,
        hidden: true
    });
    counter++;
}

for(let cell of tableDataCells){
    cell.addEventListener("click", function(){
    const graphIndex = tableIds.indexOf(cell.id);
    const graphVisibility = dataChart.data.datasets[graphIndex].hidden;
    dataChart.data.datasets[graphIndex].hidden = !graphVisibility;
    dataChart.update();
    cell.style.border = (graphVisibility) ?  "2px solid ".concat(graphColors[graphIndex]) : "";
});
}

function getCurrentTimeString() {
    const now = new Date();

    // Extract hours, minutes, and seconds
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    // Pad with leading zeros if needed
    hours = String(hours).padStart(2, '0');
    minutes = String(minutes).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

ws.onopen = () => {
        console.log("Connected to WebSocket");
    };


ws.onmessage = event => {
        console.log("Received:", event.data);
   
        if(event.data == "INVALIDIP" || event.data == "CONNECTIONERROR"){
            addressInput.style.border = "0.5px solid red";
            if(event.data == "CONNECTIONERROR"){
                ws.close();
                ws = new WebSocket("ws://localhost:8080");
            }
            lastRequestSuccessful = false;
        }
        else{
            let i = 0;
            addressInput.style.border = "0.5px solid var(--border-input)";

            dataChart.data.labels.push(getCurrentTimeString());
            
            const values = JSON.parse(event.data);
            for(const cell of values){
                const obj = document.getElementById(cell[0]);
                const roundedVal = parseFloat(cell[1]).toFixed(2);
                obj.textContent = roundedVal;
                dataChart.data.datasets[i].data.push(roundedVal);
                i++;
            }

            dataChart.update();
            lastRequestSuccessful = true;
        }
    };

autoCheckbox.addEventListener("click", function(){
    if(Date.now() - lastRequestTime >= 600){
        if(ws.readyState == ws.OPEN){
            ws.send(JSON.stringify({address: "CHECKBOX", device_id: autoCheckbox.checked}));
            console.log("Sent checkbox event");
        }
        lastRequestTime = Date.now();
    }
})

button.addEventListener("click", function(){
    if(lastRequestSuccessful || lastSentIp != addressInput.value){
        if(Date.now() - lastRequestTime >= 600){
            if(ws.readyState == ws.OPEN){
                ws.send(JSON.stringify({address: addressInput.value, device_id: deviceInput.value}));
                console.log("Sent Modbus request.");
                lastSentIp = addressInput.value;
            }
            lastRequestTime = Date.now();
        }
    }
})

resetBtn.addEventListener("click", function(){
    dataChart.data.labels = [];
    for(dataset of dataChart.data.datasets){
        dataset.data = [];
    }

    dataChart.update();
})