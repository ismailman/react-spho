import React, {useState} from 'react';
import ReactDOM from 'react-dom';

import {getSpringyDOMElement, SpringyFollowGroup} from '../../index';

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
            <SpringyFollowGroup properties={[{property: "translateX", offset: 5}, {property: "translateY", offset: 5}]}>
                <SDiv key="0" springyFollowGroupIndex={0} springyStyle={{translateX: left, translateY: top}} style={{backgroundColor: 'red'}} />
                {
                    arr.map((_, index) => (
                        <SDiv key={index + 1} springyFollowGroupIndex={index + 1} style={{backgroundColor: 'red'}} />
                    ))
                }
            </SpringyFollowGroup>
            <div style={{transform: `translateX(${left}px) translateY(${top}px)`, backgroundColor: 'blue'}} />
        </div>
    );
}

ReactDOM.render(
    <Trail />,
    document.getElementById('app')
);