import { ProductForm } from "./product-form"
import { useNavigate } from "react-router-dom"
import type { Product } from "@/types/models"
import { toast } from "sonner"

export default function AddProduct() {
  const navigate = useNavigate()

  const handleAdd = async (newProduct: Product) => {
    try {
      toast.success(`Product "${newProduct.name}" added successfully`)
      navigate("/inventory")
    } catch (error) {
      toast.error('Failed to add product')
      console.error('Error adding product:', error)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Add Product</h2>
      <ProductForm onSubmit={handleAdd} />
    </div>
  )
}
