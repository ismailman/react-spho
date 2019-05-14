# React SPHO

The (hopefully) easiest to use animation library for React for interactive applications.

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
// create a new SpringyDiv where the translateX spring will move a bit slower but have more bounce, and the translateY spring will move faster but have no bounce
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
// creates a SpringyDiv component that when mounted will grow from zero height to the auto "natural" height, and also will fade in when entering, and fade out when exiting
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

    // will constantly change the scale of the two SpringyDivs from 0 to 1 and back to 0 and back to 1 forever and ever
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

    // we don't need to specify the translateX and translateY values of the second SpringyDiv element since they're part of the same SpringyFollowGroup and the 2nd element will have the translateX, translateY properties "follow" the leader's values (the SpringyDiv with springyOrderedIndex=0)
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

    // when items are added/removed/repositioned in the list the SpringyDivs will animate to their new positions automatically
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
# API Reference

#### `getSpringyDOMElement(domElementName: string, propertyConfigs?: ConfigMap, styleOnExit?: StyleOnExitObject): SpringyComponent`

Creates a new React Component that is a "Springy" version of the DOM element you passed in. Only native DOM elements (`div`, `a`, `p`, `img`, etc are supported). You can't pass in your own custom components. Use this the SpringyComponent where you would usually use a `<div>` or whatever, and get organicy springy animations for free.

## ConfigMap

A map of style property names (`left`, `translateX`, `margin`, `opacity`, etc) to a configuration that specifies how they behave as their values change for a particular element. More specifically:
```typescript
type ConfigMap = {
    [key: string]: Config
};

type Config = {
    speed?: number;
    bounciness?: number;
    configWhenGettingBigger?: {
        speed?: number;
        bounciness?: number;
    };
    configWhenGettingSmaller?: {
        speed?: number;
        bounciness?: number;
    };
    onEnterFromValueOffset?: number;
    onEnterFromValue?: number;
    onEnterToValue?: number | 'auto';
    onExitFromValue?: number | 'auto';
    onExitToValue?: number;
    units?: string;
}
```

## StyleOnExitObject

If you supply an onExitToValue then what **React SPHO** does under the hood is that when the element gets unmounted a clone of the element is created and placed in the same DOM tree position and the style elements are animated on that cloned DOM node. Sometimes you'll want to add extra styles to that cloned DOM node, and this is where you specify that (i.e. position absolute, a background color, whatever).

#### SpringyComponent Props

Once you have a `SpringyComponent` and you render it a la:
```typescript
const SpringyDiv = getSpringyDOMElement('div');

function ExampleComponent() {
    return (
        <SpringyDiv>hello world</SpringyDiv>
    );
}
```

The SpringyComponent takes in all the props that a normal DOM component takes in (style, tabIndex, title, src, etc) but it can also take in and make use of some extra props.

## springyStyle: Object

Already discussed above, but an object that specifies the new target values for the specified style properties.

```typescript
<SpringyDiv
    springStyle={{
        left: 10,
        top: 10,
        opacity: 1,
        rotate: 25
    }}
/>
```

## springyOrderedIndex: number

When the SpringyComponent is a child of a SpringyGroup component (SpringyRepeater or SpringyFollowGroup) then the springyOrderedIndex specifies the ordering of the element in that group.

## globalUniqueIDForSpringReuse: string

This is for a pretty advanced use case - essentially when the you define an onExitToValue and an element is animating out, if you then do another render pass and want to render that same "logical" element again (think of a list that gets filtered, and then you take off the filter) if you use the same `globalUniqueIDForSpringReuse` the new element will "take over" the springs for that old element and things will transition nicely.

## onSpringyPropertyValueUpdate: (property: string, value: number) => void

Allows you to register a listener for spring value updates. For advanced usage where you want to take action when a certain spring property reaches a certain value.

## onSpringPropertyValueAtRest: (property: string, value: number) => void

Allows you to register a listener for when a spring comes to a stop. You can think of this like the animation ending.

# Springy Group APIs

#### SpringyRepeater

Surround one or more SpringyComponents in a SpringyRepeater to have the specified value transitions repeat. Springy

## Gotchas

When using onExitToValue an element is cloned and is placed in the same position as the element that is being removed. This clone gets a couple of styles, specifically `pointer events: none` and the `width` and `height` are explicitly set to the computed value when the clone is created.

SpringyRepositionGroup only works with SpringyDOMElements. The reposition group uses `translateX` and `translateY` to *flip* from the old position to new. For translate properties to have a visual effect the element needs to be a "block level element". Most commonly this will be display: block or display:inline-block. display: flex also works.