// // main.js
 
// // 引入electron
// const { BrowserWindow, app } = require("electron");
 
// // 实例化窗口
// const createWindow = () => {
//     // 创建浏览器窗口
//     const win = new BrowserWindow({
//         width: 800,
//         height: 600,
//         webPreferences: {
//             nodeIntegration: true,
//             contextIsolation: false,
//         },
 
//     });
 
//     // 加载index.html文件
//     win.loadFile("./index.html");
// };
 
// // 创建应用
// app.whenReady().then(() => {
//     createWindow();
 
//     // 监听所有窗口关闭事件
//     app.on("window-all-closed", () => {
//         // 在 macOS 上，除非用户通过 Cmd + Q 明确退出，否则应用程序不会关闭
//         if (process.platform !== "darwin") {
//             app.quit();
//         }
//     });
 
//     // 当用户点击 dock 图标时，显示应用程序窗口
//     app.on("activate", () => {
//         if (BrowserWindow.getAllWindows().length === 0) {
//             createWindow();
//         }
 
//     });
 
// });


 
// 引入electron
const { BrowserWindow, app } = require("electron");
const { spawn } = require('child_process');
const path = require('path');

let pythonProcess = null;

// 判断是否为开发环境（不需要额外安装模块）
const isDev = process.env.NODE_ENV === 'development' || 
              process.defaultApp || 
              /[\\/]electron[\\/]/.test(process.execPath);

// 启动Python后端
function startPythonBackend() {
  let pythonExePath;
  
  if (isDev) {
    // 开发环境：运行 .py 文件
    console.log('开发模式：启动 Python WebSocket 服务');
    pythonExePath = 'python';
    const scriptPath = path.join(__dirname, 'python', 'websocket.py');
    pythonProcess = spawn(pythonExePath, [scriptPath]);
  } else {
    // 生产环境：运行打包好的 websocket.exe 文件
    console.log('生产模式：启动 websocket.exe');
    pythonExePath = path.join(process.resourcesPath, 'python', 'websocket.exe');
    pythonProcess = spawn(pythonExePath, []);
  }

  // 处理Python进程输出
  pythonProcess.stdout.on('data', (data) => {
    console.log('Python输出:', data.toString());
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error('Python错误:', data.toString());
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python进程退出，代码: ${code}`);
    pythonProcess = null;
  });

  pythonProcess.on('error', (error) => {
    console.error('启动Python进程失败:', error);
  });
}

// 停止Python后端
function stopPythonBackend() {
  if (pythonProcess) {
    console.log('停止Python WebSocket服务');
    pythonProcess.kill();
    pythonProcess = null;
  }
}
 
// 实例化窗口
const createWindow = () => {
    // 创建浏览器窗口
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
 
    // 加载index.html文件
    win.loadFile("./index.html");
};
 
// 创建应用
app.whenReady().then(() => {
    createWindow();
    startPythonBackend(); // 启动Python WebSocket服务
 
    // 监听所有窗口关闭事件
    app.on("window-all-closed", () => {
        // 在 macOS 上，除非用户通过 Cmd + Q 明确退出，否则应用程序不会关闭
        if (process.platform !== "darwin") {
            stopPythonBackend(); // 停止Python服务
            app.quit();
        }
    });
 
    // 当用户点击 dock 图标时，显示应用程序窗口
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
            startPythonBackend(); // 重新启动Python服务
        }
    });
});

// 应用退出前停止Python服务
app.on('before-quit', () => {
  stopPythonBackend();
});