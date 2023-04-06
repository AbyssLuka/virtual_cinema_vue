export default {
    mounted(el: HTMLImageElement) {
        //观察者
        const observer = new IntersectionObserver(([{isIntersecting}]) => {
            //是否在可视区域
            if (isIntersecting) {
                if (el.classList.contains("list-animation-out")) {
                    el.classList.remove("list-animation-out");
                }
                el.classList.add("list-animation-in");
            } else {
                if (el.classList.contains("list-animation-in")) {
                    el.classList.remove("list-animation-in");
                }
                el.classList.add("list-animation-out");
            }
        });
        //观察元素
        observer.observe(el);
    }
}