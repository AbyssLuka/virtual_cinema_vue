import Stats from "three/examples/jsm/libs/stats.module";

export class ThreeJsStats {
    private readonly stats: Stats;

    constructor() {
        this.stats = new Stats();//性能监视器
    }

    //性能监视器初始化
    private statsInit() {
        // this.stats.setMode(0);
        this.stats.showPanel(0);
        this.stats.dom.style.position = 'fixed';
        this.stats.dom.style.top = '100px';
        this.stats.dom.style.left = '100px';
        this.stats.dom.style.display = 'none';
    }

    public create() {
        this.statsInit();
        return this.stats;
    }

    public setPosition(top: number, left: number) {
        this.stats.dom.style.top = top + 'px';
        this.stats.dom.style.left = left + 'px';
    }

    public visible(status: boolean) {
        this.stats.dom.style.display = status ? "block" : "none";
    }

    public destroy() {
        this.stats.dom.remove();
    }

    public changeVisible() {
        if (this.stats.dom.style.display === "none") {
            this.visible(true);
        } else {
            this.visible(false);
        }
    }

}