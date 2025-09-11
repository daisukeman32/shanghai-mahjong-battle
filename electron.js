const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
    // メインウィンドウを作成
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 1024,
        minHeight: 576,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        icon: path.join(__dirname, 'assets/icons/app.png'),
        title: '麻雀学園バトルストーリー',
        show: false, // 初期化完了まで非表示
        autoHideMenuBar: true, // メニューバーを自動的に非表示
        resizable: true
    });

    // ゲームファイルを読み込み
    mainWindow.loadFile('ultimate-shanghai.html');

    // 開発者ツール（開発モードでのみ）
    if (process.argv.includes('--dev')) {
        mainWindow.webContents.openDevTools();
    }

    // ウィンドウが準備できたら表示
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        
        // スプラッシュ効果
        mainWindow.webContents.executeJavaScript(`
            console.log('🌸 麻雀学園バトルストーリー - Electron版起動');
            console.log('📱 ウィンドウサイズ: ${mainWindow.getSize()}');
            console.log('🎮 ゲーム初期化開始...');
        `);
    });

    // ウィンドウが閉じられた時
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // 外部リンクはデフォルトブラウザで開く
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        require('electron').shell.openExternal(url);
        return { action: 'deny' };
    });
}

// アプリケーションの初期化
app.whenReady().then(() => {
    createWindow();

    // macOSでの動作対応
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    // メニューバーを設定（デバッグ用）
    if (process.argv.includes('--dev')) {
        const template = [
            {
                label: 'ファイル',
                submenu: [
                    {
                        label: 'リロード',
                        accelerator: 'CmdOrCtrl+R',
                        click: () => {
                            mainWindow.reload();
                        }
                    },
                    {
                        label: '開発者ツール',
                        accelerator: 'F12',
                        click: () => {
                            mainWindow.webContents.toggleDevTools();
                        }
                    },
                    { type: 'separator' },
                    {
                        label: '終了',
                        accelerator: 'CmdOrCtrl+Q',
                        click: () => {
                            app.quit();
                        }
                    }
                ]
            },
            {
                label: 'ゲーム',
                submenu: [
                    {
                        label: 'フルスクリーン切り替え',
                        accelerator: 'F11',
                        click: () => {
                            mainWindow.setFullScreen(!mainWindow.isFullScreen());
                        }
                    },
                    {
                        label: 'タイトルに戻る',
                        click: () => {
                            mainWindow.webContents.executeJavaScript(`
                                if (window.gameManager) {
                                    window.gameManager.returnToTitle();
                                }
                            `);
                        }
                    }
                ]
            }
        ];
        
        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    }
});

// 全ウィンドウが閉じられた時
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPCイベントハンドラ（ゲームからの通信）
ipcMain.handle('save-game-data', async (event, data) => {
    try {
        const savePath = path.join(app.getPath('userData'), 'save.json');
        fs.writeFileSync(savePath, JSON.stringify(data, null, 2));
        return { success: true };
    } catch (error) {
        console.error('セーブエラー:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-game-data', async (event) => {
    try {
        const savePath = path.join(app.getPath('userData'), 'save.json');
        if (fs.existsSync(savePath)) {
            const data = fs.readFileSync(savePath, 'utf8');
            return { success: true, data: JSON.parse(data) };
        }
        return { success: false, error: 'セーブファイルが見つかりません' };
    } catch (error) {
        console.error('ロードエラー:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-app-version', async (event) => {
    return app.getVersion();
});

// ゲーム統計記録
ipcMain.handle('record-stats', async (event, stats) => {
    try {
        const statsPath = path.join(app.getPath('userData'), 'stats.json');
        let allStats = {};
        
        if (fs.existsSync(statsPath)) {
            allStats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
        }
        
        allStats[Date.now()] = {
            timestamp: new Date().toISOString(),
            ...stats
        };
        
        fs.writeFileSync(statsPath, JSON.stringify(allStats, null, 2));
        return { success: true };
    } catch (error) {
        console.error('統計記録エラー:', error);
        return { success: false, error: error.message };
    }
});

console.log('🚀 Electron メインプロセス初期化完了');
console.log('📁 アプリケーションパス:', app.getAppPath());
console.log('💾 ユーザーデータパス:', app.getPath('userData'));