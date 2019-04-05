import React, {useState} from 'react';
import ReactDOM from 'react-dom';

import {getSpringyDOMElement} from '../../index';

const SDiv = getSpringyDOMElement(
    'div',
    {
        scale: {
            bounciness: 0.5,
            initialFromValue: 2
        },
        opacity: {
            initialFromValue: 0
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
                        <div key={String(item)}>
                            <SDiv 
                                springyStyle={{scale: 1, opacity: 1}} 
                                style={{overflow: 'hidden', backgroundColor: 'green', display: 'inline-block'}}
                            >
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