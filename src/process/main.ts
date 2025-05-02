import * as path from "path";
import { DataResponse, HTTPStatusCodes, IPCSource, Process, Setting } from "@nexus-app/nexus-module-builder"
import { BooleanSetting, StringSetting } from "@nexus-app/nexus-module-builder/settings/types";
import { Window } from "node-window-manager";
import * as fs from 'fs';

const MODULE_ID: string = "{EXPORTED_MODULE_ID}";
const MODULE_NAME: string = "{EXPORTED_MODULE_NAME}";
const HTML_PATH: string = path.join(__dirname, "../renderer/index.html");
const ICON_PATH: string = path.join(__dirname, "../assets/icon.png")

interface MonkeyParams {
    appName: string;
    exePath: string;
    filter: (window: Window) => boolean;
    closeOnExit: boolean;
    isShown: boolean;
    locateOnStartup?: boolean | undefined;
    openOnStartup?: boolean | undefined;
    callback?: (event: string) => void
}


const APP_NAME: string = "Steam";


export default class ChildProcess extends Process {
    private isShown: boolean = false;

    private isMonkeyCoreInstalled: boolean = false;

    public constructor() {
        super({
            moduleID: MODULE_ID,
            moduleName: MODULE_NAME,
            paths: {
                htmlPath: HTML_PATH,
                iconPath: ICON_PATH
            }
        });
    }



    public async initialize(): Promise<void> {
        await super.initialize();

        const pathToExe: string = this.getSettings().findSetting("path").getValue() as string;
        const closeOnExit: boolean = this.getSettings().findSetting("close_on_exit").getValue() as boolean;
        const locateOnStartup: boolean = this.getSettings().findSetting("locate_on_startup").getValue() as boolean;
        const openOnStartup: boolean = this.getSettings().findSetting("open_on_startup").getValue() as boolean;


        if (locateOnStartup) {
            this.sendToRenderer("locate");
        }

        const response: DataResponse = await this.requestExternal('aarontburn.Monkey_Core', 'add-window', {
            appName: APP_NAME,
            exePath: pathToExe,
            closeOnExit: closeOnExit,
            isShown: this.isShown,
            locateOnStartup: locateOnStartup,
            openOnStartup: openOnStartup,
            filter: (w: Window) => w.path.endsWith("steamwebhelper.exe") && w.getTitle().endsWith('Steam') && w.isVisible(),
            callback: this.onMonkeyEvent.bind(this)
        } as MonkeyParams);

        if (response.code === HTTPStatusCodes.NOT_FOUND) {
            console.error(`[${APP_NAME} Monkey] Missing dependency: Monkey Core (aarontburn.Monkey_Core) https://github.com/aarontburn/nexus-monkey-core`);
            this.sendToRenderer("missing_dependency");

        } else {
            this.isMonkeyCoreInstalled = true;
        }

    }

    private onMonkeyEvent(event: string) {
        switch (event) {
            case 'found-window': {
                this.sendToRenderer("found-window");
                break;
            }
            case "lost-window": {
                this.sendToRenderer("lost-window");
                break;
            }
        }
    }



    public async onGUIShown(): Promise<void> {
        this.isShown = true;
        if (this.isMonkeyCoreInstalled) {
            this.requestExternal('aarontburn.Monkey_Core', 'show');
        }

    }

    public async onGUIHidden(): Promise<void> {
        this.isShown = false;

        if (this.isMonkeyCoreInstalled) {
            this.requestExternal('aarontburn.Monkey_Core', 'hide');
        }
    }

    public registerSettings(): (Setting<unknown> | string)[] {
        return [
            new StringSetting(this)
                .setDefault('')
                .setName(`${APP_NAME} Executable Path`)
                .setDescription(`The path to your ${APP_NAME} executable file. Restart required.`)
                .setAccessID('path')
                .setValidator(s => {
                    return (s as string).replace(/\\\\/g, '/')
                }),

            new BooleanSetting(this)
                .setName(`Close ${APP_NAME} on Exit`)
                .setDefault(false)
                .setDescription(`This will only work when ${APP_NAME} is opened through Steam Monkey. Restart required.`)
                .setAccessID('close_on_exit'),

            new BooleanSetting(this)
                .setName(`Locate ${APP_NAME} on Startup`)
                .setDefault(true)
                .setDescription("Locates on startup.")
                .setAccessID('locate_on_startup'),

            new BooleanSetting(this)
                .setName("Open Steam on Startup")
                .setDefault(true)
                .setDescription(`Creates a new ${APP_NAME} instance on startup, if "${APP_NAME} Executable Path" is set and no instance is found.`)
                .setAccessID('open_on_startup')


        ];
    }

    public async onSettingModified(modifiedSetting?: Setting<unknown>): Promise<void> {
        if (modifiedSetting?.getAccessID() === 'path') {
            const path: string = modifiedSetting.getValue() as string;
            try {
                await fs.promises.access(path);
                this.sendToRenderer("path", path);
            } catch {
                this.sendToRenderer("path-error", path);
            }
        }
    }

    public async handleExternal(source: IPCSource, eventType: string, data: any[]): Promise<DataResponse> {
        if (source.getIPCSource() !== "aarontburn.Monkey_Core") { // currently reject everyone thats not monkey core
            return { body: undefined, code: HTTPStatusCodes.UNAUTHORIZED }
        }

        switch (eventType) {
            case "request-swap": {
                return this.requestExternal("nexus.Main", "swap-to-module");
            }
        }

    }


    public async handleEvent(eventName: string, data: any[]): Promise<any> {
        switch (eventName) {
            case "init": {
                this.initialize();
                break;
            }
            case "detach": {
                this.requestExternal('aarontburn.Monkey_Core', 'detach');
                break;
            }
            case "reattach": {
                this.requestExternal('aarontburn.Monkey_Core', 'reattach');
                break;
            }
            case "wait-for-window": {
                this.requestExternal('aarontburn.Monkey_Core', 'wait-for-window');
                break;
            }

            default: {
                console.warn(`Uncaught event: eventName: ${eventName} | data: ${data}`)
                break;
            }
        }
    }



}

