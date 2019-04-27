import React, {useState} from 'react';
import ReactDOM from 'react-dom';

import {getSpringyDOMElement, SpringFollowGroup, SpringyRepositionGroup} from '../../index';

const SDiv = getSpringyDOMElement('div', {
    opacity: {
        onEnterFromValue: 0,
        onEnterToValue: 1,
        onExitToValue: 0,
        bounciness: 0.5
    },
    translateY: {
        onEnterFromValue: -10,
        onEnterToValue: 0,
        onExitToValue: -10,
        bounciness: 0.5
    },
    scale: {
        onEnterFromValue: 2,
        onEnterToValue: 1,
        onExitToValue: 2,
        configWhenGettingSmaller: {
            bounciness: 0.5,
            speed: 3
        }
    }
});

const arr = [1, 2, 3, 4, 5];
function Trail() {
    const [show, setShow] = useState(false);

    return (
        <div style={{position: 'relative'}}>
            <div>
                <button onClick={() => setShow(!show)}>
                    Toggle
                </button>
            </div>
            <SpringFollowGroup properties={["opacity", "translateY", "scale"]}>
                {
                    show && arr.map((_, index) => (
                                <SDiv 
                                    key={index} 
                                    springFollowGroupIndex={index}
                                    globalUniqueIDForSpringReuse={`fader_${index}`}
                                    style={{backgroundColor: 'red', height: '20px', width: '20px', margin: '10px'}}
                                />
                            ))                
                }
            </SpringFollowGroup>
        </div>
    );
}

ReactDOM.render(
    <Trail />,
    document.getElementById('app')
);