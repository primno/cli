export interface WebResource {
    webresourceid?: string;
    name: string;
    displayname: string;
    description: string;
    solutionid: string;
    webresourcetype: WebResourceType;
    content: string;
}

export enum WebResourceType {
    HTML = 1,
    CSS = 2,
    JS = 3,
    XML = 4,
    PNG = 5,
    JPG = 6,
    GIF = 7,
    Silverlight = 8,
    XSL = 9,
    ICO = 10,
    SVG = 11,
    RESX = 12,
}