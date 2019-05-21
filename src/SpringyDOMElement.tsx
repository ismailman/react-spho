import React from 'react';
import Spring from 'simple-performant-harmonic-oscillator';
import decomposeDOMMatrix from 'decompose-dommatrix';

import {InternalSpringyProps} from './types';

import {TRANSFORM_PROPERTIES, AUTO_PROPERTIES, RESIZE_PROPERTIES} from './helpers/domStyleProperties';
import getConfig from './helpers/getConfig';
import getUnits from './helpers/getUnits';
import handleForwardedRef from './helpers/handleForwardedRef';
import reconciler from './helpers/reconciler';

import {ChildRegisterContext} from './springyGroups/childRegisterContext';

type ReconcileScheduler = {
    values: {[key: string]: string};
    scheduled?: Promise<void> | null;
};

type CustomValueMapper = (value: number) => number;

const springyDOMMap: Map<string, SpringyDOMElement> = new Map();

export default class SpringyDOMElement extends React.PureComponent<InternalSpringyProps> {

    static contextType = ChildRegisterContext;

    _reconcileUpdate: ReconcileScheduler = {values: {}};
    _ref: HTMLElement | null = null;
    _resizeObserver: ResizeObserver | null = null;
    _isSecondRender: boolean = false;
    _needsSecondRender: boolean = false;
    _springMap: Map<string, Spring> = new Map();
    _removalBlocked: boolean = false;
    _transitionOutCloneElement: HTMLElement | null = null;

    render() {
        const cleanProps = {...this.props} as any;
        delete (cleanProps as any).forwardedRef;
        delete (cleanProps as any).ComponentToWrap;
        delete (cleanProps as any).configMap;
        delete (cleanProps as any).styleOnExit;
        delete (cleanProps as any).globalUniqueIDForSpringReuse;
        delete (cleanProps as any).onSpringyPropertyValueAtRest;
        delete (cleanProps as any).onSpringyPropertyValueUpdate;
        delete (cleanProps as any).springyOrderedIndex;
        delete (cleanProps as any).springyStyle;
        delete (cleanProps as any).instanceRef;

        if(this.props.globalUniqueIDForSpringReuse){
            this._checkAndTakeOverExistingSpringyDOM(this.props.globalUniqueIDForSpringReuse);
        }

        this._processSpringyStyle();

        const ComponentToWrap = this.props.ComponentToWrap;

        return (
            <ComponentToWrap
                {...cleanProps}
                ref={ref => {
                    this._ref = ref;
                    handleForwardedRef(ref, this.props.forwardedRef)
                    if(this.props.instanceRef){
                        handleForwardedRef(this, this.props.instanceRef);
                    }
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
        if(this.context) {
            this.context.registerChild(this);
            if(this.props.springyOrderedIndex != null){
                this.context.registerChildIndex(this, this.props.springyOrderedIndex);
            }
        }
        if(!this._isSecondRender && this._needsSecondRender){
            this._rerenderToUseTrueSize();
        }
    }

    componentDidUpdate(prevProps: InternalSpringyProps){
        if(this.context){
            if(prevProps.springyOrderedIndex !== null && prevProps.springyOrderedIndex != this.props.springyOrderedIndex){
                this.context.unregisterChildIndex(this, prevProps.springyOrderedIndex);

                if(this.props.springyOrderedIndex != null) {
                    this.context.registerChildIndex(this, this.props.springyOrderedIndex);
                }
            }
        }

        if(!this._isSecondRender && this._needsSecondRender){
            this._rerenderToUseTrueSize();
        }
    }

    componentWillUnmount() {
        this._killResizeObserver();

        this._handleOnExitIfExists();
    }

    blockRemoval() {
        this._removalBlocked = true;
        return () => {
            this._removalBlocked = false;
            if(this._springMap.size === 0 && this._transitionOutCloneElement){
                this._transitionOutCloneElement.remove();
                if(this.props.globalUniqueIDForSpringReuse && springyDOMMap.get(this.props.globalUniqueIDForSpringReuse) === this) {
                    springyDOMMap.delete(this.props.globalUniqueIDForSpringReuse);
                }
            }
        }
    }

    getSpringForProperty(property: string): Spring | null {
        return this._springMap.get(property);
    }

    isUnmounting(): boolean {
        return Boolean(this._transitionOutCloneElement);
    }

    setSpringToValueForProperty(property: string, toValue: number | 'auto', overridingFromValue?: number, customValueMapper?: CustomValueMapper) {
        this._setupOrUpdateSpringForProperty(property, toValue, overridingFromValue);

        if(customValueMapper) {
            const spring = this.getSpringForProperty(property);
            if(!spring) throw new Error('spring should have been created');
            spring.setValueMapper(customValueMapper);
        }
    }

    getDOMNode(): HTMLElement | null {
        return this._ref;
    }

    _checkAndTakeOverExistingSpringyDOM(globalUniqueIDForSpringReuse) {
        const existingSpringyDOM = springyDOMMap.get(globalUniqueIDForSpringReuse);
        if(existingSpringyDOM) {
            const springMap = existingSpringyDOM._springMap;
            if(springMap) {
                for(let [property, spring] of springMap) {
                    const springClone = spring.clone();
                    spring.end();

                    this._listenToSpring(springClone, property);
                }
            }

            if(existingSpringyDOM._transitionOutCloneElement) existingSpringyDOM._transitionOutCloneElement.remove();
        }
        
        springyDOMMap.set(globalUniqueIDForSpringReuse, this);
    }

    _processSpringyStyle() {
        let springyStyle = this.props.springyStyle;
        const configMap = this.props.configMap;
        if(!springyStyle && !configMap) {
            this._killResizeObserver();
            return;
        }
        
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

        this._dealWithPotentialResizeObserver(springyStyle);
        this._flipAutoPropsIfNecessary(springyStyle);

        for(let property in springyStyle){
            this._setupOrUpdateSpringForProperty(property, springyStyle[property]);
        }
    }

    _flipAutoPropsIfNecessary(springyStyle: {[key: string]: number | 'auto'}) {
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

        if(!this._ref) return;

        // apply latest styles
        reconciler(this._ref, {...(this.props as any).style}, springyStyle);

        // get the computed styles and clean up
        const computedStyle = getComputedStyle(this._ref);
        propsThatAreAuto.forEach(property => {
            springyStyle[property] = parseFloat(computedStyle.getPropertyValue(property)); //use target value for mutable prop
        });
    }

    _setupOrUpdateSpringForProperty(property: string, propValue: number | 'auto', overridingFromValue?: number) {
        if(propValue == 'auto') return;

        const configMap = this.props.configMap;
        let spring = this._springMap.get(property);

        const toValue = 
            propValue != null ?
                propValue :
                configMap && configMap[property] && configMap[property].onEnterToValue;

        // we don't have a target toValue, then don't do anything
        if(toValue == null || typeof toValue === 'string') return null;

        // spring has already been initialized and we're just updating values
        if(spring != null){
            if(configMap){
                const config = getConfig(configMap[property], spring.getToValue(), toValue);
                spring.setBounciness(config.bounciness);
                spring.setSpeed(config.speed);
            }
            
            spring.setToValue(propValue);
            if(overridingFromValue != null) spring.setCurrentValue(overridingFromValue);
        }
        else {
            const fromValue = 
                overridingFromValue != null ? overridingFromValue : //if we have an overridingFromValue use that
                configMap == null || configMap[property] == null ? propValue : // if we don't have a then use propValue
                configMap[property].onEnterFromValue != null ? configMap[property].onEnterFromValue : // if we have an onEnterFromValue use that
                configMap[property].onEnterFromValueOffset != null ? // if have an onEnterFromValueOffset use that
                    propValue + configMap[property].onEnterFromValueOffset : propValue;  // use propValue

            spring = new Spring(
                configMap ? getConfig(configMap[property], fromValue, toValue) : {},
                {fromValue, toValue}
            );

            this._listenToSpring(spring, property);

            if(fromValue === toValue) {
                this._updateValueForProperty(property, toValue);
            }
        }
    }

    _listenToSpring(spring: Spring, property: string) {
        spring.onUpdate((value: number) => {
            this._updateValueForProperty(property, value);
            if(this.props.onSpringyPropertyValueUpdate) this.props.onSpringyPropertyValueUpdate(property, value);
        });

        spring.onAtRest((value: number) => {
            if(this.props.onSpringyPropertyValueAtRest) this.props.onSpringyPropertyValueAtRest(property, value);
        });

        this._springMap.set(property, spring);
    }

    _updateValueForProperty(property: string, value: number) {
        this._reconcileUpdate.values[property] = `${value}${getUnits(this.props.configMap, property)}`;

        if(!this._reconcileUpdate.scheduled){
            this._reconcileUpdate.scheduled = Promise.resolve().then(() => {
                reconciler(this._ref, {...(this.props as any).style}, this._reconcileUpdate.values);
                this._reconcileUpdate.scheduled = null;
            })
        }
    }

    _dealWithPotentialResizeObserver(springyStyle: {[key: string]: number | 'auto'}){
        if(!this._ref) return;
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

        if((window as any).ResizeObserver){
            this._resizeObserver = new (window as any).ResizeObserver(entries => {
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
        const configMap = this.props.configMap;
        if(!configMap || !this._ref) return;
        const propertiesWithOnExitToValue = Object.keys(configMap).filter(property => configMap[property].onExitToValue != null);

        if(propertiesWithOnExitToValue.length === 0) {
            this._cleanUpSprings();
            return;
        }

        const lastStyle = {...(this.props as any).style};

        const clone = this._transitionOutCloneElement = this._ref.cloneNode(true) as HTMLElement; //true = deep clone
        clone.style.pointerEvents = 'none';
        this._ref.insertAdjacentElement('beforebegin', clone);
        this._ref.remove();

        const fromValues = {};
        const propertiesWithOnExitFromValue = propertiesWithOnExitToValue.filter(property => configMap[property].onExitFromValue != null);
        const propertiesWithoutOnExitFromValue = propertiesWithOnExitToValue.filter(property => configMap[property].onExitFromValue == null);

        propertiesWithOnExitFromValue.forEach(property => {
            fromValues[property] = configMap[property].onExitFromValue;
        });

        const computedStyle = getComputedStyle(clone);
        //we set width and height to computed value because we're make make the element
        // position absolute which may change height and width
        clone.style.width = computedStyle.getPropertyValue('width');
        clone.style.height = computedStyle.getPropertyValue('height');

        if(this.props.styleOnExit) {
            let styleOnExit = this.props.styleOnExit;
            if(typeof styleOnExit === 'function') {
                styleOnExit = (styleOnExit as any)(clone);
            }
            
            reconciler(clone, lastStyle, styleOnExit);
        }

        propertiesWithoutOnExitFromValue.filter(property => !TRANSFORM_PROPERTIES.includes(property)).forEach(property => {
            fromValues[property] = parseFloat(computedStyle.getPropertyValue(property)); //use target value for mutable prop
        });

        const transformPropertiesWithOnExitValue = propertiesWithoutOnExitFromValue.filter(property => TRANSFORM_PROPERTIES.includes(property));
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

        let existingUpdate: ReconcileScheduler = {values: {}};
        for(let property of propertiesWithOnExitToValue) {
            const config =  configMap[property];
            const springConfig = getConfig(config, fromValues[property], config.onExitToValue);
            const spring = new Spring(springConfig, {fromValue: fromValues[property], toValue: config.onExitToValue});
            this._springMap.set(property, spring);
            
            spring.onUpdate((value) => {
                existingUpdate.values[property] = `${value}${getUnits(configMap, property)}`;

                if(!existingUpdate.scheduled){
                    existingUpdate.scheduled = Promise.resolve().then(() => {
                        reconciler(clone, lastStyle, existingUpdate.values);
                        existingUpdate.scheduled = null;
                    });
                }
            });

            const cleanUp = () => {
                this._springMap.delete(property);
                spring.end();
                if(this._springMap.size === 0) {
                    if(!this._removalBlocked){
                        clone.remove();
                        if(this.props.globalUniqueIDForSpringReuse && springyDOMMap.get(this.props.globalUniqueIDForSpringReuse) === this) {
                            springyDOMMap.delete(this.props.globalUniqueIDForSpringReuse);
                        }
                    }
                    
                    this._cleanUpSprings();
                }
            };

            spring.onAtRest(cleanUp);
            spring.onEnd(cleanUp);
        }
    }

    _cleanUpSprings() {
        for(let spring of this._springMap.values()) {
            spring.end();
        }
        this._springMap.clear();

        if(this.context) {
            this.context.unregisterChild(this);
            if(this.props.springyOrderedIndex != null){
                this.context.unregisterChildIndex(this, this.props.springyOrderedIndex);
            }
        }
    }
 }

 /*
    only render children on the first render
*/
class SecondRenderGuard extends React.Component<{isSecondRender: boolean}> {
    shouldComponentUpdate(nextProps){
        return !nextProps.isSecondRender;
    }

    render() {
        return this.props.children;
    }

}