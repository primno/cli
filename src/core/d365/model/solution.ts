export interface Solution {
    solutionid: string,
    uniquename: string,
    publisherid: Publisher
}

export interface Publisher {
    publisherid: string,
    customizationprefix: string
}