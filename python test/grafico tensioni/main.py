import pymodbus.client as ModbusClient
import time
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from itertools import count

def readInputModBus(client, address, bytes=2, device_id=1, data_type=ModbusClient.ModbusTcpClient.DATATYPE.FLOAT32):
    raw_data = client.read_input_registers(address=address, count = bytes, device_id = device_id)
    if raw_data.isError():
        print(f"Holding register read error: {raw_data}")
        return 0
    return client.convert_from_registers(raw_data.registers, data_type = data_type)


#-------------------------------------------------------------------------------------------------------------

client = ModbusClient.ModbusTcpClient("192.168.45.160", port=502)
client.connect()

x, y1, y2, y3 = [], [], [], []
index = count()

def animate(i):
    data = readInputModBus(client, 220, bytes=6)

    for i in range(len(data)):
        data[i] = round(data[i], 2)
    
    x.append(time.time())
    y1.append(data[0])
    y2.append(data[1])
    y3.append(data[2])

    plt.cla()
    plt.plot(x, y1, label="U1N")
    plt.plot(x, y2, label="U2N")
    plt.plot(x, y3, label="U3N")

    plt.title("Tensioni RMS fase-neutro", fontsize=16, fontweight='bold', loc='center')
    plt.xlabel("Tempo (s)", fontsize=16, fontweight='bold', loc='center')
    plt.ylabel("Tensione (VAC)", fontsize=16, fontweight='bold', loc='center')
    plt.legend(loc="lower right")
    plt.grid()
    plt.tight_layout()

anim = FuncAnimation(plt.gcf(), animate, interval=500)
plt.show()