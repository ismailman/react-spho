import React, {useState} from 'react';
import ReactDOM from 'react-dom';

import {getSpringyDOMElement, SpringyRepeater, SpringyFollowGroup} from '../../index';

const BouncyDiv = getSpringyDOMElement('div', {
    translateY: {speed: 0.6},
    rotate: {speed: 0.2}
});

const PulseDiv = getSpringyDOMElement('div', {
    scale: {speed: 0.3, bounciness: 0.5},
    opacity: {speed: 0.3, bounciness: 0.5}
});


function Repeater() {
    return (
        <div>
            <div>
                <h1>Back and Forth with Follow</h1>
                <div className="upAndDown">
                    <SpringyFollowGroup properties={['translateY']}>
                        <SpringyRepeater
                            direction="back-and-forth"
                            springyRepeaterStyles={{
                                translateY: {
                                    from: -20,
                                    to: 10
                                }
                            }}
                        >
                            <BouncyDiv springyOrderedIndex={0} />
                        </SpringyRepeater>
                        <BouncyDiv springyOrderedIndex={1} />
                        <BouncyDiv springyOrderedIndex={2} />
                    </SpringyFollowGroup>
                        
                </div>
            </div>
            <div>
                <h1>Pulsing</h1>
                <div className="pulsing">
                    <SpringyRepeater
                        normalizeToZeroAndOne
                        direction="from-beginning-each-time"
                        delayStartBetweenChildren={300}
                        springyRepeaterStyles={{
                            scale: {
                                from: 0,
                                to: 2,
                            },
                            opacity: {
                                from: 1,
                                to: 0,
                            }
                        }}
                    >
                        <PulseDiv 
                            style={{borderColor: 'red'}} 
                            springyOrderedIndex={0}
                        />                    
                        <PulseDiv 
                            style={{borderColor: 'purple'}} 
                            springyOrderedIndex={1}
                        />
                        <PulseDiv 
                            style={{borderColor: 'blue'}} 
                            springyOrderedIndex={2}
                        />
                    </SpringyRepeater>
                </div>
            </div>
            <div>
                <h1>Spinning</h1>
                <div className="spinning">
                    <SpringyRepeater
                        direction="from-beginning-each-time"
                        delayStartBetweenChildren={200}
                        springyRepeaterStyles={{
                            rotate: {
                                from: 0,
                                to: 360
                            }
                        }}
                    >
                        <BouncyDiv className="spinningContainer">
                            <div />
                        </BouncyDiv>
                    </SpringyRepeater>
                </div>
            </div>
        </div>
    );
}

ReactDOM.render(
    <Repeater />,
    document.getElementById('app')
);