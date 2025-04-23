import { TypeDocument } from "../interfaces/auth.interfaces";
export interface Summary {
    chosePlan?: ChosePlanSummary,
    userData?: UserDataSummary,
    address?: AddressSummary,
}

export interface ChosePlanSummary {
    selection: SummaryEnum,
    descriptionOne: string
    descriptionTwo: string
    descrptionThree?: string
    descrptionFour?: string
    quantity: number
}

export interface UserDataSummary {
    id?: string,
    nombre: string,
    apellido : string,
    nroDocument: string,
    email: string
    cellphone: string,
    typeDocument: TypeDocument,
    password?: string,
    customerId?: string //Flow
    isPaymentVerified?: boolean,
    last4CardDigits?: string,//Flow
    creditCardType?: string,//Flow
    isSignUpAcepted?: boolean,
}

export interface AddressSummary {
    id?: string,
    tipoVia :string
    nombreVia :string
    numero? :string
    codigoPostal :string
    distrito :string
    provincia :string
    department: string
    reference: string
}

export enum SummaryEnum {
    CREATINA_3KG = 'Creatina 3 kg',
    CREATINA_3KG_SUBSCRIPTION = 'Subscripción de Creatina 3 kg',
    CREATINA_250G_ONE_PURCHASE = 'Creatina 250 gr',
    CREATINA_250G_SUBSCRIPTION = 'Subscripción de Creatina 250 gr',
    CREATINA_500G = 'Creatina 500 gr',
    CREATINA_500G_SUBSCRIPTION = 'Subscripción de Creatina 500 gr',

}

export enum ConfirmationStatus {
    SUBSCRIPTION_SUCCESS_OUTSIDE_LIMA = 0,
    SUBSCRIPTION_SUCCESS = 1,
    ONE_PURCHASE_SUCCESS_WITH_REGISTRATION = 3,
    ONE_PURCHASE_SUCCESS_WITHOUT_REGISTRATION = 4
    
}
