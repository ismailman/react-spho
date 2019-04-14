import React, {createContext, PureComponent} from 'react';

export const ChildRegisterContext = createContext({
    registerChild: (child: any) => void 0,
    unregisterChild: (child: any) => void 0
});

export class AbstractChildRegisterProviderClass extends PureComponent {

    static contextType = ChildRegisterContext;
    _registeredChildren: Set<any> = new Set();
    _orderedChildren: Array<any>;

    registerChild(child) {
        this._registeredChildren.add(child);
        if(this.context) this.context.registerChild(child);
    }

    unregisterChild(child) {
        this._registeredChildren.delete(child);
        if(this.context) this.context.unregisterChild(child);
    }

    registerChildIndex(child, index) {
        this._orderedChildren.splice(index, 0, child);
    }

    render(): React.ReactNode {
        this._orderedChildren = [];
        return (
            <ChildRegisterContext.Provider value={this}>
                {this.props.children}
            </ChildRegisterContext.Provider>
        );
    }

}