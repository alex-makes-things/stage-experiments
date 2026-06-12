import tkinter as tk
import pymodbus.client as ModbusClient
import ipaddress

def readInputModBus(client, address, bytes=2, device_id=1, data_type=ModbusClient.ModbusTcpClient.DATATYPE.FLOAT32):
    raw_data = client.read_input_registers(address=address, count = bytes, device_id = device_id)
    if raw_data.isError():
        print(f"Holding register read error: {raw_data}")
        return raw_data
    return client.convert_from_registers(raw_data.registers, data_type = data_type)



#---------------------------------WINDOW----------------------------------------

app = tk.Tk()
icon = tk.PhotoImage(file="C:/Users/Alex Malato/Downloads/electrex.png")
app.iconphoto(False, icon)
app.title("Electrex RMS reader (alpha)")
app.resizable(False, False)
app.geometry("1100x590")

#---------------------------------DATA------------------------------------------

ip_var = tk.StringVar()
device_var = tk.IntVar(value=1)
dataVals = [[tk.DoubleVar() for _ in range(4)] for _ in range(12)]
modClient = 0

tableTopLabels = ["L1", "L2", "L3", "∑"] 
tableSideLabels = ["UL-N [V]", "UL-L [V]", "I [A]", "THD UL-N [%]", "THD UL-L [%]", "THD I [%]", "PF", "P+/- [W]", "Q+/- [VAR]", "S+/- [VA]", "IN [A]", "f [Hz]"]

addressToTable = {
    220: dataVals[0][0], 222: dataVals[0][1], 224: dataVals[0][2], 270: dataVals[0][3],
    226: dataVals[1][0], 228: dataVals[1][1], 230: dataVals[1][2], 272: dataVals[1][3],
    232: dataVals[2][0], 234: dataVals[2][1], 236: dataVals[2][2], 274: dataVals[2][3],
    200: dataVals[3][0], 202: dataVals[3][1], 204: dataVals[3][2], 264: dataVals[3][3],
    206: dataVals[4][0], 208: dataVals[4][1], 210: dataVals[4][2], 266: dataVals[4][3],
    212: dataVals[5][0], 214: dataVals[5][1], 216: dataVals[5][2], 268: dataVals[5][3],
    258: dataVals[6][0], 260: dataVals[6][1], 262: dataVals[6][2], 282: dataVals[6][3],
    240: dataVals[7][0], 242: dataVals[7][1], 244: dataVals[7][2], 276: dataVals[7][3],
    246: dataVals[8][0], 248: dataVals[8][1], 250: dataVals[8][2], 278: dataVals[8][3],
    252: dataVals[9][0], 254: dataVals[9][1], 256: dataVals[9][2], 280: dataVals[9][3],
                                                                   238: dataVals[10][3],
                                                                   218: dataVals[11][3]
}
updateValues = False

#---------------------------------GUI-------------------------------------------

frame = tk.Frame(app, bg="white", padx=10, pady=10)
frame.pack(fill=tk.BOTH, expand=True)

topui = tk.Frame(frame, bg="white", padx=30, pady=10)
topui.pack(fill=tk.X, expand=False)

ip_label = tk.Label(topui, text="Host", font="Verdana", bg="white")
ip_address = tk.Entry(topui, textvariable=ip_var, font="Verdana", borderwidth=4)
ip_label.grid(row=0, column=0, padx=(40, 0))
ip_address.grid(row=0, column=1)

device_label = tk.Label(topui, text="Device ID", font="Verdana", bg="white")
device_id = tk.Entry(topui, textvariable=device_var, font="Verdana", borderwidth=4)
device_label.grid(row=0, column=2, padx=(40, 0))
device_id.grid(row=0, column=3)

def updateTable():
    global addressToTable
    global modClient
    global app
    global updateValues
    if updateValues:
        try:
            ipaddress.ip_address(ip_var.get())
        except ValueError:
            print("Invalid ip address.")
            return

        if(modClient==0):
            modClient = ModbusClient.ModbusTcpClient(ip_var.get(), port=502)
            modClient.connect()
            print("Modbus connection established.")
        else:
            modClient.comm_params.host = ip_var.get()

        
        for register in addressToTable:
            raw_data = modClient.read_input_registers(address=register, count = 2, device_id = device_var.get())
            if raw_data.isError():
                print(f"Holding register read error: {raw_data}")
                updateValues = False
                return
            reading = modClient.convert_from_registers(raw_data.registers, data_type = ModbusClient.ModbusTcpClient.DATATYPE.FLOAT32)
            addressToTable[register].set(round(reading, 2))
        app.after(1000, updateTable)


def readBtnCallback():
    global updateValues
    updateValues = True
    updateTable()

    

def stopBtnCallback():
    global updateValues
    updateValues = False

readBtn = tk.Button(topui, text="Read", font= ("Verdana", 16), padx=30, bg="#a8ff76", command=readBtnCallback)
readBtn.grid(row=0, column=4, padx=(60, 10))

stopBtn = tk.Button(topui, text="Stop", font= ("Verdana", 16), padx=30, bg="#ff4848", command=stopBtnCallback)
stopBtn.grid(row=0, column=5)

#5x12
tableFrame = tk.Frame(frame, padx=20, pady=20, relief="groove")
tableFrame.pack(fill=tk.BOTH, expand=True)

tableCells = [[tk.Label(tableFrame, width=28, padx=4,height=2, pady=3, relief="ridge", font=("Verdana", 8), bg="#d4d9ec") for _ in range(5)] for _ in range(13)]



for i in range(5):
    if(i!=0):
        tableCells[0][i].config(bg="#342573", fg="white", text=tableTopLabels[i-1])
    for b in range(13):
        tableCells[b][0].config(bg="#342573", fg="white")
        tableCells[0][0].config(bg="#f0f0f0", relief="flat")

        if(b!=0):
            tableCells[b][0].config(text=tableSideLabels[b-1])
            if(i!=0):
                tableCells[b][i].config(textvariable=dataVals[b-1][i-1])

        if(b>=11 and i!=0 and i!=4):
            tableCells[b][i].config(bg="#f0f0f0", relief="flat", fg="white")

        tableCells[b][i].grid(row=b, column=i, sticky="nsew")

app.mainloop()

if(modClient != 0):
    modClient.close()
    print("Modbus connection terminated.")