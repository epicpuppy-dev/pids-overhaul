import { PIDSEditor } from "../../PIDSEditor";
import { Arrival } from "../../util/Arrival";
import { TextModule } from "./TextModule";

export class DestinationModule extends TextModule {
    public template: string = "%s";
    public id = "destination";
    public showLineNumber = true;

    protected getText(arrivals: Arrival[]): string {
        let arrival = arrivals[this.arrival];
        if (!arrival) return "";
        return (this.showLineNumber ? arrival.lineNumber + " " : "") + arrival.destination;
    }
    
    public getProperties(): { [key: string]: [(value: any, editor: PIDSEditor) => void, any]; } {
        let properties: { [key: string]: [(value: any, editor: PIDSEditor) => void, any] } = {
            arrival: [(value: any) => this.setArrival(value), this.arrival + 1],
            align: [(value: any) => this.setAlign(value), this.align],
            color: [(value: any) => this.setColor(value), this.color],
            lineNumber: [(value: any) => this.setShowLineNumber(value), this.showLineNumber]
        };
        return properties;
    }

    public setShowLineNumber(show: any): void {
        if (typeof show == "boolean") this.showLineNumber = show;
    }

    public export() {
        let toExport = super.export();
        let data = toExport.data;
        data.showLineNumber = this.showLineNumber;
        return toExport;
    }

    public import(data: { [key: string]: any; }): void {
        super.import(data);
        if (typeof data.showLineNumber == "boolean") this.showLineNumber = data.showLineNumber;
    }

    public duplicate() {
        let module = new (this.constructor as any)(this.x, this.y, this.width, this.height, this.name);
        module.align = this.align;
        module.color = this.color;
        module.layer = this.layer;
        module.arrival = this.arrival;
        module.showLineNumber = this.showLineNumber;
        return module;
    }
}