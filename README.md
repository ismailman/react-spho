# react-spho

## Gotchas

When using onExitToValue an element is cloned and is placed in the same position as the element that is being removed. This clone gets a couple of styles, specifically position absolute and pointer events none. However, making the position be absolute means the cloning element can be overlapped, so you may want to specify a zIndex.

SpringyRepositionGroup only works with SpringyDOMElements. The reposition group uses `translateX` and `translateY` to "flip" from the old position to new. For translate properties to have a visual effect the element needs to be a "block level element". Most commonly this will be display: block or display:inline-block. display: flex also works.