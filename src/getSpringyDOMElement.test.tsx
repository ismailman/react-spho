import React from 'react';
import ReactDOM from 'react-dom';

import 'jest-dom/extend-expect';

import {
    resetBodyAndGetAppDiv,
    runNumberOfFramesForward
} from './helpers/testHelpers';

import getSpringyDOMElement from './getSpringyDOMElement';
import SpringyDOMElement from './SpringyDOMElement';

describe('basics', () => {

    it('can render a div', async () => {

        const div = resetBodyAndGetAppDiv();
        const SpringyDiv = getSpringyDOMElement('div');

        ReactDOM.render(
            <SpringyDiv>
                Hello World
            </SpringyDiv>,
            div
        );

        expect(div).toHaveTextContent('Hello World');

    });

    it('value changes over time', async () => {
        const div = resetBodyAndGetAppDiv();
        const SpringyDiv = getSpringyDOMElement('div');

        ReactDOM.render(
            <SpringyDiv springyStyle={{left: 10}} />,
            div
        );

        const testDiv = div.querySelector('div');

        await runNumberOfFramesForward(1);

        expect(testDiv.style.left).toBe('10px');

        ReactDOM.render(
            <SpringyDiv springyStyle={{left: 20}} />,
            div
        );

        await runNumberOfFramesForward(2);
        expect(testDiv.style.left).not.toBe('10px');

        await runNumberOfFramesForward(100);
        expect(testDiv.style.left).toBe('20px');
    });

    it('multiple values are updated', async () => {
        const div = resetBodyAndGetAppDiv();
        const SpringyDiv = getSpringyDOMElement('div');

        ReactDOM.render(
            <SpringyDiv springyStyle={{left: 10, top: 10}} />,
            div
        );

        const testDiv = div.querySelector('div');

        await runNumberOfFramesForward(1);

        expect(testDiv.style.left).toBe('10px');
        expect(testDiv.style.top).toBe('10px');

        ReactDOM.render(
            <SpringyDiv springyStyle={{left: 20, top: 20}} />,
            div
        );

        await runNumberOfFramesForward(2);
        expect(testDiv.style.left).not.toBe('10px');
        expect(testDiv.style.top).not.toBe('10px');

        await runNumberOfFramesForward(100);
        expect(testDiv.style.left).toBe('20px');
        expect(testDiv.style.top).toBe('20px');
    });

    it('can have springy styles and regular styles and other props', async () => {
        const div = resetBodyAndGetAppDiv();
        const SpringyDiv = getSpringyDOMElement('div');

        ReactDOM.render(
            <SpringyDiv 
                springyStyle={{left: 10}} 
                style={{width: '10px'}}
                tabIndex={1}
            />,
            div
        );

        const testDiv = div.querySelector('div');
        await runNumberOfFramesForward(1);

        expect(testDiv.style.left).toBe('10px');
        expect(testDiv.style.width).toBe('10px');
        expect(testDiv.tabIndex).toBe(1);
    });

    it('ref is properly forwarded', async () => {
        const div = resetBodyAndGetAppDiv();
        const SpringyDiv = getSpringyDOMElement('div');

        let refDiv;
        ReactDOM.render(
            <SpringyDiv 
                ref={ref => refDiv = ref}
            />,
            div
        );

        const testDiv = div.querySelector('div');
        expect(testDiv).toBe(refDiv);
    });

    it('instanceRef is a SpringyDOMElement instance', async () => {
        const div = resetBodyAndGetAppDiv();
        const SpringyDiv = getSpringyDOMElement('div');

        let instanceRef;
        ReactDOM.render(
            <SpringyDiv 
                instanceRef={ref => instanceRef = ref}
            />,
            div
        );

        expect(instanceRef).toBeInstanceOf(SpringyDOMElement);
    });

    it('calls property update listener', async () => {

        const div = resetBodyAndGetAppDiv();
        const SpringyDiv = getSpringyDOMElement('div');
        const spy = jest.fn();

        ReactDOM.render(
            <SpringyDiv 
                onSpringyPropertyValueUpdate={spy}
                springyStyle={{left: 10}}
            />,
            div
        );

        await runNumberOfFramesForward(1);

        ReactDOM.render(
            <SpringyDiv 
                onSpringyPropertyValueUpdate={spy}
                springyStyle={{left: 20}}
            />,
            div
        );

        await runNumberOfFramesForward(1);
        expect(spy).toHaveBeenCalled();
        expect(spy.mock.calls[0][0]).toBe('left');

    });

    it('calls onRest listener', async () => {

        const div = resetBodyAndGetAppDiv();
        const SpringyDiv = getSpringyDOMElement('div');
        const spy = jest.fn();

        ReactDOM.render(
            <SpringyDiv 
                onSpringyPropertyValueAtRest={spy}
                springyStyle={{left: 10}}
            />,
            div
        );

        await runNumberOfFramesForward(1);

        ReactDOM.render(
            <SpringyDiv 
                onSpringyPropertyValueAtRest={spy}
                springyStyle={{left: 20}}
            />,
            div
        );

        await runNumberOfFramesForward(100);
        expect(spy).toHaveBeenCalled();
        expect(spy.mock.calls[0][0]).toBe('left');
        expect(spy.mock.calls[0][1]).toBe(20);

    });

});