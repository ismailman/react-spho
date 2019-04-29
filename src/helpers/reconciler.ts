import transformValuesToTransformCommands from 'transform-values-to-transform-commands';
import {TRANSFORM_PROPERTIES} from './domStyleProperties';

export default function reconciler(ref, currentStyle, values) {
    if(ref == null) return;
    
    for(let property in values){
        if(!TRANSFORM_PROPERTIES.includes(property)){
            ref.style[property] = values[property];
        }
    }

    ref.style['transform'] = `${currentStyle.transform || ''} ${transformValuesToTransformCommands(values)}`;
}