"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tags, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { get, post, del } from "@/api"

interface Category {
  id: string
  name: string
}

export function CategoryDialog() {
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await get('/api/categories')
      setCategories(response.data)
      setError(null)
    } catch (error: any) {
      console.error('Error fetching categories:', error)
      setError('Failed to fetch categories. Please try again.')
    }
  }

  const addCategory = async () => {
    if (!newCategory.trim()) return

    try {
      setLoading(true)
      const response = await post('/api/categories', { name: newCategory.trim() })
      setCategories([...categories, response.data])
      setNewCategory("")
      setError(null)
    } catch (error: any) {
      console.error('Error adding category:', error)
      setError('Failed to add category. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      setLoading(true)
      await del(`/api/categories/${id}`)
      setCategories(categories.filter(cat => cat.id !== id))
      setError(null)
    } catch (error: any) {
      console.error('Error deleting category:', error)
      setError('Failed to delete category. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          <Tags className="mr-2 h-4 w-4" />
          Manage Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>
        {error && (
          <div className="text-red-500 mb-4">
            {error}
          </div>
        )}
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Input
              placeholder="New category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="col-span-3"
              disabled={loading}
            />
            <Button onClick={addCategory} disabled={loading}>
              {loading ? 'Adding...' : 'Add'}
            </Button>
          </div>
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-2 rounded-md bg-muted"
              >
                <span>{category.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteCategory(category.id)}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}