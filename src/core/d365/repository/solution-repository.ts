import { D365Client, MultipleQueryOptions } from "@primno/d365-client";
import { AddSolutionComponentRequest } from "../model/add-solution-component";
import { Solution } from "../model/solution";

export class SolutionRepository {
    public constructor(private d365Client: D365Client) {}

    public async getByName(solutionUniqueName: string): Promise<Solution | undefined> {
        const solutions = await this.d365Client.retrieveMultipleRecords<Solution>(
            "solutions",
            {
                top: 1,
                filters: [{ conditions: [{ attribute: "uniquename", operator: "eq", value: solutionUniqueName }] }],
                select: ["uniquename", "solutionid"],
                expands: [{ attribute: "publisherid", select:["customizationprefix"] }]
            }
        );
        return solutions[0];
    }

    public async addSolutionComponent(request: AddSolutionComponentRequest): Promise<any> {
        return await this.d365Client.executeAction("AddSolutionComponent", request);
    }
}