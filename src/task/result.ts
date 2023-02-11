export enum MessageType {
    Error = "Error",
    Warning = "Warning",
    Info = "Info"
}

export interface Message {
    type: MessageType;
    message: string;
}

export interface Result {
    startedOn?: Date;
    endOn?: Date;
    showProgress?: boolean;
    messages: Message[];
    toString: () => string;
    hasErrors: boolean;
}