import * as THREE from 'three';

export default function(container, suffix){
    
    if(suffix === undefined){
        suffix = 0
    }
    
    var canvas, context;
    const fontSize = 24;
    const border = 5;
    var textWidth;
    var textHeight = 28;
    var texture;
    var geoAlpha;
    var geoColor;
    var meshAlpha;
    var meshColor;
    var geoWidth;

    var enabled = true;

    init()

    function init(){
        canvas = document.createElement('canvas')
        container.appendChild(canvas);
        canvas.id = 'text'+suffix
        canvas.style.display = 'none';

        context = canvas.getContext('2d')
    }

    function render(text, colors){
        var textAsLine = text.join(' ')

        // clear the entire canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = fontSize+'pt Uni Sans';

        // calcuate the width of the text
        textWidth = context.measureText(textAsLine).width

        canvas.width = textWidth + (2*border);
        canvas.height = textHeight + (2*border);
        canvas.style.width = textWidth + (2*border);
        canvas.style.height = textHeight + (2*border);

        // create background frame
        context.fillStyle = 'orange';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // create text
        context.font = fontSize+'pt Uni Sans';
        context.textAlign = 'left';
        context.textBaseline = 'top';

        var y = border+2;
        var x = border+2;
        for(var i = 0; i < text.length; i++){
            context.fillStyle = colors[i]
            context.fillText(text[i], x, y);
            x += context.measureText(text[i]).width;
        }
    }
        
    function getGeoDimensions(){
        return {width: (textWidth + (2 * border)) *.375,
                height: (textHeight + (2 * border))*.375}
    }
    
    function addLayer(textScene, alphaScene, position){
        enabled = true

        if(position === undefined){
            position = {x:0, y:0}
        }

        texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        var matColor = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 1.0
        });

        var geoDimensions = getGeoDimensions()
        geoWidth = geoDimensions.width

        geoColor = new THREE.PlaneGeometry(geoDimensions.width,
                                           geoDimensions.height);
        meshColor = new THREE.Mesh(geoColor, matColor);
        meshColor.name = 'textColor';
        textScene.add(meshColor);

        meshColor.position.x = position.x
        meshColor.position.y = position.y

        var matAlpha = new THREE.MeshBasicMaterial({
            color: 'white',
            transparent: true,
            opacity: 1.0
        });

        geoAlpha = new THREE.PlaneGeometry(geoDimensions.width, 
                                           geoDimensions.height);
        meshAlpha = new THREE.Mesh(geoAlpha, matAlpha);
        meshAlpha.name = 'textAlpha';
        alphaScene.add(meshAlpha);

        meshAlpha.position.x = position.x
        meshAlpha.position.y = position.y
    }
    
    function updateLayer(text, colors, position){
        enabled = true

        if(position === undefined){
            position = {x:0, y:0}
        }

        render(text, colors);

        var geoDimensions = getGeoDimensions()

        geoWidth = geoDimensions.width
        var geoHalfWidth = (geoWidth/2)
        
        geoColor.vertices[0].x = - geoHalfWidth
        geoColor.vertices[1].x = geoHalfWidth
        geoColor.vertices[2].x = - geoHalfWidth
        geoColor.vertices[3].x = geoHalfWidth
        geoColor.verticesNeedUpdate = true;

        geoAlpha.vertices[0].x = - geoHalfWidth
        geoAlpha.vertices[1].x = geoHalfWidth
        geoAlpha.vertices[2].x = - geoHalfWidth
        geoAlpha.vertices[3].x = geoHalfWidth
        geoAlpha.verticesNeedUpdate = true;

        texture.needsUpdate = true;

        meshColor.position.x = position.x
        meshColor.position.y = position.y

        meshAlpha.position.x = position.x
        meshAlpha.position.y = position.y
    }

    function disableLayer(){
        enabled = false;
    }

    function isEnabled(){
        return enabled
    }

    function visibility(visibility){
        meshAlpha.visible = visibility;
    }

    function isvisible(){
        return meshAlpha.visible
    }

    function growLayer(amount=0.25, direction='left'){
        meshAlpha.visible = true;
        if(amount > 1){
            amount = 1;
        }
        if(amount < 0){
            amount = 0;
        }

        var multi = (amount * geoWidth)
        if(direction === 'left'){
            geoAlpha.vertices[1].x = geoAlpha.vertices[0].x + multi;
            geoAlpha.vertices[3].x = geoAlpha.vertices[0].x + multi;
        }else{
            geoAlpha.vertices[0].x = - geoAlpha.vertices[1].x + multi;
            geoAlpha.vertices[2].x = - geoAlpha.vertices[1].x + multi;
        }
        

        geoAlpha.verticesNeedUpdate = true;
    }

    return {
        init,
        render,
        addLayer,
        updateLayer,
        growLayer,
        visibility,
        isvisible,
        disableLayer,
        isEnabled
    }
}