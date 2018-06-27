import ThreeScene from './ThreeScene';
import ThreeText from './ThreeText';
import ThreeVideo from './ThreeVideo';
import * as THREE from 'three';

export default container => {
    const events = new THREE.EventDispatcher()
    const text0 = new ThreeText(container, 0);
    const text1 = new ThreeText(container, 1);
    const video = new ThreeVideo(container, events);
    const canvas = createCanvas(document, container)
    const scene = new ThreeScene(canvas, [text0, text1], video, events);
    
    function createCanvas(document, container){
        const canvas = document.createElement('canvas');
        canvas.id = 'output'
        container.appendChild(canvas);
        return canvas;
    }

   function bindEventListeners(){
        window.onresize = resizeCanvas;
        resizeCanvas();
    }

    function resizeCanvas(){
        scene.onWindowResize(container.clientWidth, 
                             container.clientHeight)
    }

    function render(time) {
        requestAnimationFrame(render);
        scene.update();
    }

    function setData(data){
        scene.setData(data)
    }

    bindEventListeners();
    render();

    document.fonts.load('24pt "Uni Sans"').then(function(){
        events.dispatchEvent({ 
            type: 'fontReady'
        });
    })

    return {
        setData
    }
}