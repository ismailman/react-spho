import lolex from 'lolex';
import { number } from 'prop-types';


const clock = lolex.install();

export function resetBodyAndGetAppDiv(): HTMLDivElement {

    document.body.innerHTML = '';
    const div = document.createElement('div');
    document.body.appendChild(div);

    return div;

}

export async function runNumberOfFramesForward(numberOfFrames: number) {

    for(let ii=0; ii<numberOfFrames; ii++){
        clock.runToFrame();
        await Promise.resolve(); //let queued up promises resolve
    }

}