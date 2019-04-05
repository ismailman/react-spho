import {TRANSFORM_PROPERTIES} from './domStyleProperties';

export default function reconciler(ref, currentStyle, values) {
    if(ref == null) return;
    let transformStyleString = '';
    for(let property in values){
        if(TRANSFORM_PROPERTIES.includes(property)){
            transformStyleString += ` ${property}(${values[property]})`;
        }
        else {
            ref.style[property] = values[property];
        }
    }

    if(transformStyleString.length > 0){
        ref.style['transform'] = `${currentStyle.transform || ''}${transformStyleString}`;
    }
}