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
    numberOfTimesToRepeat?: number | 'infinite';
};

function wait(time: number) {
    return new Promise(resolve => setTimeout(resolve, time));
}

export default class SpringyRepeater extends AbstractChildRegisterProviderClass<Props> {
    static defaultProps = {
        normalizeToZeroAndOne: false,
        direction: 'back-and-forth',
        numberOfTimesToRepeat: 'infinite'
    };

    _lastRenderTime: number = 0;
    _unregisterFunctions: Map<SpringyDOMElement, Array<Function>> = new Map();

    componentDidMount() {
        this._setupRepeaters();
    }

    componentDidUpdate() {
        this._setupRepeaters();
    }

    componentWillUnmount() {
        this._unregisterFunctions.forEach((functions) => functions.forEach(fn => fn()));
    }

    unregisterChild(child: SpringyDOMElement) {
        super.unregisterChild(child);
        this._unregisterListeners(child);
    }

    async _setupRepeaters() {
        const renderTime = this._lastRenderTime = Date.now();
        if(this._orderedChildrenGroups.length > 0) {
            for(let group of this._orderedChildrenGroups) {
                if(this.props.delayStartBetweenChildren != null) {
                    await wait(this.props.delayStartBetweenChildren);
                    if(renderTime !== this._lastRenderTime) return; // we had a render while waiting
                }
                
                for(let child of group) {
                    this._setupRepeaterForChild(child);
                }
            }
        }
        else {
            const children = [...this._registeredChildren];

            for(let child of children) {
                if(this.props.delayStartBetweenChildren != null) {
                    await wait(this.props.delayStartBetweenChildren);
                    if(renderTime !== this._lastRenderTime) return;
                }
                this._setupRepeaterForChild(child);
            }
        }
    }

    _setupRepeaterForChild(child: SpringyDOMElement) {
        this._unregisterListeners(child);
        for(let property in this.props.springyRepeaterStyles) {
            const config = this.props.springyRepeaterStyles[property];
            this._setupRepeaterSpring(property, config, child);
        }
    }

    _setupRepeaterSpring(property: string, config: RepeaterConfig, child: SpringyDOMElement) {
        const unregisterFunctions = this._unregisterFunctions.get(child) || [];
        this._unregisterFunctions.set(child, unregisterFunctions);


        if(this.props.normalizeToZeroAndOne){
            unregisterFunctions.push(this._setupNormalizedRepeaterSpring(property, config, child));
        }
        else {
            unregisterFunctions.push(this._setupRegularRepeaterSpring(property, config, child));
        }
    }

    _setupNormalizedRepeaterSpring(property: string, config: RepeaterConfig, child: SpringyDOMElement) {
        let configOrigin = config.from;
        let configTarget = config.to;
        let origin = 0;
        let target = 1;
        let isTargetBiggerThanOrigin = configTarget - configOrigin > 0;

        const mapper = (value: number) => {
            return (configTarget-configOrigin) * value + configOrigin;
        };

        child.setSpringToValueForProperty(property, target, origin, mapper);
        const spring = child.getSpringForProperty(property);
        if(!spring) throw new Error('spring should have been created');

        let numberOfRepeats = 0;
        return spring.onUpdate((value) => {
            if(isTargetBiggerThanOrigin ? value >= configTarget : value <= configTarget) {
                numberOfRepeats++;
                if(this.props.numberOfTimesToRepeat !== 'infinite' && numberOfRepeats > this.props.numberOfTimesToRepeat) {
                    return; //we are done
                }
                if(this.props.direction === 'from-beginning-each-time') {
                    child.setSpringToValueForProperty(property, target, origin);
                }
                else {
                    //swap target and origin                        
                    const temp = configTarget;
                    configTarget = configOrigin;
                    configOrigin = temp;

                    isTargetBiggerThanOrigin = configTarget - configOrigin > 0;
                    child.setSpringToValueForProperty(property, target, origin);
                }
            }
        });
    }

    _setupRegularRepeaterSpring(property: string, config: RepeaterConfig, child: SpringyDOMElement) {
        let origin = config.from;
        let target = config.to;
        let isTargetBiggerThanOrigin = target - origin > 0;

        child.setSpringToValueForProperty(property, target, origin);
        const spring = child.getSpringForProperty(property);
        if(!spring) throw new Error('spring should have been created');
        spring.unsetValueMapper();

        let numberOfRepeats = 0;
        return spring.onUpdate((value) => {
            if(isTargetBiggerThanOrigin ? value >= target : value <= target) {
                numberOfRepeats++;
                if(this.props.numberOfTimesToRepeat !== 'infinite' && numberOfRepeats > this.props.numberOfTimesToRepeat) {
                    return; //we are done
                }
                if(this.props.direction === 'from-beginning-each-time') {
                    child.setSpringToValueForProperty(property, target, origin);
                }
                else {
                    //swap target and origin
                    const temp = target;
                    target = origin;
                    origin = temp;
                    isTargetBiggerThanOrigin = target - origin > 0;
                    child.setSpringToValueForProperty(property, target);
                }
            }
        });
    }

    _unregisterListeners(child: SpringyDOMElement) {
        const unregisterFunctions = this._unregisterFunctions.get(child);
        if(unregisterFunctions){
            unregisterFunctions.forEach(fn => fn());
            this._unregisterFunctions.delete(child);
        }
    }
}