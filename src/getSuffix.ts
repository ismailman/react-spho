import {DOMSpringConfigMap} from './types';
import {DEFAULT_UNIT_SUFFIXES} from './domStyleProperties';

export default function getSuffix(configMap: DOMSpringConfigMap, property: string): string {

    return configMap && configMap[property] && configMap[property].unitSuffix ?
                configMap[property].unitSuffix :
                DEFAULT_UNIT_SUFFIXES[property];

                

}