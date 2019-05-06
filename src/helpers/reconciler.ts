import transformValuesToTransformCommands from 'transform-values-to-transform-commands';
import {TRANSFORM_PROPERTIES} from './domStyleProperties';
import {StyleObject} from '../types';

export default function reconciler(refElement: null | HTMLElement, currentStyle: StyleObject, values: any) {
    if(refElement == null) return;
    
    for(let property in values){
        if(!TRANSFORM_PROPERTIES.includes(property)){
            refElement.style[property] = values[property];
        }
    }

    refElement.style['transform'] = `${currentStyle.transform || ''} ${transformValuesToTransformCommands(values)}`;
}