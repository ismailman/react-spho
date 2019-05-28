# React SPHO

The (hopefully) easiest to use animation library for React for interactive applications.

**Note: This is a dual license library. A free license is available for use in free open source projects. Commercial projects require a separate paid license.** The cost is not a lot (starts at $50 for small companies and goes up to $1000 for organizations with > $10M revenue per year) so don't let the paid portion prevent you from learning about the library.

Installation:

```bash
npm install @ismailman/react-spho
```

or 

```bash
yarn add @ismailman/react-spho
```

Quick example of how it works:

```typescript
// import the key function from the library
import {getSpringyDOMElement} from 'react-spho';

// create a "Springy" version of a div
const SpringyDiv = getSpringyDOMElement('div');


// Use the Springy version of the div inside of your component
// whenever the left prop is changed the SpringyDiv will automatically
// transition to the new left value over time in a springy/organic feeling way
function ExampleComponent({left, children}){

    return (
        <SpringyDiv springyStyle={{left}}>
            {children}
        </SpringyDiv>
    );

}
```

The main idea is that you create _Springy_ versions of regular DOM elements, and then any style property values you want to animate put those values in the `springyStyle` prop instead of the `style` prop. That's the basic usage.

## Important information about the springyStyle prop

The `springyStyle` prop is very similar to the standard `style` prop with some key differences, that should hopefully make springyStyle easier to use than regular style. Specifically:

- the values are only *numbers*, no *strings* (except for `auto` for certain style properties)
```typescript
// this is good
springyStyle={{
    left: 10,
    top: 20
}}

// this is bad
springyStyle={{
    left: '10px',
    top: '20px'
}}
```
- you don't set the `transform` property directly, instead the transform commands (`translate`, `translateX`, `scale`, `rotate`, ect) need to be set
```typescript
// this is good
springyStyle={{
    translateX: 10,
    rotateY: 30
}}

// this is bad
springyStyle={{
    transform: 'translateX(10px) rotateY(30deg)'
}}
```
- `auto` should "Just Work" for: `width`, `height`, `margin`, `top`, `right`, `bottom`, `left` - if in one render you specify one of those properties as a number, and then in anothe render you specify the property value as `'auto'` **React SPHO** will make sure that the value animates between the original value and the new auto value. This also works if you go from `'auto'` to an explicit value.

## Configuring Spring "Feel"

You configure the spring dynamics when you create the Springy version of your DOM element. You can't change the dynamics once they've been set.

```typescript
// create a new SpringyDiv where the translateX spring 
// will move a bit slower but have more bounce, and the 
// translateY spring will move faster but have no bounce
const SpringyDiv = getSpringyDOMElement('div', {
    translateX: {
        speed: 0.8,
        bounciness: 1.2
    },
    translateY: {
        speed: 1.5,
        bounciness: 0.5
    }
});
```

For the spring config specifically, other spring libraries will have you choose things like `mass`, `dampening`, `friction`, etc. I found that too confusing and so I tried to simplify to just `speed` and `bounciness` which should hopefully be self-describing.

## Animating component entering, and component exiting

This is always a huge pain in the butt with React, so **React SPHO** makes this easier by letting you set enter and exit values on properties for when components are entering and exiting.
```typescript
// creates a SpringyDiv component that when mounted 
// will grow from zero height to the auto "natural" 
// height, and also will fade in when entering, and 
// fade out when exiting
const SpringyDiv = getSpringyDOMElement('div', {
    height: {
        onEnterFromValue: 0,
        onEnterToValue: 'auto'
    },
    opacity: {
        onEnterFromValue: 0,
        onEnterToValue: 1,
        onExitFromValue: 1,
        onExitToValue: 0
    }
});
```

## Animating multiple elements together

There are times when you want the animation of multiple elements to be tied together in some way, **React SPHO** lets you do this for a few cases.

### `SpringyRepeater`

```typescript
import {SpringyRepeater, getSpringyDOMElement} from 'react-spho';

const SpringyDiv = getSpringyDOMElement('div');

function ExampleComponent() {

    // will constantly change the scale of the two 
    // SpringyDivs from 0 to 1 and back to 0 and back 
    // to 1 forever and ever
    return (
        <SpringyRepeater
            springyRepeaterStyles={{
                scale: {
                    from: 0,
                    to: 1
                }
            }}
        >
            <SpringyDiv>Hello</SpringyDiv>
            <SpringyDiv>World</SpringyDiv>
        </SpringyRepeater>
    );

}
```

### `SpringyFollowGroup`
```typescript
import {SpringyFollowGroup, getSpringyDOMElement} from 'react-spho';

const SpringyDiv = getSpringyDOMElement('div');

function ExampleComponent({mousePosition}) {

    // we don't need to specify the translateX and translateY 
    // values of the second SpringyDiv element since they're 
    // part of the same SpringyFollowGroup and the 2nd element 
    // will have the translateX, translateY properties 
    // "follow" the leader's values (the 
    // SpringyDiv with springyOrderedIndex=0)
    return (
        <SpringyFollowGroup
            properties={['translateX', 'translateY']}
        >
            <SpringyDiv
                springyOrderedIndex={0}
                springyStyle={{
                    translateX: mousePosition.x, 
                    translateY: mousePosition.y
                }}
            >
                Hello
            </SpringyDiv>
            <SpringyDiv springyOrderedIndex={1}>
                World
            </SpringyDiv>
        </SpringyFollowGroup>
    );

}
```

### `SpringyRepositionGroup`
```typescript
import {SpringyRepositionGroup, getSpringyDOMElement} from 'react-spho';

const SpringyDiv = getSpringyDOMElement('div');

function ExampleComponent({list}) {

    // when items are added/removed/repositioned 
    // in the list the SpringyDivs will animate to 
    // their new positions automatically
    return (
        <SpringyRepositionGroup>
            {
                list.map(item => (
                    <SpringyDiv key={item.id}>
                        {item.text}
                    </SpringyDiv>
                ))
            }
        </SpringyRepositionGroup>
    );
}
```
---
# Examples on Code Sandbox

- [Follow group](https://codesandbox.io/s/reactspho-follow-example-5oqqk)
- [2-dimensional following in a grid](https://codesandbox.io/s/grid-follow-reactspho-example-gjtlu)
- [Repeating animations](https://codesandbox.io/s/reactspho-repeating-dcyk6)
- [Elements transitioning in and out and animated repositioning](https://codesandbox.io/s/reactspho-list-example-wr8ct)

---
# API Reference

#### `getSpringyDOMElement(domElementName: string, propertyConfigs?: ConfigMap, styleOnExit?: StyleOnExitObject | (DOMNode) => StyleOnExitObject): SpringyComponent`

Creates a new React Component that is a "Springy" version of the DOM element you passed in. Only native DOM elements (`div`, `a`, `p`, `img`, etc are supported). You can't pass in your own custom components. Use the SpringyComponent where you would usually use a `<div>` or whatever, and get organic springy animations for free.

```typescript
const SpringyDiv = getSpringyDOMElement('div');
const SpringyAnchor = getSpringyDOMElement('a');
const SpringyImg = getSpringyDOMElement('img');
```

## ConfigMap

A map of style property names (`left`, `translateX`, `margin`, `opacity`, etc) to a configuration that specifies how they behave as their values change for a particular element. More specifically:
```typescript
type ConfigMap = {
    [key: string]: Config
};

type Config = {
    // the default speed of the spring for this property
    speed?: number;

    // the default bounciness of the spring for this property
    bounciness?: number;

    // when the new "target" value is larger than 
    // the old "target" value you can update the spring's properties
    configWhenGettingBigger?: {
        speed?: number;
        bounciness?: number;
    };

    // when the new "target" value is smaller than the old 
    // "target" value you can update the spring's properties
    configWhenGettingSmaller?: {
        speed?: number;
        bounciness?: number;
    };

    // if you don't want an absolute starting number, but 
    // instead want to make the number relative to the initial 
    // target (i.e. the height targets to auto, but you want 
    // to start from 20px less)
    onEnterFromValueOffset?: number;

    // when you want to animate in from an explicit 
    // starting value (think 0 for opacity)
    onEnterFromValue?: number;

    // when the component is mounted what should 
    // the spring animate to
    onEnterToValue?: number | 'auto';

    // when unmounting what should the spring start from. 
    onExitFromValue?: number | 'auto';

    // when unmounting what should the spring animate to 
    // before being fully removed from the DOM. When using 
    // onExitToValue an element is cloned and is placed in 
    // the same position as the element that is being removed. 
    // This clone gets a couple of styles, specifically 
    // `pointer events: none` and the `width` and `height` are 
    // explicitly set to the computed value when the clone is created.
    onExitToValue?: number;

    // what units should be used for this property? 
    // You can't change/mix units for a specific property.
    units?: string;
}
```

Example
```typescript
const SpringyDiv = getSpringyDOMElement('div', {
    scale: {
        speed: 1.2,
        bounciness: 1.2,
        onEnterFromValue: 0.1,
        onEnterToValue: 1,
        onExitToValue: 2     
    },
    opacity: {
        onExitToValue: 0
    },
    height: {
        configWhenGettingBigger: {
            bounciness: 1.2
        },
        configWhenGettingSmaller: {
            bounciness: 0.5
        },
        units: 'vh'
    }
});
```

## StyleOnExitObject

If you supply an onExitToValue then what **React SPHO** does under the hood is that when the element gets unmounted a clone of the element is created and placed in the same DOM tree position and the style elements are animated on that cloned DOM node. Sometimes you'll want to add extra styles to that cloned DOM node, and this is where you specify that (i.e. position absolute, a background color, whatever).

```typescript
const SpringyDiv = getSpringyDOMElement('div', null, {
    position: 'absolute',
    zIndex: 10,
    backgroundColor: 'red'
});

// or with a function, where node is the newly cloned node
const SpringyDiv = getSpringyDOMElement('div', null, (node) => {
    return {
        position: 'absolute',
        zIndex: 10,
        backgroundColor: 'red'
    };
});

```

## SpringyComponent Props

When you have a springy version of a DOM element and you render that new component, all the normal props you can pass into a native DOM element work the same (tabIndex, src, title, etc). The SpringyComponent version also handles some extra props around the spring functionality.

```typescript
type SpringyComponentProps = {
    // map of style properties to values
    springyStyle: Object;

    // Allows you to register a listener for 
    // spring value updates. For advanced usage where 
    // you want to take action when a certain spring 
    // property reaches a certain value.
    onSpringyPropertyValueUpdate: (property: string, value: number) => void;

    // Allows you to register a listener for when a 
    // spring comes to a stop. You can think of this 
    // like the animation ending.
    onSpringPropertyValueAtRest: (property: string, value: number) => void

    // When the SpringyComponent is a child of a SpringyGroup 
    // component (SpringyRepeater or SpringyFollowGroup) then 
    // the springyOrderedIndex specifies the ordering of the 
    // element in that group. Within a group there needs to 
    // be exactly ONE element with a springyOrderedIndex of 0
    springyOrderedIndex: number;

    // This is for a pretty advanced use case - essentially when 
    // the you define an onExitToValue and an element is 
    // animating out, if you then do another render pass 
    // and want to render that same "logical" element again 
    // (think of a list that gets filtered, and then you take off the filter) 
    // if you use the same globalUniqueIDForSpringReuse the 
    // new element will "take over" the springs for that old 
    // element and things will transition nicely.
    globalUniqueIDForSpringReuse: string;

    // when you use a ref on a SpringyComponent you'll just get 
    // access to the DOM node as if you had rendered a normal 
    // "div". If you want to get access to the SpringyComponent 
    // instance directly, then you need to pass in an "instanceRef" prop. 
    // This most likely will be used very very little and is here 
    // more as an "escape" hatch if you need to do something 
    // very sophisticated.
    instanceRef: (ref: SpringyComponent) => void;
};
```

Example
```typescript
const SpringyDiv = getSpringyDOMElement('div');

const uniqueID = String(Math.random());

function ExampleComponent() {
    return (
        <SpringyDiv
            springyStyle={{
                left: 10,
                top: 10,
                opacity: 1,
                rotate: 25
            }}
            onSpringyPropertyValueUpdate((property, value) => {
                console.log(property, 'has a new value:', value);
            })
            onSpringyPropertyValueAtRest((property, value) => {
                console.log(property, 'has stopped moving with value:', value);
            })
            globalUniqueIDForSpringyReuse={uniqueID}
        >
            Hello World
        </SpringyDiv>
    );
}
```


---
# Springy Group APIs
These components let you define how springs for multiple elements should be animated together.

## `SpringyRepeater Props`

```typescript
type SpringyRepeaterProps = {
    // a map of properties to repeat over and what values repeat to and from
    springyRepeaterStyles: {
        [key: string]: {
            from: number;
            to: number;
        }
    };

    // determines how the animation repeats. Does it 
    // go back-and-from from "from" to "to" to "from" to "to", etc. 
    // Or does it always start from the beginning each time 
    // from "from" to "to" and then from "from" to "to" again. 
    // The default is "back-and-forth".
    direction: 'from-beginning-each-time' | 'back-and-forth';

    // if multiple SpringyComponents are achild of a SpringyRepeater 
    // you can stagger their start times with this number in milliseconds. 
    // The springyOrderedIndex is used for ordering.
    delayStartBetweenChildren: number;

    // if you are repeating the values for multiple different 
    // properties (think rotation and opacity) and you want 
    // those properties to be synchronized, i.e. they will always 
    // start and end at the same time, then set this to true. 
    // Defaults to false if Object.keys(springyRepeaterStyles).length=1
    // and defaults to true if Object.keys(springyRepeaterStyles).length > 1.
    normalizeToZeroAndOn: boolean;

    // by default this is "infinite" which means the values 
    // will animate forever, but if you only want to do a 
    // finite number of animations then specify a number here
    numberOfTimesToRepeat: number | 'infinite';
};
```

Example
```typescript

import {SpringyRepeater} from 'react-spho';

function Example() {

    return (
        <SpringyRepeater
            springyRepeaterStyles={{
                scale: {
                    from: 0,
                    to: 1
                },
                rotate: {
                    from: 0,
                    to: 360
                }
            }}
            direction="from-beginning-each-time"
            delayStartBetweenChildren={200}
            numberOfTimesToRepeat={3}
        >
            <SpringyDiv springyOrderedIndex={0}>
                Hello
            </SpringyDiv>
            <SpringyDiv springyOrderedIndex={1}>
                World
            </SpringyDiv>
        </SpringyRepeater>
    );

}
```

## `SpringyFollowGroup Props`

```typescript
type SpringyFollowGroupProps = {
    // specify which springy properties should be followed. 
    // You can specify just a string for the name, or use an 
    // object where you specify a name and an offset
    properties: Array<string | {
        property: string;
        offset: number
    }>;
}
```

Example
```typescript
import {SpringyFollowGroup} from 'react-spho';

function ExampleComponent({mousePosition}) {
    return (
        <SpringyFollowGroup
            properties={[
                'translateX',
                {
                    property: 'translateY',
                    offset: 5
                }
            ]}
        >
            <SpringyDiv 
                springyStyle={{
                    translateX: mousePosition.x,
                    translateY: mousePosition.y
                }}
                springyOrderedIndex={0}
            >
                Hello
            </SpringyDiv>
            <SpringyDiv springyOrderedIndex={1}>
                World
            </SpringyDiv>
        </SpringyFollowGroup>
    );
}
```

## `SpringyRepositionGroup Props`

There actually are no props to the SpringyRepositionGroup element itself, just the children. But it's very important to note: SpringyRepositionGroup only works with SpringyDOMElements. The reposition group uses `translateX` and `translateY` to *flip* from the old position to new. For translate properties to have a visual effect the element needs to be a "block level element". Most commonly this will be display: block or display:inline-block. display: flex also works.

Example
```typescript
import {SpringyRepositionGroup} from 'react-spho';

function ExampleComponent({list}) {
    return (
        <SpringyRepositionGroup>
            {
                list.map(item => (
                    <SpringyDiv key={item.id}>
                        {item.text}
                    </SpringyDiv>
                ))
            }
        </SpringyRepositionGroup>
    );
}

```


