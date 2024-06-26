import { PIDSEditor } from "../../PIDSEditor";
import { Arrival } from "../../util/Arrival";
import { TextModule } from "./TextModule";

export class TemplateModule extends TextModule {
    public template: string = "Text";
    public baseTemplate: string = "Text";
    public id = "template";

    protected getText(arrivals: Arrival[]): string {
        let arrival = arrivals[this.arrival];
        if (!arrival) return "";

        this.template = this.baseTemplate
            .replaceAll("$s", arrival.station)
            .replaceAll("$d", arrival.destination)
            .replaceAll("$p", arrival.platform)
            .replaceAll("$l", arrival.cars)
            .replaceAll("$n", arrival.lineName);

        if (this.baseTemplate.includes("$t")) {
            let time = new Date();
            let hours = 0;
            let hours12 = 0;
            let ampm = "";
            hours = time.getHours();
            hours12 = hours % 12;
            hours12 = hours12 ? hours12 : 12;
            ampm = hours >= 12 ? "PM" : "AM";

            this.template = this.template
                .replaceAll("$ts", time.getSeconds().toString().padStart(2, "0"))
                .replaceAll("$tm", time.getMinutes().toString().padStart(2, "0"))
                .replaceAll("$th2", hours12.toString())
                .replaceAll("$th4", hours.toString())
                .replaceAll("$tap", ampm);
        }

        if (this.baseTemplate.includes("$tg")) {
            let gtime = new Date(new Date().getTime() * 72 % (20 * 60 * 1000));
            let ghours = 0;
            let ghours12 = 0;
            let gapm = "";
            ghours = gtime.getHours();
            ghours12 = ghours % 12;
            ghours12 = ghours12 ? ghours12 : 12;
            gapm = ghours >= 12 ? "PM" : "AM";
            
            this.template = this.template
                .replaceAll("$tgs", gtime.getSeconds().toString().padStart(2, "0"))
                .replaceAll("$tgm", gtime.getMinutes().toString().padStart(2, "0"))
                .replaceAll("$tgh2", ghours12.toString())
                .replaceAll("$tgh4", ghours.toString())
                .replaceAll("$tgap", gapm);
        }

        return " ";
    }

    public getProperties(): { [key: string]: [(value: any, editor: PIDSEditor) => void, any] } {
        return {
            arrival: [(value: any) => this.setArrival(value), this.arrival + 1],
            align: [(value: any) => this.setAlign(value), this.align],
            color: [(value: any) => this.setColor(value), this.color],
            text: [(value: any) => this.setTemplate(value), this.baseTemplate],
            identifiers: [() => {}, null]
        }
    }

    public setTemplate(template: any): void {
        if (typeof template == "string") this.baseTemplate = template;
    }

    public export () {
        let toExport = super.export();
        let data = toExport.data;
        data.template = this.baseTemplate;
        return toExport;
    }

    public import(data: { [key: string]: any; }): void {
        super.import(data);
        if (typeof data.template == "string") this.baseTemplate = data.template;
    }

    public duplicate (): TextModule {
        let module = new (this.constructor as any)(this.x, this.y, this.width, this.height, this.name);
        module.align = this.align;
        module.color = this.color;
        module.layer = this.layer;
        module.arrival = this.arrival;
        module.baseTemplate = this.baseTemplate;
        return module;
    }
}