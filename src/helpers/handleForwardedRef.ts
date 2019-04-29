import {MutableRefObject} from 'react';
type Ref<T> = { bivarianceHack(instance: T | null): void }["bivarianceHack"] | MutableRefObject<T> | null;

export default function handleForwardedRef<T>(ref: T, forwardedRef: Ref<T>) {
    if(forwardedRef){
        if(typeof forwardedRef === 'function') forwardedRef(ref);
        else if(typeof forwardedRef === 'object' && forwardedRef.hasOwnProperty('current')) forwardedRef.current = ref;
    }
}