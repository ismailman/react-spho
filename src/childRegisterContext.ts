import {createContext, PureComponent} from 'react';

export const ChildRegisterContext = createContext({
    registerChild: (child: React.ReactNode) => void 0,
    unregisterChild: (child: React.ReactNode) => void 0
});

export class AbstractChildRegisterProviderClass extends PureComponent {

    static contextType = ChildRegisterContext;
    _registeredChildren: Set<React.ReactNode> = new Set();

    registerChild(child) {
        this._registeredChildren.add(child);
        if(this.context) this.context.registerChild(child);
    };

    unregisterChild(child) {
        this._registeredChildren.delete(child);
        if(this.context) this.context.unregisterChild(child);
    };

}