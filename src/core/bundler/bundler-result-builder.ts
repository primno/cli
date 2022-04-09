import chalk from "chalk";
import path from "path";
import { WarningHandler } from "rollup";
import { BundleResult, Message, MessageType } from "./bundle-result";

const endLine = "\r\n";

export function onWarnWrapper(resultBuilder: BundlerResultBuilder): WarningHandler {
    return (warning) => {
        if (warning.loc?.file) {
            const filePath = path.relative(".", warning.loc.file);
            resultBuilder.addWarning(`${warning.message} at ${filePath} [${warning.loc.line}, ${warning.loc.column}]`);
        }
        else {
            resultBuilder.addWarning(`${warning.message}`);
        }
    };
}

export class BundlerResultBuilder implements BundleResult {
    private _messages: Message[] = [];
    private _startedOn?: Date;
    private _endOn?: Date;

    public get messages(): Message[] {
        return this._messages;
    };

    public get startedOn(): Date | undefined {
        return this._startedOn;
    };

    public get endOn(): Date | undefined {
        return this._endOn;
    };

    public get hasErrors(): boolean {
        return this._messages.some(m => m.type === MessageType.Error);
    }

    public addWarning(warnMsg: string) {
        if (this.messages.some(m => m.message === warnMsg)) {
            return;
        }

        this.messages.push({
            message: warnMsg,
            type: MessageType.Warning
        });
    }

    public addError(errorMsg: string) {
        if (this.messages.some(m => m.message == errorMsg)) {
            return;
        }

        this.messages.push({
            message: errorMsg,
            type: MessageType.Error
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
                default: return type;
            }
        };

        return [
            chalk.gray(this.startedOn == null ? `Waiting starting` : `Starting at ${this.startedOn.toLocaleTimeString()}`),
            ...this.messages.map(m => `[${colorize(m.type)}] ${m.message}`),
            chalk.gray(this.endOn == null ? `Waiting ending` : `Ending at ${this.endOn.toLocaleTimeString()}`)
        ].join(endLine);
    }
}