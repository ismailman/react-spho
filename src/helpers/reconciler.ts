import {StyleObject} from '../types';

export default function reconciler(refElement: null | HTMLElement, currentStyle: StyleObject, values: any) {
    if(refElement == null) return;
    
    for(let property in values){
        refElement.style[property] = values[property];        
    }
}