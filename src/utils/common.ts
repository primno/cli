/**
 * Indicates whether an element is a javascript object.
 * @param item
 */
 export function isObject(item: unknown): item is Record<string, unknown> {
    return (item != null && typeof item === 'object' && !Array.isArray(item));
}

/**
* Merges an object with others, including sub-properties.
* @param target
* @param sources
*/
export function mergeDeep<T extends Record<string, unknown>>(target: T, ...sources: unknown[]): T {
    if (!sources.length) return target;

    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeDeep(<Record<string, unknown>>target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
}

/**
 * Escape Xml. Replace <, >, &, \ and " by XML equivalent.
 * @param unsafe unsafe string to escape
 * @returns escaped xml
 */
export function escapeXml(unsafe: string) {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return "";
        }
    });
}
