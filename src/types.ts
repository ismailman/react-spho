import {SpringConfig} from 'simple-performant-harmonic-oscillator';

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

export type DOMSpringConfigMap = {
    [key:string]: SpringyComponentPropertyConfig&{
        onEnterFromValueOffset?: number;
        onEnterFromValue?: number;
        onEnterToValue?: number | 'auto';
        onExitToValue?: number;
        unitSuffix?: string;
    };
}