import {AbstractChildRegisterProviderClass} from './childRegisterContext';
import SpringyDOMElement from './SpringyDOMElement';
 
export default class SpringyRepositionGroup extends AbstractChildRegisterProviderClass<{}> {
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

    componentDidUpdate(prevProps, prevState, offsetValues: Map<SpringyDOMElement, {top: number, left: number}>) {
        if(!offsetValues) return;
        this._registeredChildren.forEach((node: any) => {
            const ref = node._ref;
            if(!ref || !offsetValues.get(node)) return;

            const newOffsetTop = ref.offsetTop;
            const newOffsetLeft = ref.offsetLeft;

            const translateXSpring = node._springMap.get('translateX');
            const existingTranslateXTarget = 
                translateXSpring ? translateXSpring.getToValue() : 0;
            const currentTranslateXValue =
                translateXSpring ? translateXSpring.getCurrentValue() : 0;

            const translateYSpring = node._springMap.get('translateY');
            const existingTranslateYTarget = 
                    translateYSpring ? translateYSpring.getToValue() : 0;
            const currentTranslateYValue =
                    translateYSpring ? translateYSpring.getCurrentValue() : 0;

            node._setupOrUpdateSpringForProperty('translateX', existingTranslateXTarget, currentTranslateXValue + offsetValues.get(node).left - newOffsetLeft);
            node._setupOrUpdateSpringForProperty('translateY', existingTranslateYTarget, currentTranslateYValue + offsetValues.get(node).top - newOffsetTop);
        });
    }

}