import {SpringConfig} from 'simple-performant-harmonic-oscillator';

export type SpringyStyleValue = number | 'auto';

export type SpringPropertyConfig = SpringConfig&{
    configWhenGettingBigger?: SpringConfig;
    configWhenGettingSmaller?: SpringConfig;
    onEnterFromValueOffset?: number;
    onEnterFromValue?: number;
    onEnterToValue?: SpringyStyleValue;
    onExitFromValue?: SpringyStyleValue;
    onExitToValue?: number;
    units?: string;
};

export type DOMSpringConfigMap = {
    [key:string]: SpringPropertyConfig;
}

export type SpringyProps = {
    forwardedRef: any;
    globalUniqueIDForSpringReuse?: string;
    onSpringyPropertyValueUpdate?: (property: string, value: number) => void;
    onSpringyPropertyValueAtRest?: (property: string, value: number) => void;
    springFollowGroupIndex?: number;
    springyStyle?: {[key:string]: SpringyStyleValue};
};

export type Intrinsics = keyof JSX.IntrinsicElements;

type Omit<T, K> = Pick<T, Exclude<keyof T, keyof K>>;


export type SpringyDOMWrapper<T extends Intrinsics> = 
    (ComponentToWrap: T, configMap: DOMSpringConfigMap, styleOnExit: Object) => React.ComponentClass<SpringyProps & JSX.IntrinsicElements[T]>;


export type PropsWithoutSpringyAttributes<T> = Omit<T, SpringyProps>;


/* 
    resize observer type from https://github.com/que-etc/resize-observer-polyfill/blob/master/src/index.d.ts
*/

interface DOMRectReadOnly {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly left: number;
}

declare global {
    interface ResizeObserverCallback {
        (entries: ResizeObserverEntry[], observer: ResizeObserver): void
    }

    interface ResizeObserverEntry {
        readonly target: Element;
        readonly contentRect: DOMRectReadOnly;
    }

    interface ResizeObserver {
        observe(target: Element): void;
        unobserve(target: Element): void;
        disconnect(): void;
    }
}

declare var ResizeObserver: {
    prototype: ResizeObserver;
    new(callback: ResizeObserverCallback): ResizeObserver;
}

interface ResizeObserver {
    observe(target: Element): void;
    unobserve(target: Element): void;
    disconnect(): void;
}

export default ResizeObserver;
