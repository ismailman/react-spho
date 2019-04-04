import React, {forwardRef} from 'react';
import Spring, {SpringConfig, SpringValueListener} from 'simple-performant-harmonic-oscillator';
import handleForwardedRef from './handleForwardedRef';

export type SpringyComponentPropertyConfig = SpringConfig | {
    configWhenGettingBigger: SpringConfig;
    configWhenGettingSmaller: SpringConfig;
};

export type SpringConfigMap = {
    [key:string]: SpringyComponentPropertyConfig&{
        initialFromValueOffset?: number;
        initialFromValue?: number;
    };
}

export interface SPHOProps {
    onSPHOValueUpdate?: (property: string, value: number) => void;
    onSPHOValueAtRest?: (property: string, value: number) => void;
    forwardedRef: any;
};

export default function getSpringyComponent<T extends object>(configMap: SpringConfigMap, ComponentToWrap: any) {

    const springyProperties = Object.keys(configMap);

    class SpringyComponent extends React.PureComponent {

        _springMap: Map<string, Spring> = new Map();
        _ref: any;

        constructor(props){
            super(props);
        }

        _setupOrUpdateSpringForProperty(property, propValue) {
            if(isNaN(propValue)) return;

            let spring = this._springMap.get(property);

            // spring has already been initialized and we're just updating value
            if(spring != null){
                if(propValue == null){
                    // we no longer want to set or update this prop
                    spring.end();
                    this._springMap.delete(property);
                }
                else {
                    if(configMap[property].configWhenGettingBigger && propValue > spring.getToValue()){
                        spring.setBounciness(configMap[property].configWhenGettingBigger.bounciness);
                        spring.setSpeed(configMap[property].configWhenGettingBigger.speed);
                    }
                    else if(configMap[property].configWhenGettingSmaller && propValue < spring.getToValue()){
                        spring.setBounciness(configMap[property].configWhenGettingSmaller.bounciness);
                        spring.setSpeed(configMap[property].configWhenGettingSmaller.speed);
                    }
                }
                return;
            }
            
            // we don't have an initial prop value, then don't setup spring
            if(propValue == null){
                return;
            }

            const fromValue = 
                configMap[property].initialFromValue != null ?
                    configMap[property].initialFromValue :
                configMap[property].initialFromValueOffset == null ? 
                    propValue :
                    propValue + configMap[property].initialFromValueOffset;

            const toValue = propValue;

            let config;
            if(configMap[property].configWhenGettingBigger && toValue >= fromValue) {
                config = configMap[property].configWhenGettingBigger;
            }
            else if(configMap[property].configWhenGettingSmaller && toValue < fromValue) {
                config = configMap[property].configWhenGettingSmaller;
            }
            else {
                config = configMap[property];
            }

            spring = new Spring(
                config,
                {fromValue, toValue}
            );

            spring.onUpdate((value: number) => {
                if(this.props.onSPHOValueUpdate) this.props.onSPHOValueUpdate(property, value);
            });

            spring.onAtRest((value: number) => {
                if(this.props.onSPHOValueAtRest) this.props.onSPHOValueAtRest(property, value);
            });

            this._springMap.set(property, spring);
        }

        render() {
            const propsWithoutSpringyProperties = {...this.props};
            for(let property of springyProperties) {
                delete propsWithoutSpringyProperties[property];
                this._setupOrUpdateSpringForProperty(property, this.props[property]);
            }

            return (
                <ComponentToWrap 
                    ref={ref => {
                        handleForwardedRef(ref, this.props.forwardedRef);
                        this._ref = ref;
                    }}
                    {...propsWithoutSpringyProperties}
                />
    
            );
        }

        componentWillUnmount() {
            for(let spring of this._springMap.values()) {
                spring.end();
            }
        }

    }

    const SComponent: any = SpringyComponent;
    return forwardRef((props, ref) => <SComponent {...props} forwardedRef={ref} />);
}