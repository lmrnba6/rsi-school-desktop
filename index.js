'use strict';
const {app, BrowserWindow } = require('electron');
const path = require('path');
const {autoUpdater} = require('electron-updater');

let waitBeforeClose = true;
//require('update-electron-app')();

const devMode = /electron/.test(path.basename(app.getPath('exe'), '.exe'));

if (devMode) {
	// Set appname and userData to indicate development environment
	app.setName(app.getName() + '-dev');
	app.setPath('userData', app.getPath('userData') + '-dev');

	// Setup reload
	require('electron-reload')(path.join(__dirname, '/dist/app.js'), {
		electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
	});
}

const nativeImage = require('electron').nativeImage;
var image = nativeImage.createFromPath(__dirname + '/dist/assets/images/ico.ico');
// where public folder on the root dir

image.setTemplateImage(true);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

let createWindow = () => {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		show: false,
        titleBarStyle: 'hidden',
        width: 1281,
        height: 800,
        minWidth: 1281,
        minHeight: 800,
        backgroundColor: '#ffff',
        webPreferences: {
            nativeWindowOpen: true
        },
        icon: image
	});
	mainWindow.once('ready-to-show', () => {
		mainWindow.show()
	});

	mainWindow.maximize();

	// and load the index.html of the app.
	mainWindow.loadURL('file://' + __dirname + '/dist/index.html');

	// Open the DevTools.
	if (devMode && process.argv.indexOf('--noDevTools') === -1) {
		mainWindow.webContents.openDevTools();
	}

    mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
        if (frameName === 'modal') {
            // open window as modal
            event.preventDefault()
            // Object.assign(options, {
            //     modal: true,
            //     parent: mainWindow,
            //     width: 100,
            //     height: 100
            // })
            event.newGuest = new BrowserWindow(options)
        }
    })

    // mainWindow.webContents.print({silent:true, printBackground:true});

	// ipcMain.on('rendererIsFinished', (message) => {
	// 	waitBeforeClose = false;
	// 	app.quit();
	// })

	// mainWindow.on('close', (event) => {
	// 	if (waitBeforeClose) {
	// 		mainWindow.webContents.send('closing');
	// 		event.preventDefault();
	// 	}
	// })


	// Emitted when the window is closed.
	mainWindow.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});

	autoUpdater.checkForUpdates();

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) createWindow();
});

//-------------------------------------------------------------------
// Auto updates
//-------------------------------------------------------------------
const sendStatusToWindow = (text) => {
	if (mainWindow) {
		mainWindow.webContents.send('message', text);
	}
};

autoUpdater.on('checking-for-update', () => {
	sendStatusToWindow('Vérification de la mise à jour...');
});
autoUpdater.on('update-available', info => {
	sendStatusToWindow('Mise à jour disponible');
});
autoUpdater.on('update-not-available', info => {
	sendStatusToWindow('Mise à jour non disponible.');
});
autoUpdater.on('error', err => {
	sendStatusToWindow(`Erreur dans la mise à jour automatique: ${err.toString()}`);
});
autoUpdater.on('download-progress', progressObj => {
	sendStatusToWindow(
		`Installation de la mise à jour ${Number(progressObj.percent).toFixed(0)}%`
		// `Vitesse de téléchargement: ${progressObj.bytesPerSecond} - Téléchargé ${progressObj.percent}% (${progressObj.transferred} + '/' + ${progressObj.total} + )`
	);
});
autoUpdater.on('update-downloaded', info => {
	sendStatusToWindow('Mise à jour téléchargée. démarrage de l\'installation');
});

autoUpdater.on('update-downloaded', info => {
	// Wait 5 seconds, then quit and install
	// In your application, you don't need to wait 500 ms.
	// You could call autoUpdater.quitAndInstall(); immediately
	autoUpdater.quitAndInstall();
});

