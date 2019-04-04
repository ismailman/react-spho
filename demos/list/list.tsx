import React, {useState} from 'react';
import ReactDOM from 'react-dom';

import {getSpringyDOMElement} from '../../index';

const SDiv = getSpringyDOMElement(
    {
        translateX: {
            bounciness: 1,
            initialFromValue: -300,
            unitSuffix: 'px'
        },
        opacity: {
            initialFromValue: 0
        }
    },
    'div'
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
                        <div key={String(item)}>
                            <SDiv height="auto" translateX={0} opacity={1} style={{overflow: 'hidden', backgroundColor: 'green', display: 'inline-block'}}>
                                {new Date(item).toISOString()}
                                <button
                                    onClick={() => setItemList([...itemList.slice(0, index), ...itemList.slice(index + 1)])}
                                >
                                    X
                                </button>
                            </SDiv>
                        </div>
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