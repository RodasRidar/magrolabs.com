export interface Summary {
    chosePlan?: ChosePlanSummary,
    userData?: UserDataSummary,
    address?: AddressSummary,
}

export interface ChosePlanSummary {
    selection: 'Creatina 3kg' | 'Creatina 250g'
    descriptionOne: string
    descriptionTwo: string
}

export interface UserDataSummary {
    nombreApellido: string,
    dni: string,
    email: string
}

export interface AddressSummary {
    tipoVia :string
    nombreVia :string
    numero? :string
    codigoPostal :string
    distrito :string
    provincia :string
}

export enum SummaryEnum {
    CREATINA_3KG = 'Creatina 3kg',
    CREATINA_250G = 'Creatina 250gr'
}

