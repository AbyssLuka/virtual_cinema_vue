export default {
    mounted(el:HTMLImageElement) {
        const imageSrc = el.src;
        //清除src
        el.src = '';
        const observer = new IntersectionObserver(([{isIntersecting}]) => {
            //进入可视区域出触发
            if (isIntersecting) {
                //加载图片
                el.src = imageSrc;
                //停止观察
                observer.unobserve(el)
            }
        });
        //观察元素
        observer.observe(el)
    }
}