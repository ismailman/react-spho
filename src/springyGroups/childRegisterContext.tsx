import React from 'react';
import SpringyDOMElement from '../SpringyDOMElement';

export const ChildRegisterContext = React.createContext({
    registerChild: (child: SpringyDOMElement) => void 0,
    unregisterChild: (child: SpringyDOMElement) => void 0,
    registerChildIndex: (child: SpringyDOMElement, index: number) => void 0,
    unregisterChildIndex: (child: SpringyDOMElement, index: number) => void 0
});

export class AbstractChildRegisterProviderClass<T> extends React.PureComponent<T> {

    static contextType = ChildRegisterContext;
    _registeredChildren: Array<SpringyDOMElement> = [];
    _orderedChildrenGroups: Array<Array<SpringyDOMElement>> = [];

    registerChild(child: SpringyDOMElement) {
        if(this._registeredChildren.indexOf(child) === -1) this._registeredChildren.push(child);
        if(this.context) this.context.registerChild(child);
    }

    unregisterChild(child: SpringyDOMElement) {
        const index = this._registeredChildren.indexOf(child);
        if(index > -1){
            this._registeredChildren[index] = this._registeredChildren[this._registeredChildren.length - 1];
            this._registeredChildren.pop();
        }
        
        if(this.context) this.context.unregisterChild(child);
    }

    registerChildIndex(child: SpringyDOMElement, index: number) {
        const childrenAtIndex = this._orderedChildrenGroups[index] || [];
        childrenAtIndex.push(child);
        this._orderedChildrenGroups[index] = childrenAtIndex;
        if(this.context) this.context.registerChildIndex(child, index);
    }

    unregisterChildIndex(child: SpringyDOMElement,  index: number) {
        const childrenAtIndex = this._orderedChildrenGroups[index];
        if(childrenAtIndex) {
            const childIndex = childrenAtIndex.indexOf(child);
            if(childIndex > -1){
                childrenAtIndex[childIndex] = childrenAtIndex[childrenAtIndex.length - 1];
                childrenAtIndex.pop();
            }
        }

        if(this.context) this.context.unregisterChildIndex(child, index);
    }

    render(): React.ReactNode {
        return (
            <ChildRegisterContext.Provider value={this}>
                {this.props.children}
            </ChildRegisterContext.Provider>
        );
    }

}