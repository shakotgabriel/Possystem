export interface Product {
  id: string
  name: string
  price: number
  stock: number

  category?: string | Category | null
  categoryId?: string | null
  costPrice?: number | null
  minStock?: number | null
  barcode?: string | null
  image?: string | null
  createdAt?: string | Date
  updatedAt?: string | Date
}

export interface Category {
  id: string
  name: string
  createdAt?: string | Date
  updatedAt?: string | Date
}
  
  export interface CartItem extends Product {
    quantity: number
  }
  
  export interface Customer {
    id: string
    name: string
      phone?: string | null
      email?: string | null

      totalSpent?: number
      lastPurchase?: Date

      createdAt?: string | Date
      updatedAt?: string | Date

      sales?: Sale[]
  }

  export interface Sale {
    id: string
    totalAmount: number
    createdAt: string
    customerId?: string | null
    customer?: Customer | null
    saleItems?: SaleItem[]
  }

  export interface SaleItem {
    id: string
    quantity: number
    unitPrice: number
    productId?: string
    product?: Product | null
  }
  
  export interface Transaction {
    id: string
    date: Date
    items: CartItem[]
    total: number
    tax: number
    discount: number
    paymentMethod: string
    cashierId: string
    customerId?: string
  }

  
  