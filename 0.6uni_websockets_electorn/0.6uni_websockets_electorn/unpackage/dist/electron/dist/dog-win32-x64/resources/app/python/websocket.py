import asyncio
import websockets
import json
from websockets.asyncio.server import broadcast

connections = set()

async def handler(websocket):
    # print(f"收到消息{websocket}")
    # print(f"收到消息{websocket.request.headers}")
    # print(websocket.request.path)
    connections.add(websocket)
    async for message in websocket:
        print(f"收到消息: {message}")
        try:
            # 解析消息
            data = json.loads(message)
            if data.get('action') == 'start':
                print("开始执行程序")
                event = {
                "type": "play",
                    }
                websockets.broadcast(connections,json.dumps("event"))
                # await websocket.send("程序已启动")
                
        except json.JSONDecodeError:
            print("接收到的消息不是有效的JSON格式")
        except Exception as e:
            print(f"处理消息时发生错误: {e}")

async def main():
    # async with websockets.serve(handler, "0.0.0.0", 9387):
    async with websockets.serve(handler, "0.0.0.0", 51111):
        await asyncio.Future()  # run forever

asyncio.run(main())