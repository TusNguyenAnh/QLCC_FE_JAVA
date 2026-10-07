export type Task = {
    id: string;
    complexId: string;
    taskTypeId: string;
    currentStep: number;
    currentOrgId: string;
    userId: string;
    taskName: string;
    description: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    typeName: string;
    priorityName: string;
    username: string;
    phoneNumber: string;
    fullName: string;
    aptNumber: string;
    level: number;
    buildingName: string;
};

export type TaskWorkflow = {
    id: string;
    taskId: string;
    approverId: string; //nguoi duyet
    orgId: string;
    stepOrder: number;
    action: string;
    comment: string;
    orgName: string;
    level: number;
    workflowName: string;
    roleName: string;
    fullname: string;
    moduleCode: string;

};

export type ActionSummary = {
    action: string;
    total: number;
};

export type TaskReview = {
    action: string;
    comment: string;
    stepOrder:number;
};
