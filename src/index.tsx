import React, {useEffect, useRef, forwardRef} from 'react';
import {useSpho, useMultipleSpho, SpringConfig, SpringValueListener} from 'use-spho';
import { string } from 'prop-types';

export type SpringConfigMap = {
    [key:string]: SpringConfig;
}

export interface SPHOProps {
    onSPHOValueUpdate?: {
        [key: string]: SpringValueListener;
    };
    onSPHOValueAtRest?: {
        [key: string]: SpringValueListener;
    };
    forwardedRef: any;
};

export default function getSpringyComponent<T extends object>(configMap: SpringConfigMap, updater: (ref: any, property: string, lastProps: any, value: number) => void, ComponentToWrap: any) {

    function springyComponent(props: T & SPHOProps, ref){
        const propertyValues = [];
        const updaters = {};
        const elRef = useRef(null);
        const [setFromValue, setToValue] = useMultipleSpho(
            Object.keys(configMap).reduce((combinedConfig, property) => {
                combinedConfig[property] = {
                    springConfig: configMap[property],
                    listeners: {
                        onUpdate: (value) => {
                            if(elRef.current == null) return;
                            updater(elRef.current, property, props, value);
                            if(props.onSPHOValueUpdate && props.onSPHOValueUpdate[property]) props.onSPHOValueUpdate[property](value);
                        },
                        onAtRest: props.onSPHOValueAtRest && props.onSPHOValueAtRest[property]
                    }
                };
                return combinedConfig;
            }, {})
        );

        for(let property in configMap) {
            propertyValues.push(props[property]);
        }

        useEffect(() => {
            for(let property in configMap){
                setToValue(property, props[property]);
            }
        }, propertyValues);

        const propsWithoutSpringyProps = {};
        for(let property in props){
            if(configMap[property] == null) propsWithoutSpringyProps[property] = props[property];
        }

        return (
            <ComponentToWrap 
                ref={_ref => {
                    if(ref){
                        if(typeof ref === 'function') ref(_ref);
                        else if(typeof ref === 'object' && ref.hasOwnProperty(ref, 'current')) ref.current = _ref;
                    }
                    
                    elRef.current = _ref;
                }}
                {...propsWithoutSpringyProps}
            />

        );
    }

    return forwardRef(springyComponent);
}