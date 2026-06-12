const ModbusRTU = require("modbus-serial");
const WebSocket = require("ws");
const net = require('net');
const { send } = require("process");

var client = new ModbusRTU();
client.setTimeout(10000);
var wss = new WebSocket.Server({ port: 8080 });
var currentAddress = "";
var currentId = 0;
var currentCheckbox = false;
var failedConnectionAttempts = 0;

const registerToCell = new Map([
    [200, "thd-uln-l1"],
    [202, "thd-uln-l2"],
    [204, "thd-uln-l3"],
    [206, "thd-ull-l1"],
    [208, "thd-ull-l2"],
    [210, "thd-ull-l3"],
    [212, "thd-i-l1"],
    [214, "thd-i-l2"],
    [216, "thd-i-l3"],
    [218, "f-sum"],
    [220, "uln-l1"],
    [222, "uln-l2"],
    [224, "uln-l3"],
    [226, "ull-l1"],
    [228, "ull-l2"],
    [230, "ull-l3"],
    [232, "i-l1"],
    [234, "i-l2"],
    [236, "i-l3"],
    [238, "in-sum"],
    [240, "p-l1"],
    [242, "p-l2"],
    [244, "p-l3"],
    [246, "q-l1"],
    [248, "q-l2"],
    [250, "q-l3"],
    [252, "s-l1"],
    [254, "s-l2"],
    [256, "s-l3"],
    [258, "pf-l1"],
    [260, "pf-l2"],
    [262, "pf-l3"],
    [264, "thd-uln-sum"],
    [266, "thd-ull-sum"],
    [268, "thd-i-sum"],
    [270, "uln-sum"],
    [272, "ull-sum"],
    [274, "i-sum"],
    [276, "p-sum"],
    [278, "q-sum"],
    [280, "s-sum"],
    [282, "pf-sum"]
]);


async function sendTableVals(ws, address, device_id) {
    if(client.isOpen)
        {
            currentAddress = address;
            currentId = device_id;
            const data = await client.readInputRegisters(200, 84); //Read all necessary registers at once
            let offset = 0;
            let values = [];
            for(let i = 0; i < 42; i++){
                const value = data.buffer.readFloatBE(offset);
                values.push([registerToCell.get(200+(i*2)), value]);
                offset += 4;
            }
            ws.send(JSON.stringify(values));
            failedConnectionAttempts = 0; //Successful request, thus the consecutive failed connection counter is reset
        }
        //Reattempt connection 4 times before giving up
    else if(failedConnectionAttempts < 5) //This makes sure data is still provided after being afk
        {
            console.log("Port not open, retrying");
            client = new ModbusRTU();
            await client.connectTCP(address, { port: 502 });
            await client.setID(device_id);
            failedConnectionAttempts++;
            await sendTableVals(ws, address, device_id);
        }
    else{
        console.log("Couldn't re-establish Modbus connection");
    }
}

async function autoUpdate(ws){
    if(currentCheckbox){
        await sendTableVals(ws, currentAddress, currentId);
        await setTimeout(autoUpdate, 1000, ws, currentAddress, currentId);  //Periodic recursion
    }
}

wss.on("connection", async ws => {
    console.log("Client connected");
    //Reset memory in case of browser refresh
    currentAddress = "";
    currentId = 0; 
    currentCheckbox = false;

ws.on("message", async message => {
    console.log("Message received");
    const { address, device_id } = JSON.parse(message);
    try 
    {
        if(address == "CHECKBOX"){ //If message is a checkbox event, begin recursive modbus calls
            currentCheckbox = device_id;
            if(currentAddress != ""){
                await autoUpdate(ws, address, device_id);
            }
            return;
        }
        if(net.isIP(address)==0) //Check if received address is in valid ip notation
        {
            console.log(address);
            ws.send("INVALIDIP");
            return;
        }else
        {
            if(currentAddress != address || currentId != device_id) //Avoid overloading the modbus connection by removing redundat reconnection with the same credentials
            {
                await client.connectTCP(address, { port: 502 });
                await client.setID(device_id);
            }
            await sendTableVals(ws, address, device_id);
        }
        //This catch block kills the server completely (TO BE FIXED)
    } catch (err) {
        currentAddress = "";
        currentId = 0;
        ws.send("CONNECTIONERROR");
        console.log(err);
        return;
    }
});
});
