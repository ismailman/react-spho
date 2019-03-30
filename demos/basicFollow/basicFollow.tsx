import React, {useState} from 'react';
import ReactDOM from 'react-dom';

import {getSpringyDOMElement} from '../../index';

const SDiv = getSpringyDOMElement(
    {
        left: {
            bounciness: 1,
            speed: 1
        },
        top: {
            bounciness: 1,
            speed: 1
        }
    },
    'div'
);


function Trail() {
    const [left, setLeft] = useState(0);
    const [top, setTop] = useState(0);

    return (
        <div
            onMouseMove={e => {
                setLeft(e.pageX);
                setTop(e.pageY);
            }}
        >
            <SDiv left={left + 5} top={top + 5} style={{backgroundColor: 'red'}} />
            <div style={{left: left, top: top, backgroundColor: 'blue'}} />
        </div>
    );
}

ReactDOM.render(
    <Trail />,
    document.getElementById('app')
);