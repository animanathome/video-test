import mp4_url from './BackgroundRaw.mp4';

const TextData = [
    {
        text: [['WHAT IS', ' YOUR ', 'MORNING'], ['ROUTINE?']],
        colors: [['white', 'black', 'white'], ['WHITE']],
        position: [{x: -70, y: 0}, {x:-111, y: -15}],
        animation: [
            {
                direction: 'left',
                effect: 'grow',
                duration: 0.375
            },
            {
                effect: 'none',
                duration: 2.75
            },
            {
                direction: 'right',
                effect: 'grow',
                duration: .125
            },
            {
                effect: 'none',
                visible: false,
                duration: .25
            }
        ]
    },
    {
        text: [['COFFEE', ' + ', 'EMAIL!']],
        colors: [['white', 'black', 'white']],
        position: [{x: -90, y: 0}],
        animation: [
            {
                direction: 'left',
                effect: 'grow',
                duration: 0.375
            },
            {
                effect: 'none',
                duration: 2.75
            },
            {
                direction: 'right',
                effect: 'grow',
                duration: .125
            },
            {
                effect: 'none',
                visible: false,
                duration: .25
            }
        ]
    }
]

const VideoData = {
    background: {
        mediaType: 'video',
        settings: {
            url: mp4_url,
            fileType: 'video/mp4',
            resolution: {
                width: 1920,
                height: 1080
            }
        }
    },
    foreground: {
        mediaType: 'text',
        settings: TextData
    }   
}

export default VideoData;