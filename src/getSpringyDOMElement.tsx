import React, {forwardRef, useEffect, useLayoutEffect, useRef} from 'react';
import Spring, {SpringConfig, SpringValueListener} from 'simple-performant-harmonic-oscillator';

import {SpringyComponentPropertyConfig, SPHOProps} from './getSpringyComponent';
import handleForwardedRef from './handleForwardedRef';
import {TRANSFORM_PROPERTIES, AUTO_PROPERTIES, RESIZE_PROPERTIES, DEFAULT_UNIT_SUFFIXES} from './domStyleProperties';
import reconciler from './reconciler';

export type DOMSpringConfigMap = {
    [key:string]: SpringyComponentPropertyConfig&{
        initialFromValueOffset?: number;
        initialFromValue?: number;
        unitSuffix?: string;
    };
}

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
            if(springyStyle){
                delete cleanProps.springyStyle;

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
                springyStyle[property] = parseFloat(computedStyle[property]); //use target value for mutable prop
            });
            clone.insertAdjacentElement('beforebegin', this._ref);
            clone.remove();
        }

        _setupOrUpdateSpringForProperty(property, propValue) {
            if(propValue == 'auto') return;

            let spring = this._springMap.get(property);

            // spring has already been initialized and we're just updating value
            if(spring != null){
                if(propValue == null){
                    throw new Error(`Specified a null/undefined value for ${property}. If you want to remove the spring for this property then don't include the property as a key in springyConfig at all`);
                }
                else {
                    if(configMap[property] && configMap[property].configWhenGettingBigger && propValue > spring.getToValue()){
                        spring.setBounciness(configMap[property].configWhenGettingBigger.bounciness);
                        spring.setSpeed(configMap[property].configWhenGettingBigger.speed);
                    }
                    else if(configMap[property] && configMap[property].configWhenGettingSmaller && propValue < spring.getToValue()){
                        spring.setBounciness(configMap[property].configWhenGettingSmaller.bounciness);
                        spring.setSpeed(configMap[property].configWhenGettingSmaller.speed);
                    }
                }
                spring.setToValue(propValue);
                return;
            }
            
            // we don't have an initial prop value, then don't setup spring
            if(propValue == null){
                return;
            }

            let fromValue, toValue, config;

            if(configMap[property]){
                fromValue = 
                    configMap[property].initialFromValue != null ?
                        configMap[property].initialFromValue :
                    configMap[property].initialFromValueOffset == null ? 
                        propValue :
                        propValue + configMap[property].initialFromValueOffset;

                toValue = propValue;

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

            const suffix = 
                configMap && configMap[property] && configMap[property].unitSuffix ?
                    configMap[property].unitSuffix :
                    DEFAULT_UNIT_SUFFIXES[property];

            existingUpdate.values[property] = `${value}${suffix}`;
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