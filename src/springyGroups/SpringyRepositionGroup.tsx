import {AbstractChildRegisterProviderClass} from './childRegisterContext';
import SpringyDOMElement from '../SpringyDOMElement';
 
export default class SpringyRepositionGroup extends AbstractChildRegisterProviderClass<{}> {
    getSnapshotBeforeUpdate() {
        const offsetValues = new Map();
        this._registeredChildren.forEach((node: any) => {
            const domNode = node.getDOMNode();
            if(!domNode) return;
            offsetValues.set(node, {
                top: domNode.offsetTop,
                left: domNode.offsetLeft
            });
        });

        return offsetValues;
    }

    componentDidUpdate(prevProps, prevState, offsetValues: Map<SpringyDOMElement, {top: number, left: number}>) {
        if(!offsetValues) return;
        this._registeredChildren.forEach((node: SpringyDOMElement) => {
            const domNode = node.getDOMNode();
            if(!domNode || !offsetValues.get(node)) return;

            const newOffsetTop = domNode.offsetTop;
            const newOffsetLeft = domNode.offsetLeft;

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

            node.setSpringToValueForProperty('translateX', existingTranslateXTarget, currentTranslateXValue + offsetValues.get(node).left - newOffsetLeft);
            node.setSpringToValueForProperty('translateY', existingTranslateYTarget, currentTranslateYValue + offsetValues.get(node).top - newOffsetTop);
        });
    }

}