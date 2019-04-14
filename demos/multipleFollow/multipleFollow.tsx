import React, {useState} from 'react';
import ReactDOM from 'react-dom';

import {getSpringyDOMElement, SpringFollowGroup} from '../../index';

const SDiv = getSpringyDOMElement('div');

const arr = [1, 2, 3, 4, 5];
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
            <SpringFollowGroup properties={[{property: "translateX", offset: 5}, {property: "translateY", offset: 5}]}>
                <SDiv key="0" sphoIndex={0} springyStyle={{translateX: left + 5, translateY: top + 5}} style={{backgroundColor: 'red'}} />
                {
                    arr.map((_, index) => (
                        <SDiv key={index + 1} sphoIndex={index + 1} style={{backgroundColor: 'red'}} />
                    ))
                }
            </SpringFollowGroup>
            <div style={{transform: `translateX(${left}px) translateY(${top}px)`, backgroundColor: 'blue'}} />
        </div>
    );
}

ReactDOM.render(
    <Trail />,
    document.getElementById('app')
);