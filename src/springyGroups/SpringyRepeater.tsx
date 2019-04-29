import {AbstractChildRegisterProviderClass} from './childRegisterContext';
import SpringyDOMElement from '../SpringyDOMElement';
 
type RepeaterConfig = {
    from: number;
    to: number;
    direction?: 'from-beginning-each-time' | 'back-and-forth';
};

type Props = {
    springyRepeaterStyles: {[key: string]: RepeaterConfig}
};

export default class SpringyRepeater extends AbstractChildRegisterProviderClass<Props> {
    _nodesBeingRepeater: Set<SpringyDOMElement> = new Set();
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
        const unregisterFunctions = this._unregisterFunctions.get(child);
        if(unregisterFunctions){
            unregisterFunctions.forEach(fn => fn());
            this._unregisterFunctions.delete(child);
        }
    }

    _setupRepeaters() {
        this._registeredChildren.forEach((child: SpringyDOMElement) => {
            if(this._nodesBeingRepeater.has(child)) return;

            this._nodesBeingRepeater.add(child);

            for(let property in this.props.springyRepeaterStyles) {
                const config = this.props.springyRepeaterStyles[property];

                this._setupRepeaterSpring(property, config, child);
            }
        });
    }

    _setupRepeaterSpring(property: string, config: RepeaterConfig, child: SpringyDOMElement) {
        child.setSpringToValueForProperty(property, config.to, config.from);
        const spring = child.getSpringForProperty(property);

        if(!spring) throw new Error('spring should have been created');

        const unregisterFunctions = this._unregisterFunctions.get(child);
        let movingForward = true;
        unregisterFunctions.push(
            spring.onUpdate((value) => {
                const targetValue = movingForward ? config.to : config.from;
                if(value === targetValue){
                    if(config.direction === 'back-and-forth') {
                        movingForward = !movingForward;
                        const newTargetValue = movingForward ? config.to : config.from;
                        child.setSpringToValueForProperty(property, newTargetValue);
                    }
                    else {
                        child.setSpringToValueForProperty(property, config.to, config.from);
                    }
                }
            })
        );

        this._unregisterFunctions.set(child, unregisterFunctions);

    }
}