import {DOMSpringConfigMap} from './types';
import {DEFAULT_UNIT_SUFFIXES} from './domStyleProperties';

export default function getUnits(configMap: DOMSpringConfigMap, property: string): string {

    return configMap && configMap[property] && configMap[property].units ?
                configMap[property].units : 
            DEFAULT_UNIT_SUFFIXES[property] != null ?
                DEFAULT_UNIT_SUFFIXES[property] :
                '';


                

}