import React, {useState} from 'react';
import ReactDOM from 'react-dom';

import {getSpringyDOMElement, SpringFollowGroup} from '../../index';

const SDiv = getSpringyDOMElement('div');

function Trail() {
    const [length, setLength] = useState(5);
    const [width, setWidth] = useState(5);
    const [centerRow, setCenterRow] = useState(2);
    const [centerColumn, setCenterColumn] = useState(2);
    const [small, setSmall] = useState(false);

    return (
        <div>
            <div>
                <div>
                    Length: <input value={length} onChange={e => setLength(parseInt(e.target.value)) }/>
                </div>
                <div>
                    Width: <input value={width} onChange={e => setWidth(parseInt(e.target.value)) }/>
                </div>
            </div>
            <SpringFollowGroup properties={["scale"]}>
                {
                    [...Array(length)].map((_, row) => (
                        <div className="row" key={row}>
                            {
                                [...Array(width)].map((_, column) => (
                                    <SDiv 
                                        key={`${row}_${column}`}
                                        className="cell"
                                        springFollowGroupIndex={Math.max(Math.abs(row-centerRow), Math.abs(column-centerColumn))}
                                        springyStyle={{scale: small ? 0.5 : 1}}
                                        onClick={e => {
                                            setCenterRow(row);
                                            setCenterColumn(column);
                                            setSmall(!small);
                                        }}
                                    />
                                ))
                            }
                        </div>
                    ))
                }
            </SpringFollowGroup>
        </div>
    );
}

ReactDOM.render(
    <Trail />,
    document.getElementById('app')
);