import React, {forwardRef} from 'react';

import {SpringyDOMWrapper, DOMSpringConfigMap} from './types';
import SpringyDOMElement from './SpringyDOMElement';

function getSpringyDOMElement(ComponentToWrap: string, configMap?: DOMSpringConfigMap | null, styleOnExit?: {[key: string]: string | number}) {
     return forwardRef((props, ref) => (
        <SpringyDOMElement 
            {...props} 
            ComponentToWrap={ComponentToWrap} 
            configMap={configMap} 
            forwardedRef={ref} 
            styleOnExit={styleOnExit}
        />
    ));
}

export default (getSpringyDOMElement as any) as SpringyDOMWrapper;