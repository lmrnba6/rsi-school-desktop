import {existsSync, readFileSync, writeFileSync} from 'fs';
import * as path from 'path';

const {sqlDrop} = require('../../assets/data/sql-drop.js');
const {sqlInitRemote} = require('../../assets/data/sql-init-remote.js');
const {sqlUpdate} = require('../../assets/data/sql-update.js');
const {sqlInit} = require('../../assets/data/sql-init.js');

// tslint:disable-next-line:no-implicit-dependencies
import {OpenDialogOptions, remote} from 'electron';
import {Client} from "pg";
import * as fs from "fs";
import moment = require("moment");
import {TheDb} from "./thedb";

/**
 * Class Settings holds information required by the application.
 * Settings uses settings.json to persist relevant information across sessions.
 *
 * @export
 * @class Settings
 */
export class Settings {
    public static api: string = ''
    public static serialNumber: string = '';
    public static isDbLocalFile = false;
    public static isCloud = true;
    public static isDbLocalServer = true;
    public static isDbWebServer = false;
    public static client: Client;
    public static cloudClient: Client;
    public static isDebug: boolean = false;
    public static dbLocalServer: {
        user: string,
        host: string,
        database: string,
        password: string,
        port: number
    } = {
        user: 'postgres',
        host: '127.0.0.1',
        database: 'postgres',
        password: 'admin',
        port: 5432
    }

    public static dbWebServer: {
        user: string,
        host: string,
        database: string,
        password: string,
        port: number,
        ssl: boolean
    } = {
        user: 'latzitreotobui',
        host: 'ec2-54-235-247-209.compute-1.amazonaws.com',
        database: 'dcstelqbrl059n',
        password: '8557229a9742e809556e1ec790de4ac8c29463b5af8ffbadf5cae1c3158492f9',
        port: 5432,
        ssl: true
    }

    public static imgFolder = '';

    /** Folder where data files are located */
    public static dbFolder: string;
    /** Path to database file used by application*/
    public static dbPath: string;
    /** Determines if database location can be set by user (false), or is fixed by application (true). */
    public static hasFixedDbLocation = false;
    /**
     * Sets database location when hasFixedDbLocation === true.
     * For valid values see https://github.com/electron/electron/blob/master/docs/api/app.md#appgetpathname.
     */
    public static fixedLocation = 'userData';

    /** Default name of folder containing data files. */
    private static dataSubFolder = 'dist/assets/data';
    /** Default name of database file. */
    private static dbName = 'database.db';
    /** Default name of folder containing data files for Karma. */
    private static dataFolderKarma = 'source/assets/data';
    /** Default name of database file for Karma tests. */
    private static dbNameKarma = 'karma-database.db';
    /** Location of settings.json file */
    private static settingsPath: string;
    public static logsPath: string;

    /**
     * Settings.initialize must be called a startup of application and determines the locations of database
     *
     * @static
     * @memberof Settings
     */
    public static initialize(): void {
        Settings.getPaths();
        if (!Settings.hasFixedDbLocation) {
            if (!existsSync(Settings.settingsPath)) {
                //this.getHDDSerialNumber(false);
                Settings.write();
            }
            if (!existsSync(Settings.logsPath)) {
                Settings.writeLogsFile();
            }
            Settings.read();
        }
        Settings.verify();
        if (Settings.isDbLocalFile) {
            if (fs.existsSync(Settings.dbPath)) {
                Settings.openDb(Settings.dbPath);
            } else if (Settings.hasFixedDbLocation) {
                Settings.createDb(Settings.dbPath);
            } else {
                Settings.createDb(Settings.dbPath);
            }
        }
        if (Settings.isDbLocalServer) {
            Settings.client = new Client(Settings.dbLocalServer);
            Settings.client.connect().catch(() => {
                alert('Database connection error');
            });
        }
        if (this.isDbWebServer) {
            Settings.client = new Client(Settings.dbWebServer);
            Settings.client.connect();
        }


    }

    public static queryServerAll(sql: string, cloud?: boolean): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const client: Client = cloud ? Settings.cloudClient : Settings.client;
            client.query(sql, (err, row) => {
                if (err) {
                    this.writeLogsFile(moment().format('DD-MM-YYYY-HH:mm:ss') + ': Trying --> ' + sql + ' Received --> ' + err);
                    reject(err);
                } else {
                    resolve(row.rows);
                }
            });
        });
    }

    public static queryServerChange(sql: string, cloud?: boolean): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const client: Client = cloud ? Settings.cloudClient : Settings.client;
            client.query(sql, (err, res: any) => {
                if (err) {
                    this.writeLogsFile(moment().format('DD-MM-YYYY-HH:mm:ss') + ': Trying --> ' + sql + ' Received --> ' + err);
                    reject(err);
                } else {
                    resolve({changes: 1, id: res.rows && res.rows[0] ? res.rows[0].id : null});
                }
            });
        });
    }

    public static queryServerOne(sql: string, cloud?: boolean): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const client: Client = cloud ? Settings.cloudClient : Settings.client;
            client.query(sql, (err, row) => {
                if (err) {
                    this.writeLogsFile(moment().format('DD-MM-YYYY-HH:mm:ss') + ': Trying --> ' + sql + ' Received --> ' + err);
                    reject(err);
                } else {
                    resolve(row.rows[0]);
                }
            });
        });
    }

    public static updateAll(): Promise<void> {
        return new Promise<any>((resolve, reject) => {
            Settings.cloudClient.query(sqlUpdate, (err, res: any) => {
                if (err) {
                    this.writeLogsFile(moment().format('DD-MM-YYYY-HH:mm:ss') + ': Trying --> SQL-UPDATE.JS ' + ' Received --> ' + err);
                    reject(err);
                } else {
                    resolve({changes: 1, id: res.rows && res.rows[0] ? res.rows[0].id : null});
                }
            });
        });
    }

    public static createAll(): Promise<void> {
        return new Promise<any>((resolve, reject) => {
            Settings.cloudClient.query(sqlInit, (err, res: any) => {
                if (err) {
                    this.writeLogsFile(moment().format('DD-MM-YYYY-HH:mm:ss') + ': Trying --> SQL-INIT.JS' + ' Received --> ' + err);
                    reject(err);
                } else {
                    resolve({changes: 1, id: res.rows && res.rows[0] ? res.rows[0].id : null});
                }
            });
        });
    }

    public static createAllRemote(): Promise<void> {
        return new Promise<any>((resolve, reject) => {
            Settings.cloudClient.query(sqlInitRemote, (err, res: any) => {
                if (err) {
                    this.writeLogsFile(moment().format('DD-MM-YYYY-HH:mm:ss') + ': Trying --> SQL-INIT-REMOTE.JS' + ' Received --> ' + err);
                    reject(err);
                } else {
                    resolve({changes: 1, id: res.rows && res.rows[0] ? res.rows[0].id : null});
                }
            });
        });
    }


    public static dropAll(): Promise<void> {
        return new Promise<any>((resolve, reject) => {
            Settings.cloudClient.query(sqlDrop, (err, res: any) => {
                if (err) {
                    this.writeLogsFile(moment().format('DD-MM-YYYY-HH:mm:ss') + ': Trying --> SQL-DROP.JS' + ' Received --> ' + err);
                    reject(err);
                } else {
                    resolve({changes: 1, id: res.rows && res.rows[0] ? res.rows[0].id : null});
                }
            });
        });
    }

    public static read(): void {
        const settings = JSON.parse(readFileSync(Settings.settingsPath, {encoding: 'utf8'}));
        Settings.fromJson(settings);
        //this.getHDDSerialNumber(true);
    }

    public static writeLogsFile(text: string = ''): void {
        if (!fs.existsSync(Settings.logsPath)) {
            writeFileSync(Settings.logsPath, text + (text ? '\n' : ''), undefined);
        } else {
            const data = fs.readFileSync(Settings.logsPath); //read existing contents into data
            const fd = fs.openSync(Settings.logsPath, 'w+');
            const buffer = new Buffer(text + (text ? '\n' : ''));

            fs.writeSync(fd, buffer, 0, buffer.length, 0); //write new data
            fs.writeSync(fd, data, 0, data.length, buffer.length); //append old data
        }
    }


    public static write(): void {
        writeFileSync(Settings.settingsPath,
            JSON.stringify({
                dbPath: Settings.dbPath,
                serialNumber: Settings.serialNumber,
                isDbLocalFile: Settings.isDbLocalFile,
                isDbLocalServer: Settings.isDbLocalServer,
                isHerokuServer: Settings.isDbWebServer,
                dbLocalServer: Settings.dbLocalServer,
                dbHeroku: Settings.dbWebServer,
                isDebug: Settings.isDebug,

            }, undefined, 4));
    }

    public static verify() {
        if (Settings.serialNumber !== 'ok') {
            const options: OpenDialogOptions = {};
            const files = remote.dialog.showOpenDialog(remote.getCurrentWindow(), options);
            if (!files) {
                window.close();
            }
            files && fs.readFile(files[0], function (err, data) {
                if (err) {
                    window.close();
                }
                if (data.toString() === '1861986') {
                    Settings.serialNumber = 'ok'
                    Settings.write();
                    Settings.writeLogsFile();
                } else {
                    window.close();
                }
            });
        } else {
            Settings.read();
        }
    }

    public static openDb(filename: string) {
        TheDb.openDb(filename)
            .then(() => {
                if (!Settings.hasFixedDbLocation) {
                    Settings.dbPath = filename;
                    Settings.write();
                    Settings.writeLogsFile();
                }
            })
            .catch((reason) => {
                // Handle errors
                console.log('Error occurred while opening database: ', reason);
            });
    }

    public static createDb(filename: any) {
        if (!filename) {
            const options: OpenDialogOptions = {
                title: 'Create file',
                defaultPath: remote.app.getPath('documents'),
                filters: [
                    {
                        name: 'Database',
                        extensions: ['db'],
                    },
                ],
            };
            filename = remote.dialog.showSaveDialog(remote.getCurrentWindow(), options);
        }

        if (!filename) {
            window.close();
        }

        TheDb.createDb(filename)
            .then((dbPath) => {
                if (!Settings.hasFixedDbLocation) {
                    Settings.dbPath = dbPath;
                    Settings.write();
                    Settings.writeLogsFile();
                }
            })
            .catch((reason) => {
                console.log(reason);
            });
    }

    // public static getHDDSerialNumber(test: boolean) {
    //     const exec = require('child_process').exec;
    //     exec("wmic DISKDRIVE get SerialNumber", test ? this.verify : this.puts);
    // }

    // public static puts(error: any, stdout: any, stderr: any) {
    //     const sys = require('util');
    //     const rgx = /\s/gi;
    //     Settings.hdd = sys.inspect(stdout, {showHidden: true, depth: null}).replace(rgx, "");
    //     console.log(error,stderr);
    // }

    // public static verify(error: any, stdout: any, stderr: any): void {
    //     const sys = require('util');
    //     const rgx = /\s/gi;
    //     const hddTest = sys.inspect(stdout, {showHidden: true, depth: null});
    //     const test = hddTest.replace(rgx, "");
    //     if(Settings.hdd  && Settings.hdd !== test) {
    //        // window.close();
    //     }
    //     console.log(error,stderr)
    // }

    private static getPaths() {
        if (/karma/.test(remote.app.getPath('userData'))) {
            const karmaPath = remote.app.getAppPath();
            const appPath = karmaPath.slice(0, karmaPath.indexOf('node_modules'));
            Settings.hasFixedDbLocation = true;
            Settings.dbFolder = path.join(appPath, Settings.dataFolderKarma);
            Settings.dbPath = path.join(Settings.dbFolder, Settings.dbNameKarma);
        } else {
            const appPath = remote.app.getAppPath();

            if (Settings.hasFixedDbLocation) {
                Settings.dbPath = path.join(remote.app.getPath(Settings.fixedLocation), 'data', Settings.dbName);
            } else {
                Settings.settingsPath = path.join(remote.app.getPath('userData'), 'settings.json');
                Settings.logsPath = path.join(remote.app.getPath('userData'), 'logs.json');
                Settings.imgFolder = path.join(remote.app.getPath('userData'), 'img');
                fs.existsSync(Settings.imgFolder) || fs.mkdirSync(Settings.imgFolder);
            }

            const isDevMode = /electron/.test(path.basename(remote.app.getPath('exe'), '.exe'));
            if (isDevMode) {
                Settings.dbFolder = path.join(appPath, Settings.dataSubFolder);
            } else {
                // remote.process.resoursesPath yields undefined
                Settings.dbFolder = path.join(remote.getGlobal('process').resourcesPath, Settings.dataSubFolder);
            }
        }
    }

    private static fromJson(settings: object) {
        Settings.dbPath = settings['dbPath'];
        Settings.isDbLocalFile = settings['isDbLocalFile'];
        Settings.isDbLocalServer = settings['isDbLocalServer'];
        Settings.isDbWebServer = settings['isDbWebServer'];
        Settings.isDebug = settings['isDebug'];
        Settings.dbLocalServer = settings['dbLocalServer'];
        Settings.serialNumber = settings['serialNumber'];
        Settings.dbWebServer = settings['dbWebServer'];
    }
}
