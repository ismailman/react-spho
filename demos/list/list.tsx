import React, {useState, cloneElement} from 'react';
import ReactDOM from 'react-dom';

import {getSpringyDOMElement, SpringyRepositionGroup} from '../../index';

const SDiv = getSpringyDOMElement(
    'div',
    {
        translateX: {
            onEnterFromValue: -110,
            onEnterToValue: 0,
            onExitFromValue: 0,
            onExitToValue: -110,
            units: '%'
        }
    },
    (node) => {
        return {
            position: 'absolute',
            zIndex: 1,
            top: node.offsetTop,
            left: node.offsetLeft
        } as React.CSSProperties;
    }
);


function List() {
    const [itemList, setItemList] = useState([]);
    
    return (
        <div>
            <button
                onClick={() => setItemList([])}
            >
                Reset
            </button>
            <button
                onClick={() => setItemList(itemList.concat(Date.now()))}
            >
                Add Item
            </button>
            <button
                onClick={() => setItemList(shuffle(itemList))}
            >
                Shuffle
            </button>
            <SpringyRepositionGroup>
                {
                    itemList.map((item, index) => (
                        <SDiv 
                            key={String(item)}
                            style={{overflow: 'hidden', backgroundColor: 'green'}}
                        >
                            {new Date(item).toISOString()}
                            <button
                                onClick={() => setItemList([...itemList.slice(0, index), ...itemList.slice(index + 1)])}
                            >
                                X
                            </button>
                        </SDiv>
                    ))
                }
            </SpringyRepositionGroup>
            
        </div>
    );
}

ReactDOM.render(
    <List />,
    document.getElementById('app')
);

// taken from https://www.w3resource.com/javascript-exercises/javascript-array-exercise-17.php
function shuffle(arra1) {
    var ctr = arra1.length, index;
    const newArray = [...arra1];

// While there are elements in the array
    while (ctr > 0) {
// Pick a random index
        index = Math.floor(Math.random() * ctr);
// Decrease ctr by 1
        ctr--;
// And swap the last element with it
        const temp = newArray[ctr];
        newArray[ctr] = newArray[index];
        newArray[index] = temp;
    }
    return newArray;
}