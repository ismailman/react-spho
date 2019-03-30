import React, {forwardRef, useEffect, useLayoutEffect, useRef} from 'react';
import getSpringyComponent, {SpringConfigMap, SPHOProps} from './getSpringyComponent';
import handleForwardedRef from './handleForwardedRef';
import {TRANSFORM_PROPERTIES, AUTO_PROPERTIES} from './domStyleProperties';
import reconciler from './reconciler';

export default function getSpringyDOMElement(configMap: SpringConfigMap, ComponentToWrap: string){

     const SpringyComponent: any = getSpringyComponent(configMap, ComponentToWrap);    
     const propsThatAreSpringy = Object.keys(configMap);
     const springyPropsThatCanBeAuto = propsThatAreSpringy.filter(property => AUTO_PROPERTIES.includes(property));

     class SpringyDOMElement extends React.PureComponent {

        _reconcileUpdate;
        _ref;
        _lastProps;

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

            existingUpdate.values[property] = value;
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

            if(this._ref == null){
                //we're gonna need to render this element again unfortunately
                propsThatAreAuto.forEach(property => {
                    delete mutableProps[property];
                });

                // we do this display mangling to prevent a flash of unstyled stuff
                const oldDisplay = (mutableProps.style || {}).display || '';
                mutableProps.style = {
                    ...(mutableProps.style || {}),
                    display: 'none'
                };

                Promise.resolve().then(() => {
                    this._ref.style.display = oldDisplay;
                    this.forceUpdate();
                });

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
                />
            );
        }

        componentDidUpdate() {
            this._lastProps = this.props; //gross I know!!! but they got rid of componentWillReceiveProps so what can I do?
        }

     }

     const DOMElement: any = SpringyDOMElement;
     return forwardRef((props, ref) => <DOMElement {...props} forwardedRef={ref} />);

}