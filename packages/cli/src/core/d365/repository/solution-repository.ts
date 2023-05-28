import { DataverseClient } from "@primno/dataverse-client";
import { AddSolutionComponentRequest } from "../model/add-solution-component";
import { Solution } from "../model/solution";

export class SolutionRepository {
    public constructor(private client: DataverseClient) {}

    public async getByName(solutionUniqueName: string): Promise<Solution | undefined> {
        const solutions = await this.client.retrieveMultipleRecords<Solution>(
            "solutions",
            {
                top: 1,
                filters: [{ conditions: [{ attribute: "uniquename", operator: "eq", value: solutionUniqueName }] }],
                select: ["uniquename", "solutionid"],
                expands: [{ attribute: "publisherid", select:["customizationprefix"] }]
            }
        );
        return solutions.entities[0];
    }

    public async addSolutionComponent(request: AddSolutionComponentRequest): Promise<any> {
        return await this.client.executeAction("AddSolutionComponent", request);
    }
}