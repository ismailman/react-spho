import React, {createContext, PureComponent} from 'react';

export const ChildRegisterContext = createContext({
    registerChild: (child: any) => void 0,
    unregisterChild: (child: any) => void 0
});

export class AbstractChildRegisterProviderClass extends PureComponent {

    static contextType = ChildRegisterContext;
    _registeredChildren: Set<any> = new Set();
    _orderedChildrenGroups: Array<any>;

    registerChild(child) {
        this._registeredChildren.add(child);
        if(this.context) this.context.registerChild(child);
    }

    unregisterChild(child) {
        this._registeredChildren.delete(child);
        if(this.context) this.context.unregisterChild(child);
    }

    registerChildIndex(child, index) {
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