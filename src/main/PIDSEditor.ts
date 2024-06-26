import { version } from "../version";
import { ArrivalController } from "./controllers/ArrivalController";
import { AssetController } from "./controllers/AssetController";
import { EditorController } from "./controllers/EditorController";
import { JSONController } from "./controllers/JSONController";
import { LayoutController } from "./controllers/LayoutController";
import { ModuleController } from "./controllers/ModuleController";
import { MouseController } from "./controllers/MouseController";
import { ShortcutController } from "./controllers/ShortcutController";
import { ArrivalTimeModule } from "./modules/module/ArrivalTimeModule";
import { DestinationModule } from "./modules/module/DestinationModule";
import { AssetData } from "./util/AssetData";
import { ModuleData } from "./util/ModuleData";
import { ShortcutData } from "./util/ShortcutData";
import { Util } from "./util/Util";

export class PIDSEditor {
    public mouse: MouseController;
    public arrivals: ArrivalController;
    public modules: ModuleController;
    public layout: LayoutController;
    public edit: EditorController;
    public assets: AssetController;
    public json: JSONController;
    public shortcuts: ShortcutController;

    public util: Util = new Util();

    public width: number;
    public height: number;

    public canvas: HTMLCanvasElement;
    public overlay: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;
    public octx: CanvasRenderingContext2D;

    constructor () {
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.overlay = document.getElementById("overlay") as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.octx = this.overlay.getContext('2d') as CanvasRenderingContext2D;

        this.ctx.textBaseline = "top";
        this.octx.textBaseline = "top"; 

        this.width = this.canvas.width = this.overlay.width = window.innerWidth;
        this.height = this.canvas.height = this.overlay.height = window.innerHeight;

        //intialize controllers
        this.mouse = new MouseController(this);
        this.edit = new EditorController(this);
        this.arrivals = new ArrivalController(this);
        this.modules = new ModuleController();
        this.layout = new LayoutController(32, 9, 1, this.width, this.height);
        this.assets = new AssetController();
        this.json = new JSONController();
        this.shortcuts = new ShortcutController(this);

        AssetData.registerAssets(this.assets);
        this.assets.loadAll();

        ModuleData.registerModules(this);
        ShortcutData.registerShortcuts(this.shortcuts);

        //temporary modules
        let destinationModules = [
            this.modules.createModule("destination", 1.5, 1.5, 22.5, 1.75) as DestinationModule,
            this.modules.createModule("destination", 1.5, 3.625, 22.5, 1.75) as DestinationModule,
            this.modules.createModule("destination", 1.5, 5.75, 22.5, 1.75) as DestinationModule
        ]

        let arrivalModules = [
            this.modules.createModule("arrivalTime", 24.5, 1.5, 6, 1.75) as ArrivalTimeModule,
            this.modules.createModule("arrivalTime", 24.5, 3.625, 6, 1.75) as ArrivalTimeModule,
            this.modules.createModule("arrivalTime", 24.5, 5.75, 6, 1.75) as ArrivalTimeModule
        ]

        destinationModules[1].arrival = 1;
        destinationModules[2].arrival = 2;
        arrivalModules[1].arrival = 1;
        arrivalModules[2].arrival = 2;

        arrivalModules[0].align = "right";
        arrivalModules[1].align = "right";
        arrivalModules[2].align = "right";

        window.setInterval(() => this.render(), 1000 / 60); 
    }

    public render () {
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.octx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = "#ffffff";
        //check arrivals
        this.arrivals.update(this);

        //apply offset  
        this.ctx.save();
        this.ctx.translate(this.edit.offsetX, this.edit.offsetY);
        //draw base pids
        //border
        this.ctx.strokeStyle = "#ffffff";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.layout.x - 1, this.layout.y - 1, this.layout.width * this.layout.pixelSize + 2, this.layout.height * this.layout.pixelSize + 2);
        //gray border
        this.ctx.fillStyle = "#888888";
        this.ctx.fillRect(this.layout.x, this.layout.y, this.layout.width * this.layout.pixelSize, this.layout.height * this.layout.pixelSize);
        //black background
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(this.layout.x + this.layout.borderWidth * this.layout.pixelSize, this.layout.y + this.layout.borderWidth * this.layout.pixelSize, this.layout.width * this.layout.pixelSize - this.layout.borderWidth * 2 * this.layout.pixelSize, this.layout.height * this.layout.pixelSize - this.layout.borderWidth * 2 * this.layout.pixelSize);
        //special occupied area
        this.ctx.fillStyle = "#888888";
        this.ctx.strokeStyle = "#ffaa00";
        this.ctx.lineWidth = 2;
        switch (this.layout.type) {
            case "ha":
                this.util.drawOccupiedBox(this.ctx, this, 1, 1, 30, 6, false);
                break;
            case "ps":
                this.util.drawOccupiedBox(this.ctx, this, 6, 0, 4, 1, true);
                break;
            case "pm":
                this.util.drawOccupiedBox(this.ctx, this, 21, 0, 6, 1, true);
                break;
            case "pl":
                this.util.drawOccupiedBox(this.ctx, this, 20, 0, 8, 1, true);
                break;
        }

        this.modules.render(this.ctx, this);
        this.ctx.restore();

        this.edit.render(this, this.ctx, this.octx);

        //additional information
        this.ctx.fillStyle = "#ffffff";
        this.ctx.textAlign = "left";
        this.ctx.font = "12px monospace";
        this.ctx.textBaseline = "top";
        //asset loading
        let assetsLoaded = this.assets.getLoaded();
        let assetsTotal = this.assets.getTotal();
        if (assetsLoaded < assetsTotal) {
            this.ctx.fillText("Loading: " + assetsLoaded + "/" + assetsTotal, 5, this.height - 32);
        }
        //version
        this.ctx.textAlign = "right";
        this.ctx.fillText(version, this.width - 4, this.height - 16);

        //tick time
        this.edit.time++;
        if (this.edit.time % 3 == 0) this.edit.ticks++;
    }

    public mousedown (x: number, y: number, e: MouseEvent) {
        this.edit.mousedown(x, y, e, this);
    }

    public mousemove (x: number, y: number, startX: number, startY: number) {
        this.edit.mousemove(x, y, startX, startY, this);
    }

    public mouseup (x: number, y: number, startX: number, startY: number) {
        this.edit.mouseup(x, y, startX, startY, this);
    }
}