import type {fillItemTt} from "@/types/TaskType.ts";

export type Workflow = {
    id: string;
    workflowName: string;
    description: string;
    status?: number;
    complexId: string;
    workflowSteps: WorkflowStep;
}


export type WorkflowStep = {
    id: string;
    orgLevel: number;
    stepOrder: number;
    description: string;
    moduleCode: string;
    status?: number;
    workflowId: string;
    workflowStepApprovers: {
        role: {
            id: string,
            complexId: string,
            roleName: string,
            description: string,
        }
    }[];
}

export type fillItemWf = {
    id: string;
    workflowName: string;
    description: string;
    status?: number;
    complexId: string;
    workflowSteps: WorkflowStep[];
}

export type listWorkflow = {
    id: string;
    complexId: string;
    workflowName: string;
    status?: number;
    description: string;
    workflowSteps: WorkflowStep[];
    taskType: fillItemTt[];
}
