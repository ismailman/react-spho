import React from 'react';

import {AbstractChildRegisterProviderClass} from './childRegisterContext';
import SpringyDOMElement from '../SpringyDOMElement';
import { arrayOf } from 'prop-types';
 
type RepeaterConfig = {
    from: number;
    to: number;
};

type Props = {
    springyRepeaterStyles: {[key: string]: RepeaterConfig}
    direction: 'from-beginning-each-time' | 'back-and-forth';
    delayStartBetweenChildren?: number;
    normalizeToZeroAndOne?: boolean;
};

function wait(time: number) {
    return new Promise(resolve => setTimeout(resolve, time));
}

export default class SpringyRepeater extends AbstractChildRegisterProviderClass<Props> {
    static defaultProps = {
        normalizeToZeroAndOne: false,
        direction: 'back-and-forth'
    };

    _nodesBeingRepeater: Set<SpringyDOMElement> = new Set();
    _unregisterFunctions: Map<SpringyDOMElement, Array<Function>> = new Map();

    componentDidMount() {
        this._setupRepeaters();
    }

    componentWillUnmount() {
        this._unregisterFunctions.forEach((functions) => functions.forEach(fn => fn()));
    }

    unregisterChild(child: SpringyDOMElement) {
        super.unregisterChild(child);
        const unregisterFunctions = this._unregisterFunctions.get(child);
        if(unregisterFunctions){
            unregisterFunctions.forEach(fn => fn());
            this._unregisterFunctions.delete(child);
        }
    }

    async _setupRepeaters() {
        const children = this.getOrderedChildrenAsFlatArray();
        
        for(let child of children) {
            if(this._nodesBeingRepeater.has(child)) return;
            this._nodesBeingRepeater.add(child);

            if(this.props.delayStartBetweenChildren != null) {
                await wait(this.props.delayStartBetweenChildren);
                if(!this._nodesBeingRepeater.has(child)) {
                    return; //make sure it wasn't removed while waiting
                }
            }

            for(let property in this.props.springyRepeaterStyles) {
                const config = this.props.springyRepeaterStyles[property];

                this._setupRepeaterSpring(property, config, child);
            }
        }        
    }

    _setupRepeaterSpring(property: string, config: RepeaterConfig, child: SpringyDOMElement) {
        const unregisterFunctions = this._unregisterFunctions.get(child) || [];
        this._unregisterFunctions.set(child, unregisterFunctions);

        let configOrigin = config.from;
        let configTarget = config.to;
        let origin = this.props.normalizeToZeroAndOne ? 0 : configOrigin;
        let target = this.props.normalizeToZeroAndOne ? 1 : configTarget;
        let isTargetBiggerThanOrigin = target - origin > 0;

        const mapper = this.props.normalizeToZeroAndOne === false ?
            undefined :  
            (value: number) => {
                return (configTarget-configOrigin) * value + configOrigin;
            };

        child.setSpringToValueForProperty(property, target, origin, mapper);
        const spring = child.getSpringForProperty(property);
        if(!spring) throw new Error('spring should have been created');

        unregisterFunctions.push(
            spring.onUpdate((value) => {
                if(isTargetBiggerThanOrigin ? value >= target : value <= target) {
                    if(this.props.direction === 'from-beginning-each-time') {
                        child.setSpringToValueForProperty(property, target, origin);
                    }
                    else {
                        //swap target and origin
                        let temp = origin;
                        origin = target;
                        target = temp;

                        isTargetBiggerThanOrigin = target - origin > 0;
                        child.setSpringToValueForProperty(property, target);
                    }
                }
            })
        );

    }
}