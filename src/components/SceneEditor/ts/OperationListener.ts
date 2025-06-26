const EVENT_NAME = [
    "operation:undo",
    "operation:redo",
    "operation:add",
    "model:add",
    "model:remove",
] as const;
type EventName = typeof EVENT_NAME[number];

class EventListener {
    private FUNC_MAP: Record<EventName, Set<Function>> = {
        "operation:undo": new Set(),
        "operation:redo": new Set(),
        "operation:add": new Set(),
        "model:add": new Set(),
        "model:remove": new Set(),
    }

    on(eventName: EventName, callback: Function) {
        this.FUNC_MAP[eventName].add(callback);
    }

    emit(eventName: EventName, ...args: any[]) {
        this.FUNC_MAP[eventName].forEach((callback) => {
            callback(...args);
        });
    }
}

const operationListener = new EventListener();
export {
    operationListener
}