declare module "win-ca/api" {
    interface Config {
        format: string;
        store: string[];
        inject: true | false | "+";
    }

    function ca(config: Config): void;
  
    export default ca;
}