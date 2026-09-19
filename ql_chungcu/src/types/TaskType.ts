export type TaskType = {
    id: string;
    complexId: string;
    typeName: string;
    description: string;
    workflowId: string;
    priority: {
        id: string;
        priorityName: string;
    };
    status?: number;
}

export type fillItemTt = {
    id: string;
    typeName: string;
    workflowId: string;
    description: string;
    status?: number;
    complexId: string;
    priority: {
        id: string;
        priorityName: string;
    };
}
