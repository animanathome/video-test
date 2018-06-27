import * as THREE from 'three';

export default events => {

    const clock = new THREE.Clock()
    var data = []
    var loop = true
    var playCount = 0
    var totalDuration = 0.0
    var relTimeStep = []
    var absTimeStep = []
    var nSteps = 0
    var stepIndex = 0
    var stepPosition = []
    var stepProgress = 0.0
    var textIndex = 0
    var wait = true;

    function getTotalDuration(){
        // calculate the total length of our edit
        totalDuration = 0;
        for(var i = 0; i < data.length; i++){
            for(var j = 0; j < data[i].animation.length; j++){
                totalDuration += data[i].animation[j].duration;
                absTimeStep.push(totalDuration)
                relTimeStep.push(data[i].animation[j].duration)
                stepPosition.push([i, j])
            }
        }
        nSteps = absTimeStep.length
    }

    function init(){
        getTotalDuration()
    }

    function setData(input){
        data = input;
        init()
    }

    function play(){
        wait = false
    }

    function stop(){
        wait = true
    }

    function run(){
        if(data.length === 0){
            return
        }

        if(wait === true){
            return
        }

        if(clock.running === false){
            if(playCount === 0 || loop === true){
                clock.start()

                events.dispatchEvent({ 
                    type: 'start'
                });
            }
            updateText(0)
        }else{
            stepProgress = 1 - ((absTimeStep[stepIndex] - clock.getElapsedTime()) / relTimeStep[stepIndex]);
            updateTextAnimation(getStep(stepPosition[stepIndex]), stepProgress)

            if(absTimeStep[stepIndex] < clock.getElapsedTime()){
                stepIndex += 1;
                
                if(nSteps === stepIndex){
                    stepIndex = 0;
                    textIndex = 0;
                    clock.stop();
                    playCount += 1;
                    end();
                }else{
                    newTextAnimation(getStep(stepPosition[stepIndex]))
                }
            }
        }
    }

    function refresh(){
        updateText(0)
    }

    // sequence events

    function getStep(position){
        var info = data[position[0]].animation[position[1]]

        if(textIndex !== position[0]){
            textIndex = position[0]
            updateText(position[0])
        }
        return info
    }

    function updateText(index){
        events.dispatchEvent({ 
            type: 'updateText', 
            message: {
                text: data[index].text,
                colors: data[index].colors,
                position: data[index].position
            }
        });
    }

    function updateTextAnimation(settings, amount){
        events.dispatchEvent({ 
            type: 'updateTextAnimation', 
            message: {
                settings: settings,
                amount: amount
            }
        });
    }

    function newTextAnimation(settings){
        // console.log('newTextAnimation', settings)
    }

    function end(){
        events.dispatchEvent({ 
            type: 'end'
        });
    }

    return {
        init,
        run,
        loop,
        setData,
        play,
        stop,
        refresh
    }
}