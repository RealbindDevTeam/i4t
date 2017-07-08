export interface CcRequestColombia {
    language: string,
    command: string,
    merchant: {
        apiKey: string
        apiLogin: string
    },
    transaction: {
        order: {
            accountId: number,
            referenceCode: string,
            description: string,
            language: string,
            signature: string,
            notifyUrl?  : string,
            additionalValues: {
                TX_VALUE: {
                    value: number,
                    currency: string
                }
            },
            buyer: {
                merchantBuyerId?: string,
                fullName: string,
                emailAddress: string,
                contactPhone: string,
                dniNumber: string,
                shippingAddress: {
                    street1: string,
                    street2?: string,
                    city: string,
                    state: string,
                    country: string,
                    postalCode: number,
                    phone: number
                }
            },
            shippingAddress?: {
                street1?: string,
                street2?: string,
                city?: string,
                state?: string,
                country?: string,
                postalCode?: string,
                phone?: string
            }
        },
        payer: {
            merchantPayerId?: string,
            fullName: string,
            emailAddress: string,
            contactPhone: string,
            dniNumber: string,
            billingAddress: {
                street1: string,
                street2?: string,
                city: string,
                state: string,
                country: string,
                postalCode: string,
                phone?: string
            }
        },
        creditCard: {
            number: string,
            securityCode: string,
            expirationDate: string,
            name: string
        },
        extraParameters?: {
            INSTALLMENTS_NUMBER?: number
        },
        type: string,
        paymentMethod: string,
        paymentCountry: string,
        deviceSessionId: string,
        ipAddress: string,
        cookie: string,
        userAgent: string
    },
    test: false
}