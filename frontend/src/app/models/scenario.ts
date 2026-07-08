export class Scenario {
    public id:number = 0;
    public created_at: Date = new Date();
    public name:string = '';
    public description:string = '';
    public is_owner: boolean = false;
    public is_public: boolean = false;

    public constructor(init:Partial<Scenario>){
        Object.assign(this,init)
    }
}

export enum TypeScenario{
    OTHER = 'Other',
    OWNER = 'Owner'
}