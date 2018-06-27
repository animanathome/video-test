import * as THREE from 'three';
import Sequencer from './Sequencer';

export default function(canvas, text, video, events){
    
    const DPR = window.devicePixelRatio ? window.devicePixelRatio : 1;
    const sequencer = new Sequencer(events)

    var globalRenderer;
    var videoRenderer;
    var alphaRenderer;
    var textRenderer;

    var globalScene;
    var videoScene;
    var alphaScene;
    var textScene;

    const screenDimensions = {
        width: canvas.width,
        height: canvas.height
    }

    function buildScene(){
        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#FFF");
        return scene;
    }
    
    function buildRender({ width, height }) {
        globalRenderer = new THREE.WebGLRenderer({ 
                canvas: canvas, 
                alpha: true,
                antialias: true,
                preserveDrawingBuffer: true
            });
        globalRenderer.setPixelRatio(DPR);
        globalRenderer.setSize(width, height);

        // render targets
        videoRenderer = new THREE.WebGLRenderTarget(1024, 512, {
            format:THREE.RGBFormat})
        alphaRenderer = new THREE.WebGLRenderTarget(1024, 512, {
            format:THREE.RGBFormat})
        textRenderer = new THREE.WebGLRenderTarget(1024, 512, {
            format:THREE.RGBFormat})
    }

    function buildCamera({ width, height }) {
        const camera = new THREE.OrthographicCamera()
        camera.left = -width/2
        camera.right =  width/2
        camera.top = height/2
        camera.bottom = -height/2
        camera.near = 0
        camera.far = 10000
        camera.position.z = 10;
        camera.updateProjectionMatrix();
        return camera;
    }

    function buildGlobal({ width, height }){
        var material = compositeShader()
        material.uniforms.videoMap.value = videoRenderer.texture;
        material.uniforms.alphaMap.value = alphaRenderer.texture;
        material.uniforms.textMap.value = textRenderer.texture;

        var geometry = new THREE.PlaneBufferGeometry( 1, 1 );
        var plane = new THREE.Mesh(geometry, material);
        plane.scale.set(width, height, 1);

        return plane;
    }
    
    function update(){
        // evaluate sequencer
        sequencer.run()

        // render scene
        globalRenderer.render(videoScene, camera, videoRenderer, true)
        globalRenderer.render(alphaScene, camera, alphaRenderer, true)
        globalRenderer.render(textScene, camera, textRenderer, true)
        globalRenderer.render(globalScene, camera);
    }

    function onWindowResize(width, height){
        screenDimensions.width = width;
        screenDimensions.height = height;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        globalRenderer.setSize(width, height);
    }

    function setData(data){
        // background
        video.addSource(data.background.settings.url, 
                        data.background.settings.fileType)

        // foreground
        sequencer.setData(data.foreground.settings)
    }

    function compositeShader(){
        // create a basic composite shader

        var fragmentShader = [
            "varying vec2 vUv;",
            "uniform sampler2D videoMap;",
            "uniform sampler2D alphaMap;",
            "uniform sampler2D textMap;",
            "void main() {",
            "vec4 v = texture2D( videoMap, vUv );",
            "vec4 a = texture2D( alphaMap, vUv );",
            "vec4 t = texture2D( textMap, vUv );",
            "vec3 c = (t.rgb * a.r) + (v.rgb * (1.0 - a.r));",
            "gl_FragColor = vec4(c.x, c.y, c.z, 1.0);",
            "}"
        ].join("\n");

        var vertexShader = "#define USE_MAP\n" + THREE.ShaderLib["basic"].vertexShader;

        var uniforms = THREE.UniformsUtils.merge( [
            {
                "videoMap": { type: "t", value: null},
                "alphaMap": { type: "t", value: null},
                "textMap": { type: "t", value: null}
            },
            THREE.ShaderLib[ "basic" ].uniforms
        ]);
        return new THREE.ShaderMaterial({ 
            fragmentShader: fragmentShader, 
            vertexShader: vertexShader, 
            uniforms: uniforms 
        });
    }

    // Build render setup
    // Here we're building 4 different scenes. 3 to render out the individual 
    // passes: video, alpha and text and 1 to combine them all. 

    buildRender(screenDimensions);
    
    globalScene = buildScene();
    videoScene = buildScene();
    alphaScene = buildScene();
    alphaScene.background = new THREE.Color("#000");
    textScene = buildScene();
    
    const camera = buildCamera(screenDimensions);
    videoScene.add(camera);
    alphaScene.add(camera);
    textScene.add(camera);
    globalScene.add(camera);
    
    videoScene.add(video.buildLayer(screenDimensions));
    globalScene.add(buildGlobal(screenDimensions))

    for(var i = 0; i < text.length; i++){
        text[i].addLayer(textScene, alphaScene, {x:0, y:0});
    }

    // Listen for events
    // Here the sequencer will tell us what to do as it plays through the
    // animation

    // only start playing when both the font and video are loaded

    var fontReady = false
    var videoReady = false

    events.addEventListener('fontReady', function(event){
        console.log('font is ready')

        if(videoReady === true){
            sequencer.refresh()
            sequencer.play()
        }
        fontReady = true;
    });

    events.addEventListener('videoReady', function(event){
        console.log('video is ready for playback ')

        if(fontReady === true){
            sequencer.refresh()
            sequencer.play()
        }
        videoReady = true;
    });

    events.addEventListener('start', function(event){
        video.restart()
    });
    
    events.addEventListener('updateTextAnimation', function(event){
        if(event.message.settings.effect === 'grow'){
            for(var i = 0; i < text.length; i++){
                if(text[i].isEnabled() === true){
                    text[i].growLayer(event.message.amount, 
                                      event.message.settings.direction)
                }
            }
        }

        if(event.message.settings.hasOwnProperty('visible')){
            for(var j = 0; j < text.length; j++){
                text[j].visibility(event.message.settings.visible)
            }
        }

        // add any additional effects here
    })

    events.addEventListener('updateText', function(event){

        // text to render count
        var ttrc = event.message.text
        
        // render text
        for(var i = 0; i < ttrc.length; i++){
            text[i].updateLayer(event.message.text[i], 
                                event.message.colors[i],
                                event.message.position[i])
            text[i].visibility(false)
        }

        // hide unncessary text elements
        if(ttrc.length !== text.length){
            for(var j = ttrc.length; j < text.length; j++){
                text[j].disableLayer()
            }
        }
    })

    events.addEventListener('end', function(event){
        video.pause()
    });

    return {
        update,
        onWindowResize,
        setData,
        videoScene,
        text
    }   
}