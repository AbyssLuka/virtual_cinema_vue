const EVENT_NAME = ["ws:send"] as const;
type EventName = typeof EVENT_NAME[number];

class EventListener {
    private FUNC_MAP: Record<EventName, Set<Function>> = {
        "ws:send": new Set(),
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

const listener = new EventListener();
export {
    listener
}