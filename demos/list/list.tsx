import React, {useState} from 'react';
import ReactDOM from 'react-dom';

import {getSpringyDOMElement} from '../../index';

const SDiv = getSpringyDOMElement(
    'div',
    {
        height: {
            bounciness: 0.5,
            onEnterFromValue: 2,
            onExitToValue: 0
        },
        translateX: {
            onEnterFromValue: 100
        },
        opacity: {
            onEnterFromValue: 0,
            onExitToValue: 0
        }
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
            <div>
                {
                    itemList.map((item, index) => (
                        <SDiv 
                            key={String(item)}
                            springyStyle={{height: 'auto', translateX: 0, opacity: 1}} 
                            style={{overflow: 'hidden', backgroundColor: 'green', transform: 'translateX(-10px)'}}
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
            </div>
            
        </div>
    );
}

ReactDOM.render(
    <List />,
    document.getElementById('app')
);