import React, {createContext, PureComponent} from 'react';
import SpringyDOMElement from './SpringyDOMElement';

export const ChildRegisterContext = createContext({
    registerChild: (child: SpringyDOMElement) => void 0,
    unregisterChild: (child: SpringyDOMElement) => void 0
});

export class AbstractChildRegisterProviderClass<T> extends PureComponent<T> {

    static contextType = ChildRegisterContext;
    _registeredChildren: Set<SpringyDOMElement> = new Set();
    _orderedChildrenGroups: Array<Array<SpringyDOMElement>>;

    registerChild(child: SpringyDOMElement) {
        this._registeredChildren.add(child);
        if(this.context) this.context.registerChild(child);
    }

    unregisterChild(child: SpringyDOMElement) {
        this._registeredChildren.delete(child);
        if(this.context) this.context.unregisterChild(child);
    }

    registerChildIndex(child: SpringyDOMElement, index: number) {
        const childrenAtIndex = this._orderedChildrenGroups[index] || [];
        childrenAtIndex.push(child);
        this._orderedChildrenGroups[index] = childrenAtIndex;
    }

    render(): React.ReactNode {
        this._orderedChildrenGroups = [];
        return (
            <ChildRegisterContext.Provider value={this}>
                {this.props.children}
            </ChildRegisterContext.Provider>
        );
    }

}