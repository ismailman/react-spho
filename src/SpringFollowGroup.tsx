import React from 'react';

import {AbstractChildRegisterProviderClass} from './childRegisterContext';

function once(fn) {
    let hasBeenCalled = false;
    return () => {
        if(hasBeenCalled) return;
        hasBeenCalled = true;
        fn();
    };
}

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

        let numActive = 0;
        let removalQueue = [];
        for(let propertyConfig of this.props.properties) {
            const offset = 
                typeof propertyConfig === 'string' ?
                    0 : propertyConfig.offset;

            const property = 
                typeof propertyConfig === 'string' ?
                    propertyConfig : propertyConfig.property;

            let lastChild = null;
            
            this._orderedChildrenGroups.filter(Boolean).forEach(childGroup => {
                childGroup.forEach((child, index) => {
                    const isExiting = Boolean(child._transitionOutCloneElement);
                    if(lastChild != null){
                        const parentSpring = lastChild._springMap.get(property);
                        if(parentSpring) {
                            this._unregisterFunctions.push(
                                parentSpring.onUpdate(value => {
                                    child._setupOrUpdateSpringForProperty(property, value + offset);
                                })
                            );
                            
                            if(isExiting) {
                                const childSpring = child._springMap.get(property);
                                if(childSpring) {
                                    const unblock = childSpring.blockSpringFromResting();
                                    this._unregisterFunctions.push(unblock);

                                    this._unregisterFunctions.push(
                                        parentSpring.onAtRest(() => unblock())
                                    );
                                }
                            }
                        }
                    }
                    
                    if(index === 0) lastChild = child;

                    if(isExiting) {
                        const childSpring = child._springMap.get(property);
                        if(childSpring) {
                            const unblockRemoval = child.blockRemoval();
                            this._unregisterFunctions.push(unblockRemoval);
                            numActive++;
                            const remove = once(() => {
                                removalQueue.push(unblockRemoval);
                                numActive--;
                                if(numActive === 0) {
                                    removalQueue.forEach(fn => fn());
                                }
                            });

                            this._unregisterFunctions.push(childSpring.onAtRest(remove));
                            this._unregisterFunctions.push(childSpring.onEnd(remove));
                        }
                    }
                });
            });
        }
    }

    _unregisterListeners(){
        this._unregisterFunctions.forEach(fn => fn());
        this._unregisterFunctions = [];
    }

}