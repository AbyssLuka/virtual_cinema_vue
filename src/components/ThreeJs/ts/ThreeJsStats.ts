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

    set position(position: { top: number, left: number }) {
        this.stats.dom.style.top = position.top + 'px';
        this.stats.dom.style.left = position.left + 'px';
    }

    set visible(status: boolean) {
        this.stats.dom.style.display = status ? "block" : "none";
    }

    public destroy() {
        this.stats.dom.remove();
    }

    public changeVisible() {
        this.visible = this.stats.dom.style.display === "none"
    }

}