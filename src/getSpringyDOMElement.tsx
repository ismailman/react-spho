import React, {forwardRef, useEffect, useLayoutEffect, useRef} from 'react';
import Spring, {SpringConfig, SpringValueListener} from 'simple-performant-harmonic-oscillator';
import decomposeDOMMatrix from 'decompose-dommatrix';

import {DOMSpringConfigMap} from './types';
import handleForwardedRef from './handleForwardedRef';
import getSuffix from './getSuffix';
import {TRANSFORM_PROPERTIES, AUTO_PROPERTIES, RESIZE_PROPERTIES} from './domStyleProperties';
import reconciler from './reconciler';

export default function getSpringyDOMElement(ComponentToWrap: string, configMap: DOMSpringConfigMap = {}){
     
     class SpringyDOMElement extends React.PureComponent {

        _reconcileUpdate;
        _ref;
        _resizeObserver;
        _isSecondRender: boolean = false;
        _needsSecondRender: boolean = false;
        _springMap: Map<string, Spring> = new Map();

        render() {
            const cleanProps = {...this.props};
            delete (cleanProps as any).forwardedRef;
            delete (cleanProps as any).onSPHOValueUpdate;
            delete (cleanProps as any).onSPHOValueAtRest;

            let springyStyle = this.props.springyStyle;
            if(springyStyle || configMap){
                delete cleanProps.springyStyle;

                if(!springyStyle) {
                    springyStyle = {}; // we have a configMap, so we'll have an artificial springyStyle object
                    
                    //put the springyStyle value for this property to the onEnterToValue
                    // we do this BEFORE th flipAutoPropsIfNecessary so that allows the config map
                    // to have "auto" as a onEnterToValue value
                    for(let property in configMap){
                        if(configMap[property].onEnterToValue != null){
                            springyStyle[property] = configMap[property].onEnterToValue;
                        }
                        else if(
                            (configMap[property].onEnterFromValue != null || configMap[property].onEnterFromValueOffset != null) &&
                            AUTO_PROPERTIES.includes(property)
                        ){
                            springyStyle[property] = 'auto'; //default to auto
                        }
                    }                
                }
                this._flipAutoPropsIfNecessary(springyStyle);

                for(let property in springyStyle){
                    this._setupOrUpdateSpringForProperty(property, springyStyle[property]);
                }
            }

            return (                
                <ComponentToWrap
                    {...cleanProps}
                    ref={ref => {
                        this._ref = ref;
                        handleForwardedRef(ref, this.props.forwardedRef)
                    }}
                > {
                    this.props.children && (
                        <SecondRenderGuard isSecondRender={this._isSecondRender}>
                            {this.props.children}
                        </SecondRenderGuard>
                    )
                  }
                </ComponentToWrap>
                
            );
        }

        componentDidMount(){
            if(!this._isSecondRender && this._needsSecondRender){
                this._rerenderToUseTrueSize();
            }

            this._dealWithPotentialResizeObserver();
        }

        componentDidUpdate(){
            if(!this._isSecondRender && this._needsSecondRender){
                this._rerenderToUseTrueSize();
            }

            this._dealWithPotentialResizeObserver();
        }

        componentWillUnmount() {
            for(let spring of this._springMap.values()) {
                spring.end();
            }
            this._killResizeObserver();

            this._handleOnExitIfExists();
        }

        _flipAutoPropsIfNecessary(springyStyle) {
            const propsThatAreSpringy = Object.keys(springyStyle);
            const springyPropsThatCanBeAuto = propsThatAreSpringy.filter(property => AUTO_PROPERTIES.includes(property));
            if (springyPropsThatCanBeAuto.length === 0) return;

            const propsThatAreAuto = 
                Object.keys(springyStyle)
                        .filter(
                            property => 
                                springyStyle[property] === 'auto' &&
                                springyPropsThatCanBeAuto.includes(property)
                        );

            if(propsThatAreAuto.length === 0) return;
            if(!this._isSecondRender) {
                this._needsSecondRender = true;
                return;
            }

            // generate clone and replace ref with clone so it has the exact same positioning and such
            const clone = this._ref.cloneNode(true); //true = deep clone
            this._ref.insertAdjacentElement('beforebegin', clone);
            this._ref.remove();

            // apply latest styles
            reconciler(clone, {...this.props.style}, springyStyle);

            // get the computed styles and clean up
            const computedStyle = getComputedStyle(clone);
            propsThatAreAuto.forEach(property => {
                springyStyle[property] = parseFloat(computedStyle.getPropertyValue(property)); //use target value for mutable prop
            });
            clone.insertAdjacentElement('beforebegin', this._ref);
            clone.remove();
        }

        _setupOrUpdateSpringForProperty(property, propValue) {
            if(propValue == 'auto') return;

            let spring = this._springMap.get(property);

            const toValue = 
                propValue != null ?
                    propValue :
                    configMap && configMap[property] && configMap[property.onEnterToValue];

            // we don't have a target toValue, then don't do anything
            if(toValue == null){
                return;
            }

            // spring has already been initialized and we're just updating value
            if(spring != null){
                if(configMap[property] && configMap[property].configWhenGettingBigger && propValue > spring.getToValue()){
                    spring.setBounciness(configMap[property].configWhenGettingBigger.bounciness);
                    spring.setSpeed(configMap[property].configWhenGettingBigger.speed);
                }
                else if(configMap[property] && configMap[property].configWhenGettingSmaller && propValue < spring.getToValue()){
                    spring.setBounciness(configMap[property].configWhenGettingSmaller.bounciness);
                    spring.setSpeed(configMap[property].configWhenGettingSmaller.speed);
                }                
                spring.setToValue(propValue);
                return;
            }

            let fromValue, config;

            if(configMap[property]){
                fromValue = 
                    configMap[property].onEnterFromValue != null ?
                        configMap[property].onEnterFromValue :
                    configMap[property].onEnterFromValueOffset == null ? 
                        propValue :
                        propValue + configMap[property].onEnterFromValueOffset;

                if(configMap[property].configWhenGettingBigger && toValue >= fromValue) {
                    config = configMap[property].configWhenGettingBigger;
                }
                else if(configMap[property].configWhenGettingSmaller && toValue < fromValue) {
                    config = configMap[property].configWhenGettingSmaller;
                }
                else {
                    config = configMap[property];
                }
            }
            else {
                config = {};
            }

            spring = new Spring(
                config,
                {fromValue, toValue}
            );

            spring.onUpdate((value: number) => {
                this._updateValueForProperty(property, value);
                if(this.props.onSPHOValueUpdate) this.props.onSPHOValueUpdate(property, value);
            });

            spring.onAtRest((value: number) => {
                if(this.props.onSPHOValueAtRest) this.props.onSPHOValueAtRest(property, value);
            });

            this._springMap.set(property, spring);
        }

        _updateValueForProperty(property, value) {
            let existingUpdate = this._reconcileUpdate;
            if(!existingUpdate){
                existingUpdate = {
                    scheduled: Promise.resolve().then(() => {
                        reconciler(this._ref, {...this.props.style}, existingUpdate.values);
                        this._reconcileUpdate = null;
                    }),
                    values: {}
                };
                this._reconcileUpdate = existingUpdate;
            }

            existingUpdate.values[property] = `${value}${getSuffix(configMap, property)}`;
        }

        _dealWithPotentialResizeObserver(){
            const springyStyle = this.props.springyStyle;
            if(springyStyle == null) {
                this._killResizeObserver();
                return;
            }
            
            const propsThatAreSpringy = Object.keys(springyStyle);
            const springyPropsThatCanBeAuto = propsThatAreSpringy.filter(property => AUTO_PROPERTIES.includes(property));
            const resizableSpringyAutoProperties = springyPropsThatCanBeAuto.filter(property => RESIZE_PROPERTIES.includes(property));
            if(resizableSpringyAutoProperties.length === 0) {
                this._killResizeObserver();
                return;
            }

            if(this._resizeObserver){
                //we already have one
                return;
            }

            if(window.ResizeObserver){
                this._resizeObserver = new ResizeObserver(entries => {
                    const springyStyle = this.props.springyStyle;
                    const propsThatAreAutoAndResizable = 
                        Object.keys(springyStyle)
                                .filter(
                                    property => 
                                        springyStyle[property] === 'auto' &&
                                        RESIZE_PROPERTIES.includes(property)
                                );
    
                    if(propsThatAreAutoAndResizable.length > 0 && !this._isSecondRender && !this._needsSecondRender){
                        this._rerenderToUseTrueSize();
                    }
                });
    
                this._resizeObserver.observe(this._ref);
            }

            if(this._needsSecondRender){
                this._rerenderToUseTrueSize();
            }
        }

        _rerenderToUseTrueSize() {
            this._isSecondRender = true;
            this.forceUpdate(() => {
                this._needsSecondRender = false;
                this._isSecondRender = false;
            });
        }

        _killResizeObserver(){
            if(this._resizeObserver){
                this._resizeObserver.disconnect();
                this._resizeObserver = null;
            }
        }

        _handleOnExitIfExists() {
            if(!configMap || !this._ref) return;
            const propertiesWithOnExitValue = Object.keys(configMap).filter(property => configMap[property].onExitToValue != null);

            if(propertiesWithOnExitValue.length === 0) return;

            const lastStyle = {...this.props.style};

            const fromValues = {};
            const clone = this._ref.cloneNode(true); //true = deep clone
            clone.style.pointerEvents = 'none';
            this._ref.insertAdjacentElement('beforebegin', clone);
            this._ref.remove();
            const computedStyle = getComputedStyle(clone);
            propertiesWithOnExitValue.filter(property => !TRANSFORM_PROPERTIES.includes(property)).forEach(property => {
                fromValues[property] = parseFloat(computedStyle.getPropertyValue(property)); //use target value for mutable prop
            });

            const transformPropertiesWithOnExitValue = propertiesWithOnExitValue.filter(property => TRANSFORM_PROPERTIES.includes(property));
            if(transformPropertiesWithOnExitValue.length > 0){
                const domMatrix = new DOMMatrix(computedStyle.getPropertyValue('transform'));
                const transformValues = decomposeDOMMatrix(domMatrix);
                for(let property of transformPropertiesWithOnExitValue){
                    if(property === 'scale'){
                        fromValues[property] = transformValues.scaleX;
                    }
                    else {
                        fromValues[property] = transformValues[property];
                    }
                }
            }

            clone.insertAdjacentElement('beforebegin', this._ref);

            let existingUpdate;
            let springsActiveCount = 0;
            const finalValues = {};
            for(let property of propertiesWithOnExitValue) {
                const config = configMap[property];
                let springConfig;
                if(fromValues[property] > config.onExitToValue && config.configWhenGettingSmaller) {
                    springConfig = config.configWhenGettingSmaller;
                }
                else if (fromValues[property] < config.onExitToValue && config.configWhenGettingBigger) {
                    springConfig = config.conficWhenGettingBigger;
                }
                else {
                    springConfig = config;
                }

                const spring = new Spring(springConfig, {fromValue: fromValues[property], toValue: config.onExitToValue});
                
                spring.onUpdate((value) => {
                    if(!existingUpdate){
                        existingUpdate = {
                            values: {}
                        };
                    }

                    existingUpdate.values[property] = `${value}${getSuffix(configMap, property)}`;

                    if(!existingUpdate.scheduled){
                        existingUpdate.scheduled = Promise.resolve().then(() => {
                            reconciler(clone, {...lastStyle}, {...finalValues, ...existingUpdate.values});
                            existingUpdate = null;
                        });
                    }
                });

                springsActiveCount++;
                spring.onAtRest((value) => {
                    finalValues[property] = `${value}${getSuffix(configMap, property)}`;

                    spring.end();
                    springsActiveCount--;
                    if(springsActiveCount === 0) clone.remove();
                });
            }
        }
     }

     const DOMElement: any = SpringyDOMElement;
     return forwardRef((props, ref) => <DOMElement {...props} forwardedRef={ref} />);
}

/*
    only render children on the first render
*/
class SecondRenderGuard extends React.Component {
    shouldComponentUpdate(nextProps){
        return !nextProps.isSecondRender;
    }

    render() {
        return this.props.children;
    }

}