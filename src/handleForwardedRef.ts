export default function handleForwardedRef(ref, forwardedRef) {
    if(forwardedRef){
        if(typeof forwardedRef === 'function') forwardedRef(ref);
        else if(typeof forwardedRef === 'object' && forwardedRef.hasOwnProperty(forwardedRef, 'current')) forwardedRef.current = ref;
    }
}