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

export type InternalSpringyProps = {
    forwardedRef: any;
    ComponentToWrap: string;
    configMap?: DOMSpringConfigMap;
    styleOnExit?: {[key: string]: string | number};
    globalUniqueIDForSpringReuse?: string;
    onSpringyPropertyValueUpdate?: (property: string, value: number) => void;
    onSpringyPropertyValueAtRest?: (property: string, value: number) => void;
    springyFollowGroupIndex?: number;
    springyStyle?: {[key:string]: SpringyStyleValue};
};

type SpringyProps = Pick<InternalSpringyProps, Exclude<keyof InternalSpringyProps, 'forwardedRef' | 'ComponentToWrap'>>;

export type SpringyDOMWrapper = 
    <T extends keyof JSX.IntrinsicElements>(ComponentToWrap: T, configMap?: DOMSpringConfigMap, styleOnExit?: JSX.IntrinsicElements[T]) => React.ComponentClass<SpringyProps & JSX.IntrinsicElements[T]>;



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
