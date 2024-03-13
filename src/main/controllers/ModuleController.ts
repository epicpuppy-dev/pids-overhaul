import { OperationCanceledException } from "typescript";
import { Module } from "../modules/Module";
import { ModuleType } from "../modules/ModuleType";
import { RenderUtil } from "../util/RenderUtil";
import { Arrival } from "../editor/Arrival";
import { LayoutController } from "./LayoutController";

export class ModuleController {
    public modules: Module[] = [];
    public moduleTypes: {[key: string]: ModuleType} = {};

    public registerModuleType (moduleType: ModuleType) {
        if (this.moduleTypes[moduleType.id]) {
            throw new Error("module id \"" + moduleType.id + "\" is registered twice");
        }
        this.moduleTypes[moduleType.id] = moduleType;
    }

    public render (ctx: CanvasRenderingContext2D, arrivals: Arrival[], util: RenderUtil, layout: LayoutController) {
        for (let module of this.modules) {
            module.render(ctx, arrivals, util, layout);
        }
    }

    public createModule (type: string, x: number, y: number, width: number, height: number) {
        if (!Object.keys(this.moduleTypes).includes(type)) {
            throw new Error("module id \"" + type + "\" does not exist");
        }
        let module = this.moduleTypes[type].create(x, y, width, height)
        this.modules.push(module);
        return module;
    }
}