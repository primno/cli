export function convertToSnakeCase(text: string): string {
    return (text.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g) ?? [])
        .map(s => s.toLowerCase())
        .join('_');
}