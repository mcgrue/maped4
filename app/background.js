// This is main process of Electron, started as first thing when the Electron
// app starts, and running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

var app = require('app');
var BrowserWindow = require('browser-window');
var env = require('./vendor/electron_boilerplate/env_config');
//var devHelper = require('./vendor/electron_boilerplate/dev_helper');
var windowStateKeeper = require('./vendor/electron_boilerplate/window_state');

var mainWindow;

// Preserver of the window size and position between app launches.
var mainWindowState = windowStateKeeper('main', {
    width: 800,
    height: 600
});

app.on('ready', function () {

    mainWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height
    });

    if (mainWindowState.isMaximized) {
        mainWindow.maximize();
    }

    if (env.name === 'test') {
        mainWindow.loadUrl('file://' + __dirname + '/spec.html');
    } else {
        mainWindow.loadUrl('file://' + __dirname + '/app.html');
    }

    if (env.name !== 'production') {
        var getDevToolsMenu = function() {
            var app = require('app');
            var Menu = require('menu');
            var BrowserWindow = require('browser-window');

            var template = [{
                label: 'Development',
                submenu: [{
                        label: 'Reload',
                        accelerator: 'CmdOrCtrl+R',
                        click: function () {
                            BrowserWindow.getFocusedWindow().reloadIgnoringCache();
                        }
                    },{
                        label: 'Toggle DevTools',
                        accelerator: 'Alt+CmdOrCtrl+I',
                        click: function () {
                            BrowserWindow.getFocusedWindow().toggleDevTools();
                        }
                    },{
                        label: 'Quit',
                        accelerator: 'CmdOrCtrl+Q',
                        click: function () {
                            app.quit();
                        }
                    }]
                }];

            return template;
        };
    }

    var buildMainMenu = function() {
        var Menu = require("menu");

        // Create the Application's main menu
        var template = [{
            label: "File",
            submenu: [
                { label: "Save", accelerator: "CmdOrCtrl+S", click: function() { 
                    mainWindow.webContents.executeJavaScript('window.$$$save();');
                } },
                { label: "Load", accelerator: "CmdOrCtrl+L", click: function() { 
                    mainWindow.webContents.executeJavaScript('window.$$$load();');
                } },
                { type: "separator" },
                { label: "About Application", click: function() { 
                    mainWindow.webContents.executeJavaScript('window.$$$about_maped4();');
                } },
                { type: "separator" },
                { label: "Refresh", accelerator: "Command+R", click: function() { app.refresh(); }},
                { type: "separator" },
                { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
            ]}, {
            label: "Edit",
            submenu: [
                /*
                { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
                { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
                { type: "separator" },
                { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
                { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
                { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
                { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
                */
            ]}, {
            label: "Palettes",

            submenu: [
                { label: "Map",
                    click: function() { 
                        mainWindow.webContents.executeJavaScript('window.$$$toggle_pallete("map");'); 
                    }
                },
                { label: "Tools",
                    click: function() { 
                        mainWindow.webContents.executeJavaScript('window.$$$toggle_pallete("tool");'); 
                    }
                 },
                { label: "Info",
                    click: function() { 
                        mainWindow.webContents.executeJavaScript('window.$$$toggle_pallete("info");'); 
                    }
                 },
                { label: "Layers",
                    click: function() { 
                        mainWindow.webContents.executeJavaScript('window.$$$toggle_pallete("layers");'); 
                    }
                 },
                { label: "Zones",
                    click: function() { 
                        mainWindow.webContents.executeJavaScript('window.$$$toggle_pallete("zones");'); 
                    }
                 },
                { label: "Entities",
                    click: function() { 
                        mainWindow.webContents.executeJavaScript('window.$$$toggle_pallete("entity");'); 
                    }
                 },
                { label: "Tileset Selector",
                    click: function() { 
                        mainWindow.webContents.executeJavaScript('window.$$$toggle_pallete("tileset-selector");'); 
                    }
                 },
                { type: "separator" },
                { 
                    label: "Collect all visible palettes", 
                    accelerator: "CmdOrCtrl+Shift+C", 
                    click: function() { 
                        mainWindow.webContents.executeJavaScript('window.$$$collect_all_windows();'); 
                    }
                },
                { 
                    label: "Show all palettes", 
                    accelerator: "CmdOrCtrl+Shift+Alt+C", 
                    click: function() { 
                        mainWindow.webContents.executeJavaScript('window.$$$show_all_windows();'); 
                    }
                },
            ]}
        ];

        if( getDevToolsMenu ) {
            template.push.apply( template, getDevToolsMenu() );
            mainWindow.openDevTools();
        }

        Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    };
    buildMainMenu();

    mainWindow.on('close', function () {
        mainWindowState.saveState(mainWindow);
    });
});

app.on('window-all-closed', function () {
    app.quit();
});
