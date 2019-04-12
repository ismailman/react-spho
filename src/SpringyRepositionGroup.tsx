import React from 'react';

import {ChildRegisterContext, AbstractChildRegisterProviderClass} from './childRegisterContext';

type Point = {
    x: number;
    y: number;
};

export default class SpringyRepositionGroup extends AbstractChildRegisterProviderClass {
    render(): React.ReactNode {
        return (
            <ChildRegisterContext.Provider value={this}>
                {this.props.children}
            </ChildRegisterContext.Provider>
        );
    }

    getSnapshotBeforeUpdate() {
        const offsetValues = new Map();
        this._registeredChildren.forEach((node: any) => {
            const ref = node._ref;
            if(!ref) return;
            offsetValues.set(node, {
                top: ref.offsetTop,
                left: ref.offsetLeft
            });
        });

        return offsetValues;
    }

    componentDidUpdate(prevProps, prevState, offsetValues) {
        if(!offsetValues) return;
        this._registeredChildren.forEach((node: any) => {
            const ref = node._ref;
            if(!ref || !offsetValues.get(node)) return;

            const newOffsetTop = ref.offsetTop;
            const newOffsetLeft = ref.offsetLeft;

            node._setupOrUpdateSpringForProperty('translateX', 0, offsetValues.get(node).left - newOffsetLeft, 0);
            node._setupOrUpdateSpringForProperty('translateY', 0, offsetValues.get(node).top - newOffsetTop, 0);
        });
    }

}