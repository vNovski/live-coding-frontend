export default (path: string) => {
    if (typeof Worker !== 'undefined') {
        // Create a new
        const worker = new Worker(new URL(path, import.meta.url));
        return worker
    } else {
        console.error('Web Worker is not supported in this')
        return null;
    }
}