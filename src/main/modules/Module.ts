import { PIDSEditor } from "../PIDSEditor";

export abstract class Module {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public name: string;

    constructor (x: number, y: number, width: number, height: number, name: string) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.name = name;
    }

    public abstract getProperties (): {[key: string]: [(value: any, edtior: PIDSEditor) => void, any]};

    public abstract load (data: {[key: string]: any}): void;

    public render (ctx: CanvasRenderingContext2D, editor: PIDSEditor) {
        let util = editor.util;
        let layout = editor.layout;
        if (util.showBorder) {
            let scaledX = this.x * layout.pixelSize + layout.x;
            let scaledY = this.y * layout.pixelSize + layout.y;
            let scaledWidth = this.width * layout.pixelSize;
            let scaledHeight = this.height * layout.pixelSize;

            // draw module border
            if (!layout.showModuleBorders) return;
            ctx.fillStyle = editor.edit.selected === this ? "#ffaa00" : "#ffffff";
            ctx.textAlign = "left";
            ctx.fillRect(scaledX, scaledY, scaledWidth, 1);
            ctx.fillRect(scaledX, scaledY + scaledHeight - 1, scaledWidth, 1);
            ctx.fillRect(scaledX, scaledY, 1, scaledHeight);
            ctx.fillRect(scaledX + scaledWidth - 1, scaledY, 1, scaledHeight);
            //draw editing anchors
            if (editor.edit.selected === this) {
                ctx.fillStyle = "#ffaa00";
                //top left
                ctx.fillRect(scaledX - 3, scaledY - 3, 7, 7);
                //top
                ctx.fillRect(scaledX + scaledWidth / 2 - 3, scaledY - 3, 7, 7);
                //top right
                ctx.fillRect(scaledX + scaledWidth - 4, scaledY - 3, 7, 7);
                //right
                ctx.fillRect(scaledX + scaledWidth - 4, scaledY + scaledHeight / 2 - 3, 7, 7);
                //bottom right
                ctx.fillRect(scaledX + scaledWidth - 4, scaledY + scaledHeight - 4, 7, 7);
                //bottom
                ctx.fillRect(scaledX + scaledWidth / 2 - 3, scaledY + scaledHeight - 4, 7, 7);
                //bottom left
                ctx.fillRect(scaledX - 3, scaledY + scaledHeight - 4, 7, 7);
                //left
                ctx.fillRect(scaledX - 3, scaledY + scaledHeight / 2 - 3, 7, 7);
            }
            ctx.fillStyle = "#ffffff";
            util.fontMono(ctx, "10px");
            ctx.fillText(this.name, scaledX + 2, scaledY + 2);
        }
    };
}