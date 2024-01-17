export class UsersSR{
    Email?:string;
    Name?:string;
    DocNum?: string;
    DocEntry?: string;
}

export class UsersAzure{
    DocEntry?:string;
    DocNum?: string;
    usersC?: UsersSR[];
}