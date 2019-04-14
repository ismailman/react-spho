import React, {useState} from 'react';
import ReactDOM from 'react-dom';

import {getSpringyDOMElement, SpringFollowGroup, SpringyRepositionGroup} from '../../index';

const SDiv = getSpringyDOMElement('div', {
    opacity: {
        onEnterFromValue: 0,
        onEnterToValue: 1,
        onExitToValue: 0,
        speed: 1,
        bounciness: 0.5
    },
    translateY: {
        onEnterFromValue: -10,
        onEnterToValue: 0,
        onExitToValue: -10,
        bounciness: 0.5,
        speed: 1
    }
});

const arr = [1, 2];
function Trail() {
    const [show, setShow] = useState(false);

    return (
        <div style={{position: 'relative'}}>
            <div>
                <button onClick={() => setShow(!show)}>
                    Toggle
                </button>
            </div>
            <SpringFollowGroup properties={["opacity", "translateY"]}>
                {
                    show && arr.map((_, index) => (
                                <SDiv 
                                    key={index} 
                                    sphoIndex={index}
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