import React, {useState} from 'react';
import ReactDOM from 'react-dom';

import getSpringyDOMElement from '../src/springyDOMElement';

const SDiv = getSpringyDOMElement(
    {
        left: {
            stiffness: 120,
            damping: 14,
            mass: 1,
            allowOvershooting: true
        },
        top: {
            stiffness: 120,
            damping: 14,
            mass: 1,
            allowOvershooting: true
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
            <div style={{left: left, top: top, backgroundColor: 'blue'}} />
            <SDiv left={left + 5} top={top + 5} style={{backgroundColor: 'red'}} />
        </div>
    );
}

ReactDOM.render(
    <Trail />,
    document.getElementById('app')
);