import React, {useState} from 'react';
import ReactDOM from 'react-dom';

import {getSpringyDOMElement, SpringyFollowGroup, SpringyRepeater} from '../../index';

const SDiv = getSpringyDOMElement('div');

function Trail() {
    const [length, setLength] = useState(5);
    const [width, setWidth] = useState(5);
    const [centerRow, setCenterRow] = useState(-1);
    const [centerColumn, setCenterColumn] = useState(-1);
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
            <SpringyFollowGroup properties={["scale"]}>
                {
                    [...Array(length)].map((_, row) => (
                        <div className="row" key={row}>
                            {
                                [...Array(width)].map((_, column) => {
                                    if(row === centerRow && column === centerColumn) {
                                        return (
                                            <SpringyRepeater
                                                key={`${row}_${column}`}
                                                numberOfTimesToRepeat={1}
                                                direction="back-and-forth"
                                                springyRepeaterStyles={{
                                                    scale: {
                                                        from: 1,
                                                        to: 0.2
                                                    }
                                                }}
                                            >
                                                <SDiv 
                                                    className="cell"
                                                    springyOrderedIndex={Math.max(Math.abs(row-centerRow), Math.abs(column-centerColumn))}
                                                    onClick={e => {
                                                        setCenterRow(row);
                                                        setCenterColumn(column);
                                                        setSmall(!small);
                                                    }}
                                                />
                                            </SpringyRepeater>
                                        );
                                    }
                                    else {
                                        return (
                                            <SDiv 
                                                key={`${row}_${column}`}
                                                className="cell"
                                                springyOrderedIndex={Math.max(Math.abs(row-centerRow), Math.abs(column-centerColumn))}
                                                onClick={e => {
                                                    setCenterRow(row);
                                                    setCenterColumn(column);
                                                    setSmall(!small);
                                                }}
                                            />
                                        );
                                    }
                                })
                            }
                        </div>
                    ))
                }
            </SpringyFollowGroup>
        </div>
    );
}

ReactDOM.render(
    <Trail />,
    document.getElementById('app')
);