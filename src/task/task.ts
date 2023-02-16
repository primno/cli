import { Listr, ListrTask } from "listr2";
import { Observable } from "rxjs";

type ActionHandler = () => string | void | Promise<string | void> | Observable<string>;

export interface Action {
    title: string;
    action: ActionHandler;
}

enum TaskType {
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

export class Task {
    private tasks: Task[] = [];

    private constructor(private taskInfo: TaskInfo, private parent?: Task) {}

    /**
     * Create a new root task.
     * @returns New task
     */
    public static new() {
        return new Task(TaskInfo.newRoot());
    }

    /**
     * Adds the subtask of given task at the same level of the current task.
     * The task must be a root task (created with {@link Task.new()}).
     * Order is preserved but not the root properties (Eg: {@link withConcurrency})
     * @param task Root task containing the subtasks to be added.
     * @returns The current task.
     */
    public addSubtasks(task: Task): Task {
        if (task.type !== TaskType.Root) {
            throw new Error("Only root tasks are supported");
        }

        this.tasks.push(...task.tasks);

        return this;
    }

    /**
     * Adds the task as level task.
     * The given task must be a root task (created with {@link Task.new()}).
     * Order and root properties (Eg: {@link withConcurrency}) are preserved.
     * @param task Root Task to be added.
     * @param title Title of level task.
     * @returns The current task.
     */
    public addTaskAsLevel(task: Task, title: string): Task {
        if (task.type !== TaskType.Root) {
            throw new Error("Only root tasks are supported");
        }

        task.taskInfo.type = TaskType.Level;
        task.taskInfo.title = title;

        this.tasks.push(task);

        return this;
    }

    /**
     * Adds a task level.
     * Task level is a container of subtasks.
     * @param title Title of task level.
     * @returns The current task.
     */
    public newLevel(title: string): Task {
        const newTask = new Task(TaskInfo.newLevel(title), this);
        this.tasks.push(newTask);

        return newTask;
    }

    public newAction(action: Action): Task {
        this.tasks.push(new Task(TaskInfo.newAction(action.title, action.action), this));
        return this;
    }

    public newActions(action: Action[]): Task {
        action.forEach(a => this.newAction(a));
        return this;
    }

    public newObservable(title: string, observable: Observable<string>) {
        this.tasks.push(new Task(TaskInfo.newObservable(title, observable)));
        return this;
    }

    /**
     * Sets how many tasks will be run at the same time in parallel.
     * @param concurrent Concurrency of subtasks.
     *  false: no concurrency, all tasks run synchronously. true: subtasks run simultaneously. number: limit the max concurrency.
     * @returns The current task.
     */
    public withConcurrency(concurrent: number | boolean): Task {
        this.taskInfo.concurrent = concurrent;
        return this;
    }

    /**
     * Ends the creation of a new level task. Returns the parent task.
     * @returns Parent task
     */
    public endLevel(): Task {
        if (!this.parent) {
            throw new Error("This task has no parent");
        }

        return this.parent;
    }

    private get type() {
        return this.taskInfo.type;
    }

    /**
     * Build ListR task.
     * @returns Built ListrTask
     */
    private getListRTask(): ListrTask | null | ListrTask[] {
        switch (this.type) {
            case TaskType.Action:
                return {
                    title: this.taskInfo.title,
                    task: async (ctx, t) => {
                        const action = this.taskInfo.action as ActionHandler;

                        // HACK: Workaround for https://github.com/cenk1cenk2/listr2/issues/641
                        // Throw exception or send something to output when root task failed will duplicate output.
                        const getRootTask = (task: typeof t) => {
                            let rootTask = task.task;

                            while (rootTask.listr.parentTask) {
                                rootTask = rootTask.listr.parentTask;
                            }

                            return rootTask;
                        };

                        const rootTask = getRootTask(t);

                        try {
                            const result = await action();
                            if (typeof result === "string" && !rootTask.hasFailed()) {
                                t.output = result;
                            }
                            else {
                                return result;
                            }
                        } catch(except) {
                            if (!rootTask.hasFailed()) {
                                throw except;
                            }
                        }
                    },
                    options: {
                        persistentOutput: this.taskInfo.persistentOutput
                    }
                };
            case TaskType.Observable:
                return {
                    title: this.taskInfo.title,
                    task: async (ctx, t) => this.taskInfo.observable
                };
            case TaskType.Level:
            case TaskType.Root:
                const subTasks = this.tasks
                    .map(t => t.getListRTask() as ListrTask)
                    .filter(t => t != null) as ListrTask[]; // Remove empty tasks

                if (subTasks.length === 0) {
                    return null;
                }

                if (this.type === TaskType.Level) {
                    return {
                        title: this.taskInfo.title,
                        task: (ctx, _task): Listr => _task.newListr(
                            subTasks,
                            this.getListROptions()
                        )
                    };
                }
                else {
                    // Root is not a real level, subtasks are added at the same level.
                    return subTasks;
                }
        }
    }

    private getListROptions() {
        return {
            concurrent: this.taskInfo.concurrent,
            exitOnError: this.taskInfo.exitOnError
        };
    }

    private getListR(): Listr {
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
            ...this.getListROptions(),
            exitOnError: true,
        });

        return listR;
    }

    /**
     * Run the task.
     */
    public async run() {
        const listR = this.getListR();

        try {
            await listR.run();
        }
        catch (except) {}
    }
}