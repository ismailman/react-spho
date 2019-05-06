import {SpringConfig} from 'simple-performant-harmonic-oscillator';
import {SpringPropertyConfig} from '../types';

export default function getConfig(config: SpringPropertyConfig | null | undefined, oldToValue: number, newToValue: number): SpringConfig | null {
    let springConfig: SpringConfig = {};
    if(config == null) return springConfig;

    springConfig.speed = config.speed;
    springConfig.bounciness = config.bounciness;

    if(oldToValue <= newToValue) {
        const configWhenGettingBigger = config.configWhenGettingBigger;
        if(configWhenGettingBigger){
            springConfig.speed = configWhenGettingBigger.speed != null ? configWhenGettingBigger.speed : springConfig.speed;
            springConfig.bounciness = configWhenGettingBigger.bounciness != null ? configWhenGettingBigger.bounciness : springConfig.bounciness;
        }
    }
    else if(oldToValue > newToValue){
        const configWhenGettingSmaller = config.configWhenGettingSmaller;
        if(configWhenGettingSmaller){
            springConfig.speed = configWhenGettingSmaller.speed != null ? configWhenGettingSmaller.speed : springConfig.speed;
            springConfig.bounciness = configWhenGettingSmaller.bounciness != null ? configWhenGettingSmaller.bounciness : springConfig.bounciness;
        }
    }

    return springConfig;
}