import { PIDSEditor } from "../PIDSEditor";
import { Module } from "../modules/Module";
import { ModuleType } from "../modules/ModuleType";

export class EditorController {
    public selected: Module | null = null;
    public placing: ModuleType | null = null;
    public exportMenu = false;
    public offsetX = 0;
    public offsetY = 0;
    public placeModule = false;
    public time = 0;
    public moving: {[key in "l" | "r" | "t" | "b" | "a" | "pan"]: boolean} = {
        l: false,
        r: false,
        t: false,
        b: false,
        a: false,
        pan: false
    };
    private start: {[key in "x" | "y" | "w" | "h"]: number} = {
        x: 0,
        y: 0,
        w: 0,
        h: 0,
    };
    public info = {
        id: "base_horizontal_a",
        name: "Base Horizontal Type A",
        author: "EpicPuppy613",
        description: "MTR Built-in layout.\n\nSize: 32 x 11\nArrivals: 1"
    }

    constructor (editor: PIDSEditor) {
        // toolbar buttons
        document.getElementById("exportIcon")!.onclick = () => {
            editor.edit.exportMenu = true;
            (document.getElementById("exportID")! as HTMLInputElement).value = editor.edit.info.id;
            (document.getElementById("exportName")! as HTMLInputElement).value = editor.edit.info.name;
            (document.getElementById("exportAuthor")! as HTMLInputElement).value = editor.edit.info.author;
            (document.getElementById("exportDescription")! as HTMLInputElement).value = editor.edit.info.description;
            document.getElementById("exportMenu")!.style.display = "block";
        }
        document.getElementById("importIcon")!.onclick = () => {
            //create a new file input element
            let fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = ".json";
            fileInput.style.display = "none";
            fileInput.addEventListener("change", (e: any) => {
                let file = e.target.files[0];
                let reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                reader.onload = (e) => {
                    editor.json.import(e.target!.result as string, editor);
                }
            });
            document.body.appendChild(fileInput);
            fileInput.click();
        }
        document.getElementById("borderIcon")!.onclick = () => {
            editor.layout.showModuleBorders = !editor.layout.showModuleBorders;
            (document.getElementById("borderIcon")! as HTMLImageElement).src = editor.layout.showModuleBorders ? 
            "https://cdn.epicpuppy.dev/assets/pids/sprite-border-on.png" : "https://cdn.epicpuppy.dev/assets/pids/sprite-border-off.png"; 
        }
        document.getElementById("newIcon")!.onclick = () => {
            if (!confirm("Confirm?")) return;
            let type = (document.getElementById("sizeInput")! as HTMLSelectElement).value;
            editor.layout.changeType(type, editor);
            //load layout
            if (editor.assets.files["layout" + type.toUpperCase()].complete) {
                editor.json.import(editor.assets.files["layout" + type.toUpperCase()].data!, editor);
            }
        }

        // export menu buttons
        document.getElementById("cancelButton")!.onclick = () => {
            editor.edit.exportMenu = false;
            document.getElementById("exportMenu")!.style.display = "none";
        };
        document.getElementById("exportButton")!.onclick = () => {
            editor.edit.exportMenu = false;
            editor.json.export(editor);
        };
    }

    public render (editor: PIDSEditor, ctx: CanvasRenderingContext2D, octx: CanvasRenderingContext2D) {
        if (this.placeModule && this.placing) {
            let x1 = editor.util.snapToGrid(this.start.x, editor.layout.pixelSize, 8, this.offsetX + editor.layout.x);
            let y1 = editor.util.snapToGrid(this.start.y, editor.layout.pixelSize, 8, this.offsetY + editor.layout.y);
            let x2 = editor.util.snapToGrid(editor.mouse.x, editor.layout.pixelSize, 8, this.offsetX + editor.layout.x);
            let y2 = editor.util.snapToGrid(editor.mouse.y, editor.layout.pixelSize, 8, this.offsetY + editor.layout.y);
            //draw outline
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(x1, y1, x2 - x1, 1);
            ctx.fillRect(x1, y1, 1, y2 - y1);
            ctx.fillRect(x1, y2 - 1, x2 - x1, 1);
            ctx.fillRect(x2 - 1, y1, 1, y2 - y1);
            editor.util.drawTooltip(octx, editor, ["Placing: " + this.placing.name, "W: " + Math.abs((x2 - x1) / editor.layout.pixelSize).toFixed(3), "H: " + Math.abs((y2 - y1) / editor.layout.pixelSize).toFixed(3)]);
        } else if (this.placing) {
            editor.util.drawTooltip(octx, editor, ["Placing: " + this.placing.name]);
        }
    }

    public mousedown (x: number, y: number, e: MouseEvent, editor: PIDSEditor) {
        if (e.button == 2) {
            this.moving.pan = true;
            this.start.x = this.offsetX;
            this.start.y = this.offsetY;
        } else if (this.placing) {
            this.placeModule = true;
            this.start.x = x;
            this.start.y = y;
        } else if (this.selected) {
            let scaledX = this.selected.x * editor.layout.pixelSize + editor.layout.x;
            let scaledY = this.selected.y * editor.layout.pixelSize + editor.layout.y;
            let scaledWidth = this.selected.width * editor.layout.pixelSize;
            let scaledHeight = this.selected.height * editor.layout.pixelSize;
            let left = scaledX;
            let right = scaledX + scaledWidth;
            let top = scaledY;
            let bottom = scaledY + scaledHeight;
            let mouseX = x - editor.edit.offsetX;
            let mouseY = y - editor.edit.offsetY;
            if (
                //top left
                editor.util.pointInBox(mouseX, mouseY, left - 5, top - 5, 10, 10) ||
                //left
                editor.util.pointInBox(mouseX, mouseY, left - 5, top + scaledHeight / 2 - 5, 10, 10) ||
                //bottom left  
                editor.util.pointInBox(mouseX, mouseY, left - 5, bottom - 5, 10, 10)
            ) {
                this.moving.l = true;
            } 

            if (
                //top right
                editor.util.pointInBox(mouseX, mouseY, right - 5, top - 5, 10, 10) ||
                //right
                editor.util.pointInBox(mouseX, mouseY, right - 5, top + scaledHeight / 2 - 5, 10, 10) ||
                //bottom right
                editor.util.pointInBox(mouseX, mouseY, right - 5, bottom - 5, 10, 10)
            ) {
                this.moving.r = true;
            } 

            if (
                //top left
                editor.util.pointInBox(mouseX, mouseY, left - 5, top - 5, 10, 10) ||
                //top
                editor.util.pointInBox(mouseX, mouseY, left + scaledWidth / 2 - 5, top - 5, 10, 10) ||
                //top right
                editor.util.pointInBox(mouseX, mouseY, right - 5, top - 5, 10, 10)    
            ) {
                this.moving.t = true;
            } 

            if (
                //bottom left
                editor.util.pointInBox(mouseX, mouseY, left - 5, bottom - 5, 10, 10) ||
                //bottom
                editor.util.pointInBox(mouseX, mouseY, left + scaledWidth / 2 - 5, bottom - 5, 10, 10) ||
                //bottom right
                editor.util.pointInBox(mouseX, mouseY, right - 5, bottom - 5, 10, 10)    
            ) {
                this.moving.b = true;
            }

            if (
                editor.util.pointInBox(mouseX, mouseY, left, top, scaledWidth, scaledHeight) &&
                !this.moving.l && !this.moving.r && !this.moving.t && !this.moving.b
            ) {
                this.moving.a = true;
            }   
            this.start.x = this.selected.x;
            this.start.y = this.selected.y;
            this.start.w = this.selected.width;
            this.start.h = this.selected.height;
        }
    }

    public mousemove (x: number, y: number, startX: number, startY: number, editor: PIDSEditor) {
        if (this.moving.pan) {
            this.offsetX = this.start.x + (x - startX);
            this.offsetY = this.start.y + (y - startY);
        }
        if (this.selected) {
            let xMoveConstant = Math.round((x - startX) / editor.layout.pixelSize * 8) / 8;
            let yMoveConstant = Math.round((y - startY) / editor.layout.pixelSize * 8) / 8;
            if (this.moving.t) {
                this.selected.y = this.start.y + yMoveConstant;
                this.selected.height = this.start.h - yMoveConstant;
            }
            if (this.moving.b) {
                this.selected.height = this.start.h + yMoveConstant;
            }
            if (this.moving.l) {
                this.selected.x = this.start.x + xMoveConstant;
                this.selected.width = this.start.w - xMoveConstant;
            }
            if (this.moving.r) {
                this.selected.width = this.start.w + xMoveConstant;
            }
            if (this.moving.a) {
                this.selected.x = this.start.x + xMoveConstant;
                this.selected.y = this.start.y + yMoveConstant;
            }

            //set position
            document.getElementById("posX")!.innerText = this.selected.x.toFixed(3);
            document.getElementById("posY")!.innerText = this.selected.y.toFixed(3);
            document.getElementById("posW")!.innerText = this.selected.width.toFixed(3);
            document.getElementById("posH")!.innerText = this.selected.height.toFixed(3);
        }
    }

    public mouseup (x: number, y: number, startX: number, startY: number, editor: PIDSEditor) {
        //stop moving
        this.moving.l = false;
        this.moving.r = false;
        this.moving.t = false;
        this.moving.b = false;
        this.moving.a = false;
        this.moving.pan = false;
        //check for negative width/height
        if (this.selected) {
            if (this.selected.width < 0) {
                this.selected.x += this.selected.width;
                this.selected.width = -this.selected.width;
            }
            if (this.selected.height < 0) {
                this.selected.y += this.selected.height;
                this.selected.height = -this.selected.height;
            }
        }
        //finish module placement
        if (this.placeModule && this.placing) {
            let x1 = editor.util.snapToGrid(this.start.x, editor.layout.pixelSize, 8, this.offsetX + editor.layout.x) - editor.layout.x;
            let y1 = editor.util.snapToGrid(this.start.y, editor.layout.pixelSize, 8, this.offsetY + editor.layout.y) - editor.layout.y;
            let x2 = editor.util.snapToGrid(editor.mouse.x, editor.layout.pixelSize, 8, this.offsetX + editor.layout.x) - editor.layout.x;
            let y2 = editor.util.snapToGrid(editor.mouse.y, editor.layout.pixelSize, 8, this.offsetY + editor.layout.y) - editor.layout.y;
            let width = x2 - x1;
            let height = y2 - y1;
            //check for negative width/height
            if (width < 0) {
                x1 += width;
                width = -width;
            }
            if (height < 0) {
                y1 += height;
                height = -height;
            }
            if (width > 0.25 && height > 0.25) {
                let module = this.placing.create(x1 / editor.layout.pixelSize, y1 / editor.layout.pixelSize, width / editor.layout.pixelSize, height / editor.layout.pixelSize);
                editor.modules.modules.push(module);
                this.selected = module;
                this.placing = null;
                this.showProperties(editor);
            }
            this.placeModule = false;
        } else if (Math.abs(x - startX) < 5 && Math.abs(y - startY) < 5) {
            let modules = editor.modules.modules;
            for (let i = modules.length - 1; i >= 0; i--) {
                let module = modules[i];
                let scaledX = module.x * editor.layout.pixelSize + editor.layout.x;
                let scaledY = module.y * editor.layout.pixelSize + editor.layout.y;
                let scaledWidth = module.width * editor.layout.pixelSize;
                let scaledHeight = module.height * editor.layout.pixelSize;
                let mouseX = x - editor.edit.offsetX;
                let mouseY = y - editor.edit.offsetY;
                if (editor.util.pointInBox(mouseX, mouseY, scaledX, scaledY, scaledWidth, scaledHeight)) {
                    this.selected = module;
                    this.showProperties(editor);
                    return;
                }
            }
            this.selected = null;
            document.getElementById("propertyEditor")!.style.display = "none";
        }
    }

    public showProperties (editor: PIDSEditor) {
        if (!this.selected) return;
        //show menu
        document.getElementById("propertyEditor")!.style.display = "flex";
        
        //set name
        document.getElementById("moduleName")!.innerText = this.selected.name + " Module";

        //set position
        document.getElementById("posX")!.innerText = this.selected.x.toFixed(3);
        document.getElementById("posY")!.innerText = this.selected.y.toFixed(3);
        document.getElementById("posW")!.innerText = this.selected.width.toFixed(3);
        document.getElementById("posH")!.innerText = this.selected.height.toFixed(3);

        //delete button
        document.getElementById("deleteButton")!.onclick = () => {
            editor.modules.modules.splice(editor.modules.modules.indexOf(this.selected!), 1);
            this.selected = null;
            document.getElementById("propertyEditor")!.style.display = "none";
        }
        //duplicate button
        document.getElementById("duplicateButton")!.onclick = () => {
            let module = editor.edit.selected!;
            let copy = module.duplicate();
            copy.x += 0.25;
            copy.y += 0.25;
            editor.modules.modules.push(copy);
            editor.edit.selected = copy;
            editor.edit.showProperties(editor);
        }

        //get properties
        let properties = this.selected.getProperties();

        //loop through properties
        for (let property of document.getElementsByClassName("property")) {
            let element = property as HTMLElement;
            let input = document.getElementById(element.id.replace("Container", "Input"))! as HTMLInputElement;
            if (element.id.replace("Container", "") in properties) {
                element.style.display = "table-row";
                //overrides
                if (element.id == "alignContainer") {
                    if (!("align" in this.selected)) return;
                    let left = document.getElementById("alignLeft")!;
                    let center = document.getElementById("alignCenter")!;
                    let right = document.getElementById("alignRight")!;
                    left.style.backgroundColor = this.selected.align == "left" ? "#666666ff" : "#00000000";
                    center.style.backgroundColor = this.selected.align == "center" ? "#666666ff" : "#00000000";
                    right.style.backgroundColor = this.selected.align == "right" ? "#666666ff" : "#00000000";
                    left.onclick = () => {
                        if ("align" in properties) properties.align[0]("left", editor);
                        this.showProperties(editor);
                    }
                    center.onclick = () => {
                        if ("align" in properties) properties.align[0]("center", editor);
                        this.showProperties(editor);
                    }
                    right.onclick = () => {
                        if ("align" in properties) properties.align[0]("right", editor);
                        this.showProperties(editor);
                    }
                    continue;
                }
                let type = input.type;
                if (type == "checkbox") {
                    input.checked = properties[element.id.replace("Container", "")][1];
                    input.onchange = (e) => {
                        let value = input.checked;
                        properties[element.id.replace("Container", "")][0](value, editor);
                    }
                } else {
                    input.value = properties[element.id.replace("Container", "")][1];
                    input.oninput = (e) => {
                        let value = input.value;
                        properties[element.id.replace("Container", "")][0](value, editor);
                    }
                }
            } else {
                element.style.display = "none";
            }
        }
    }
}