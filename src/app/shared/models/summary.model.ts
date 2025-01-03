import { TypeDocumentEnum } from "../../ecommerce/signup/pages/create-account/create-account.component"

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
    quantity: number
}

export interface UserDataSummary {
    nombre: string,
    apellido : string,
    dni: string,
    email: string
    cellphone: string,
    typeDocument: TypeDocumentEnum,
    password: string
}

export interface AddressSummary {
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
    CREATINA_3KG = 'Creatina 3kg',
    CREATINA_250G_ONE_PURCHASE = 'Creatina 250g',
    CREATINA_250G_SUBSCRIPTION = 'Subscripción de Creatina 250g'
}

