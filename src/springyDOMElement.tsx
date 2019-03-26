import React, {forwardRef, useEffect, useLayoutEffect, useRef} from 'react';

import getSpringyComponent, {SpringConfigMap, SPHOProps} from './index';

const TRANSFORM_PROPERTIES = [
    'scaleX',
    'scaleY',
    'scaleZ',
    'translateX',
    'translateY',
    'translateZ',
    'rotateX',
    'rotateY',
    'rotateZ',
    'skewX',
    'skewY'
];

const AUTO_PROPERTIES = [
    'width',
    'height',
    'margin',
    'top',
    'right',
    'bottom',
    'left'
];

const scheduledUpdatesById = new Map();
const currentValuesById = new Map();

function reconciler(ref, props, values) {
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

export default function getSpringyDOMElement(configMap: SpringConfigMap, ComponentToWrap: string){

     const SpringyComponent: any = getSpringyComponent(configMap, (ref, property, props, value) => {

        let existingUpdate = scheduledUpdatesById.get(props.__springyId__);
        if(!existingUpdate){
            existingUpdate = {
                scheduled: Promise.resolve().then(() => {
                    reconciler(ref, existingUpdate.props, existingUpdate.values);
                    scheduledUpdatesById.delete(props.__springyId__);
                }),
                values: {}
            };
            scheduledUpdatesById.set(props.__springyId__, existingUpdate);
        }

        existingUpdate.props = props;
        existingUpdate.values[property] = value;

     }, ComponentToWrap);

     const propsThatAreSpringy = Object.keys(configMap);
     const isTransformSpringy = propsThatAreSpringy.some(property => TRANSFORM_PROPERTIES.includes(property));

     class SpringyDOMElement extends React.PureComponent {
        _id = Math.random() + '-' + Date.now();

        render() {
            const propsWithoutForwardedRef = {...this.props};            
            delete (propsWithoutForwardedRef as any).forwardedRef

            return (
                <SpringyComponent
                    __springyId__={this._id}
                    {...propsWithoutForwardedRef}
                    ref={(this.props as any).forwardedRef}
                />
            );
        }

     }

     const DOMElement: any = SpringyDOMElement;
     return forwardRef((props, ref) => <DOMElement {...props} forwardedRef={ref} />);

}