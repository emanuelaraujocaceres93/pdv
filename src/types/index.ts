export type Product = {
  id: string
  name: string
  price: number
  stock: number
}

export type CartItem = Product & {
  quantity: number
  unit_price: number
}
