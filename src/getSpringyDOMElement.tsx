import React, {forwardRef, useEffect, useLayoutEffect, useRef} from 'react';
import getSpringyComponent, {SpringConfigMap, SPHOProps} from './getSpringyComponent';
import handleForwardedRef from './handleForwardedRef';
import {TRANSFORM_PROPERTIES, AUTO_PROPERTIES, RESIZE_PROPERTIES} from './domStyleProperties';
import reconciler from './reconciler';

export type DOMSpringConfigMap = {
    [key:string]: SpringConfigMap&{
        initialFromValueOffset?: number;
        initialFromValue?: number;
        unitSuffix?: string;
    };
}

export default function getSpringyDOMElement(configMap: DOMSpringConfigMap, ComponentToWrap: string){

     const SpringyComponent: any = getSpringyComponent(configMap, ComponentToWrap);    
     const propsThatAreSpringy = Object.keys(configMap);
     const springyPropsThatCanBeAuto = propsThatAreSpringy.filter(property => AUTO_PROPERTIES.includes(property));

     class SpringyDOMElement extends React.PureComponent {

        _reconcileUpdate;
        _ref;
        _isSecondRender: boolean = false;
        _needsSecondRender: boolean = false;
        _resizeObserver;

        render() {
            const propsWithoutForwardedRef = {...this.props};
            delete (propsWithoutForwardedRef as any).forwardedRef;

            this._flipAutoPropsIfNecessary(propsWithoutForwardedRef);

            return (                
                <SpringyComponent
                    {...propsWithoutForwardedRef}
                    onSPHOValueUpdate={(property, value) => {
                        this._updateSPHOValueForProperty(property, value);
                        if(this.props.onSPHOValueUpdate) this.props.onSPHOValueUpdate(property, value);
                    }}
                    ref={ref => {
                        this._ref = ref;
                        handleForwardedRef(ref, this.props.forwardedRef)
                    }}
                >
                    <SecondRenderGuard isSecondRender={this._isSecondRender}>
                        {this.props.children}
                    </SecondRenderGuard>
                </SpringyComponent>
                
            );
        }

        componentDidMount(){
            const resizableSpringyAutoProperties = springyPropsThatCanBeAuto.filter(property => RESIZE_PROPERTIES.includes(property));
            if(resizableSpringyAutoProperties.length === 0) return;

            if(window.ResizeObserver){
                this._resizeObserver = new ResizeObserver(entries => {
                    const propsThatAreAutoAndResizable = 
                        Object.keys(this.props)
                                .filter(
                                    property => 
                                        this.props[property] === 'auto' &&
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

        componentDidUpdate(){
            if(!this._isSecondRender && this._needsSecondRender){
                this._rerenderToUseTrueSize();
            }
        }

        componentWillUnmount() {
            if(this._resizeObserver) this._resizeObserver.disconnect();
        }

        _rerenderToUseTrueSize() {
            this._isSecondRender = true;
            this.forceUpdate(() => {
                this._needsSecondRender = false;
                this._isSecondRender = false;
            });
        }

        _updateSPHOValueForProperty(property, value) {
            let existingUpdate = this._reconcileUpdate;
            if(!existingUpdate){
                existingUpdate = {
                    scheduled: Promise.resolve().then(() => {
                        reconciler(this._ref, this.props, existingUpdate.values);
                        this._reconcileUpdate = null;
                    }),
                    values: {}
                };
                this._reconcileUpdate = existingUpdate;
            }

            existingUpdate.values[property] = configMap[property] && (configMap[property].unitSuffix != null) ?
                                                `${value}${configMap[property].unitSuffix}` :
                                                value;
        }

        _flipAutoPropsIfNecessary(mutableProps) {
            if (springyPropsThatCanBeAuto.length === 0) return;

            const propsThatAreAuto = 
                Object.keys(this.props)
                        .filter(
                            property => 
                                this.props[property] === 'auto' &&
                                springyPropsThatCanBeAuto.includes(property)
                        );

            if(propsThatAreAuto.length === 0) return;
            if(!this._isSecondRender) {
                this._needsSecondRender = true;
                return;
            }
            
            const targetValues =
                propsThatAreSpringy.reduce((acc, property) => {
                    acc[property] = this.props[property];
                    return acc;
                }, {});

            // generate clone and replace ref with clone so it has the exact same positioning and such
            const clone = this._ref.cloneNode(true); //true = deep clone
            this._ref.insertAdjacentElement('beforebegin', clone);
            this._ref.remove();

            // apply latest styles
            reconciler(clone, this.props, targetValues);
            propsThatAreAuto.forEach(property => clone.style[property] = 'auto');

            // get the computed styles and clean up
            const computedStyle = getComputedStyle(clone);
            propsThatAreAuto.forEach(property => {
                mutableProps[property] = parseFloat(computedStyle[property]); //use target value for mutable prop
            });
            clone.insertAdjacentElement('beforebegin', this._ref);
            clone.remove();
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