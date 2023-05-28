export interface AddSolutionComponentRequest {
    ComponentId: string
    ComponentType: SolutionComponentType
    SolutionUniqueName: string
    AddRequiredComponents: boolean
    DoNotIncludeSubcomponents: boolean
}

export enum SolutionComponentType {
    WebResource = 61
}