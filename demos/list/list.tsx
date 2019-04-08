import React, {useState} from 'react';
import ReactDOM from 'react-dom';

import {getSpringyDOMElement} from '../../index';

const SDiv = getSpringyDOMElement(
    'div',
    {
        height: {
            bounciness: 0.5,
            onExitToValue: 0
        },
        opacity: {
            onEnterFromValue: 0,
            onEnterToValue: 1
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
            </div>
            
        </div>
    );
}

ReactDOM.render(
    <List />,
    document.getElementById('app')
);