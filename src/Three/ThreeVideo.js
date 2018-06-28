
import * as THREE from 'three';

export default function(container, events){
    
    var videoElement;
    var texture;

    function init(){
        videoElement = document.createElement('video')
        videoElement.id = 'video';
        videoElement.autoplay = false;
        videoElement.muted = true;
        videoElement.loop = true;
        videoElement.crossOrigin = "anonymous";
        videoElement.style.display = 'none';
        container.appendChild(videoElement);

        videoElement.addEventListener('loadeddata', function() {
            if(videoElement.readyState >= 2) {
                // console.log('video is ready to play')
                events.dispatchEvent({ 
                    type: 'videoReady'
                });
            }
        });
    }

    function addSource(url, type ){
        var source = document.createElement('source');
        source.src = url;
        source.type = type;
        videoElement.appendChild(source);
        return source
    }

    function buildLayer({ width, height }){
        texture = new THREE.VideoTexture( videoElement );
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBFormat;
        var parameters = { color: 0xffffff, map: texture };

        var material = new THREE.MeshBasicMaterial(parameters);
        var geometry = new THREE.PlaneBufferGeometry( 1, 1 );
        var plane = new THREE.Mesh(geometry, material);
        plane.scale.set(width, height, 1);

        return plane;
    }

    function restart(){
        videoElement.currentTime = 0;
        videoElement.play();
    }

    function pause(){
        videoElement.pause()
    }

    init()

    return {
        addSource,
        buildLayer,
        restart,
        pause
    }
}