import React, {useState} from 'react';
import ReactDOM from 'react-dom';

import getSpringyDOMElement from '../src/springyDOMElement';

const SDiv = getSpringyDOMElement(
    {
        left: {
            stiffness: 0.025,
            damping: 0.2
        },
        top: {
            stiffness: 0.025,
            damping: 0.2
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