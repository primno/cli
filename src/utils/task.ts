import { Listr, ListrTask } from "listr2";
import { Observable } from "rxjs";

type ActionHandler = () => string | void | Promise<string | void> | Observable<string>;

export interface Action {
    title: string;
    action: ActionHandler;
}

enum TaskType {
    Action,
    Observable,
    Level
}

class TaskInfo {
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

    public get type(): TaskType  {
        return this._type;
    }

    public get title() {
        return this._title;
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
}

export class Task {
    private tasks: Task[] = [];

    private constructor(private taskInfo: TaskInfo, private parent?: Task) {}

    public static new() {
        return new Task(TaskInfo.newLevel());
    }

    public addSubTask(title: string, subTask?: Task): Task {
        let newTask: Task | undefined;

        if (subTask) {
            subTask.parent = this;
            newTask = subTask;
        }
        else {
            newTask = new Task(TaskInfo.newLevel(title), this);
        }

        this.tasks.push(newTask);

        return newTask;
    }

    public addAction(action: Action): Task {
        this.tasks.push(new Task(TaskInfo.newAction(action.title, action.action), this));
        return this;
    }

    public addObservable(title: string, observable: Observable<string>) {
        this.tasks.push(new Task(TaskInfo.newObservable(title, observable)));
        return this;
    }

    public addActions(action: Action[]): Task {
        action.forEach(a => this.addAction(a));
        return this;
    }

    public withConcurrent(concurrent: number | boolean): Task {
        this.taskInfo.exitOnError = concurrent === false;

        this.taskInfo.concurrent = concurrent;
        return this;
    }

    public end(): Task {
        if (!this.parent) {
            throw new Error("This task has no parent");
        }

        return this.parent;
    }

    private get type() {
        return this.taskInfo.type;
    } 

    private getListRTask(): ListrTask | null {
        switch (this.type) {
            case TaskType.Action:
                return {
                    title: this.taskInfo.title,
                    task: async (ctx, t) => {
                        const action = this.taskInfo.action as ActionHandler;
                        const result = await action();
                        if (typeof result === "string") {
                            t.output = result;
                        }
                    }
                };
            case TaskType.Observable:
                return {
                    title: this.taskInfo.title,
                    task: async (ctx, t) => this.taskInfo.observable
                };
            case TaskType.Level:
                if (this.tasks.length == 0) {
                    // TODO: Complete
                    return null;
                }

                return {
                    title: this.taskInfo.title,
                    task: (ctx, _task): Listr => _task.newListr(
                        this.tasks
                            .map(t => t.getListRTask())
                            .filter(t => t != null) as ListrTask[],
                        {
                            concurrent: this.taskInfo.concurrent,
                            exitOnError: this.taskInfo.exitOnError
                        }
                    )
                }
        }
    }

    public async run() {
        const listRTask = this.getListRTask();

        if (listRTask === null) {
            throw new Error("An empty task can't be run");
        }

        const listR = new Listr<any, "default">(listRTask,
        {
            rendererOptions:
            {
                formatOutput: "wrap",
                collapseErrors: false,
                showErrorMessage: true,
                showTimer: true,
                collapse: false
            },
            exitOnError: true
        });

        try {
            await listR.run();
        }
        catch (except) {}
    }
}