import React, {useState} from 'react';
import ReactDOM from 'react-dom';

import {getSpringyDOMElement} from '../../index';

const SDiv = getSpringyDOMElement(
    'div',
    {
        height: {
            configWhenGettingBigger: {
                bounciness: 0.9,
                speed: 1.2
            },
            configWhenGettingSmaller: {
                bounciness: 0.5,
                speed: 3
            }
        }
    }
);

const LOREM = 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32. The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.';


function Expander() {
    const [expanded, setExpanded] = useState(false)
    const [text, setText] = useState(LOREM);

    return (
        <div>
            <button
                onClick={() => setExpanded(!expanded)}
            >
                Toggle
            </button>
            <button
                onClick={() => setText(text + LOREM)}
            >
                Add Text
            </button>

            <button
                onClick={() => setText(LOREM)}
            >
                Reset Text
            </button>
            <div style={{width: '200px'}}>
                <SDiv
                    springyStyle={{height: expanded ? 'auto' : 0}}
                    style={{overflow: 'hidden', backgroundColor: 'lightpink'}}
                >
                    {text}
                </SDiv>
            </div>
            
        </div>
    );
}

ReactDOM.render(
    <Expander />,
    document.getElementById('app')
);