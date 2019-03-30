import {TRANSFORM_PROPERTIES} from './domStyleProperties';

export default function reconciler(ref, props, values) {
    if(ref == null) return;
    const currentStyle = props.style ? {...props.style} : {};
    let transformStyleString = '';
    for(let property in values){
        if(TRANSFORM_PROPERTIES.includes(property)){
            transformStyleString += ` ${property}(${values[property]})`;
            currentStyle.transform = transformStyleString;
        }
        else {
            currentStyle[property] = values[property];
        }
    }

    for(let property in currentStyle){
        ref.style[property] = currentStyle[property];
    }
}