import {AbstractChildRegisterProviderClass} from './childRegisterContext';
import SpringyDOMElement from '../SpringyDOMElement';

function once(fn: Function) {
    let hasBeenCalled = false;
    return () => {
        if(hasBeenCalled) return;
        hasBeenCalled = true;
        fn();
    };
}

type PropertyConfig = {
    property: string;
    offset: number;
};

type Props = {
    properties: Array<string | PropertyConfig>
};

export default class SpringyFollowGroup extends AbstractChildRegisterProviderClass<Props> {

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

            let lastGroupChild: SpringyDOMElement | null = null;
            
            this._orderedChildrenGroups.filter(Boolean).forEach(childGroup => {
                childGroup.forEach((child, index) => {
                    const isUnmounting = child.isUnmounting();
                    if(lastGroupChild != null){
                        const parentSpring = lastGroupChild.getSpringForProperty(property);
                        if(parentSpring) {
                            // if the child already has a spring for the property then we don't
                            // override the from value
                            let childSpring = child.getSpringForProperty(property);
                            const overridingFrom = childSpring != null ? null : parentSpring.getCurrentValue() + offset;
                            child.setSpringToValueForProperty(property, parentSpring.getCurrentValue() + offset, overridingFrom);

                            this._unregisterFunctions.push(
                                parentSpring.onUpdate(value => {
                                    child.setSpringToValueForProperty(property, value + offset);
                                })
                            );
                            
                            if(isUnmounting) {
                                const childSpring = child.getSpringForProperty(property);
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
                    
                    if(index === childGroup.length - 1) lastGroupChild = child;

                    if(isUnmounting) {
                        const childSpring = child.getSpringForProperty(property);
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