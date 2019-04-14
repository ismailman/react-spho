import React from 'react';

import {AbstractChildRegisterProviderClass} from './childRegisterContext';

export default class SpringFollowGroup extends AbstractChildRegisterProviderClass {

    _unregisterFunctions = [];

    componentDidMount() {
        this._setupFollows();
    }

    componentDidUpdate() {
        this._setupFollows();
    }

    componentWillUnmount() {
        this._unregisterListeners();
    }

    _setupFollows() {
        this._unregisterListeners();

        for(let propertyConfig of this.props.properties) {
            const offset = 
                typeof propertyConfig === 'string' ?
                    0 : propertyConfig.offset;

            const property = 
                typeof propertyConfig === 'string' ?
                    propertyConfig : propertyConfig.property;

            let lastChild = null;
            
            this._orderedChildren.filter(Boolean).forEach(child => {
                if(lastChild != null){
                    const spring = lastChild._springMap.get(property);
                    if(spring) {
                        this._unregisterFunctions.push(
                            spring.onUpdate(value => {
                                child._setupOrUpdateSpringForProperty(property, value + offset);
                            })
                        );                        
                    }
                }
                lastChild = child;
            });
        }
    }

    _unregisterListeners(){
        this._unregisterFunctions.forEach(fn => fn());
        this._unregisterFunctions = [];
    }

}