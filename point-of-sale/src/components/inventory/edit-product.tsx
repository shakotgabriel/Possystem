                                       
import { useParams, useNavigate } from "react-router-dom"
import { ProductForm } from "../../components/inventory/product-form"
import { useEffect, useState } from "react"
import { get } from "@/api"
import type { Product } from '@/types/models'

export default function EditProduct() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProduct()
  }, [])

  const fetchProduct = async () => {
    try {
      if (!id) {
        setError("Product ID not found")
        return
      }

      const response = await get(`/api/products/${id}`)
      setProduct(response.data)
      setError(null)
    } catch (error: any) {
      console.error('Error fetching product:', error)
      setError('Failed to fetch product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (updatedProduct: Product) => {
    console.log("Updated:", updatedProduct)
    // The product form handles the API call now
    navigate("/inventory")
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}
      {product ? (
        <ProductForm
          initialData={product}
          onSubmit={handleEdit}
        />
      ) : (
        <div className="text-red-500">Product not found</div>
      )}
    </div>
  )
}
