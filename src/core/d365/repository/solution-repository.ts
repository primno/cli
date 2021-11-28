import { D365Client } from "@primno/d365-client";
import { AddSolutionComponentRequest } from "../model/add-solution-component";
import { Solution } from "../model/solution";

export class SolutionRepository {
    public constructor(private d365Client: D365Client) {}

    public async getByName(solutionUniqueName: string): Promise<Solution> {
        const options = [
            "$top=1",
            `$filter=uniquename eq '${solutionUniqueName}'`,
            "$select=uniquename,solutionid",
            "$expand=publisherid($select=customizationprefix)",
        ].join("&");

        const solutions = await this.d365Client.retrieveMultipleRecords<Solution>("solutions", options);
        return solutions[0];
    }

    public async addSolutionComponent(request: AddSolutionComponentRequest): Promise<any> {
        return await this.d365Client.executeAction("AddSolutionComponent", request);
    }
}