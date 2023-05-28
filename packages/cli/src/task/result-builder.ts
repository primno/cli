import chalk from "chalk";
import { Message, MessageType, Result } from "./result";

const endLine = "\r\n";

export class ResultBuilder implements Result {
    private _messages: Message[] = [];
    private _startedOn?: Date;
    private _endOn?: Date;
    private _showProgress: boolean;

    public constructor(showProgress: boolean = false) {
        this._showProgress = showProgress;
    }

    public get messages(): Message[] {
        return this._messages;
    }

    public get showProgress(): boolean {
        return this._showProgress;
    }

    public get startedOn(): Date | undefined {
        return this._startedOn;
    }

    public get endOn(): Date | undefined {
        return this._endOn;
    }

    public get hasErrors(): boolean {
        return this._messages.some(m => m.type === MessageType.Error);
    }

    public addWarning(warnMsg: string) {
        this.addMessage(warnMsg, MessageType.Warning);
    }

    public addInfo(infoMsg: string) {
        this.addMessage(infoMsg, MessageType.Info);
    }

    public addError(errorMsg: string) {
        this.addMessage(errorMsg, MessageType.Error);
    }

    private addMessage(message: string, type: MessageType) {
        if (this.messages.some(m => m.message == message)) {
            return;
        }

        this.messages.push({
            message,
            type
        });
    }

    public start() {
        this._messages = [];
        this._startedOn = new Date();
        this._endOn = undefined;
    }

    public end() {
        this._endOn = new Date();
    }

    public toString(): string {
        const colorize = (type: MessageType) => {
            switch (type) {
                case MessageType.Error: return chalk.red(type);
                case MessageType.Warning: return chalk.yellow(type);
                case MessageType.Info: return chalk.blue(type);
                default: return type;
            }
        };

        const resultMessage = this.messages
            .map(m => `[${colorize(m.type)}] ${m.message}`)
            .join(endLine);

        return this.showProgress ?
            [
                chalk.gray(this.startedOn == null ? `Waiting starting` : `Starting at ${this.startedOn.toLocaleTimeString()}`),
                resultMessage,
                chalk.gray(this.endOn == null ? `Waiting ending` : `Ending at ${this.endOn.toLocaleTimeString()}`)
            ].join(endLine)
            : resultMessage;
    }
}