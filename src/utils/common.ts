export function isNullOrUndefined<T>(obj: T | null | undefined): obj is null | undefined {
    return typeof obj === "undefined" || obj === null;
}

/**
 * Indique si un élément est un objet javascript.
 * @param item
 */
export function isObject(item: unknown): item is Record<string, unknown> {
    return (isNullOrUndefined(item) == false && typeof item === 'object' && !Array.isArray(item));
}

/* Fusionne un object avec d'autres, sous propriétés comprises.
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
