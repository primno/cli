import { Observable } from "rxjs";

export enum TaskType {
    /**
     * Function to call
     */
    Action,
    Observable,
    /**
     * Task containing subtasks.
     */
    Level,
    /**
     * Root task (level 0).
     * This type of task has no real existence and will not be displayed.
     * Used only to allow the creation of tasks when using {@link Task.new()}.
     */
    Root
}

export type ActionHandler = () => string | void | Promise<string | void> | Observable<string>;

export class TaskInfo {
    private _title?: string;
    private _action?: ActionHandler;
    private _concurrent?: number | boolean = false;
    private _type: TaskType;
    private _observable?: Observable<string>;
    private _exitOnError: boolean = true;

    private constructor(type: TaskType, title?: string) {
        this._title = title;
        this._type = type;
    }

    public static newAction(title: string, action: ActionHandler) {
        const task = new TaskInfo(TaskType.Action, title);
        task._action = action;

        return task;
    }

    public static newObservable(title: string, observable: Observable<string>) {
        const task = new TaskInfo(TaskType.Observable, title);
        task._observable = observable;

        return task;
    }

    public static newLevel(title?: string) {
        return new TaskInfo(TaskType.Level, title);
    }

    public static newRoot() {
        return new TaskInfo(TaskType.Root);
    }

    public get type(): TaskType  {
        return this._type;
    }

    public set type(value) {
        this._type = value;
    }

    public get title() {
        return this._title;
    }

    public set title(value) {
        this._title = value;
    }

    public get action() {
        return this._action;
    }

    public get observable() {
        return this._observable;
    }

    public get concurrent() {
        return this._concurrent;
    }

    public set concurrent(value) {
        this._concurrent = value;
    }

    public get exitOnError() {
        return this._exitOnError;
    }

    public set exitOnError(value) {
        this._exitOnError = value;
    }

    public get persistentOutput() {
        return true;
    }
}