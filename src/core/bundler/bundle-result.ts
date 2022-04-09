export enum MessageType {
    Error = "Error",
    Warning = "Warning"
}

export interface Message {
    type: MessageType;
    message: string;
}

export interface BundleResult {
    startedOn?: Date;
    endOn?: Date;
    messages: Message[];
    toString: () => string;
    
    hasErrors: boolean;
}