import React from 'react';

import VideoData from './VideoData';
import ThreeContainer from './Three/ThreeContainer';

class VideoPreview extends React.Component {

    componentDidMount(){
        const scene = ThreeContainer(this.threeRootElement)
        scene.setData(VideoData)
    }

    render() {
        return (
            <div className="lefts-border-line manufacturer-panel">
                <h1 className="manufacturer-title">
                    Video Preview
                </h1>
                <hr/>
                <div className="video-container">
                    <div className="aspect-ratio-fixer">
                        <div className="use-aspect-ratio">
                            <div className="three-container" ref={element => this.threeRootElement = element} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default VideoPreview;
