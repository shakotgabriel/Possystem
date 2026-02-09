import { useCallback, useEffect, useState } from 'react'
import { del, get, post, put } from '@/api'
import type { Customer } from '@/types/models'

type FetchCustomersFilters = {
  search?: string
  spending?: string
  status?: string
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomers = useCallback(
    async (page = 1, filters: FetchCustomersFilters = {}) => {
      try {
        setLoading(true)
        setError(null)

        const take = 100
        const skip = Math.max(0, page - 1) * take

        const response = await get('/api/customers', {
          params: {
            search: filters.search,
            skip,
            take,
          },
        })

        setCustomers(Array.isArray(response.data) ? response.data : [])
      } catch (err: any) {
        console.error('Error fetching customers data:', err)
        setError('Failed to fetch customers data')
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    void fetchCustomers()
  }, [fetchCustomers])

  const createCustomer = useCallback(
    async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
      await post('/api/customers', customerData)
      await fetchCustomers(1)
    },
    [fetchCustomers],
  )

  const updateCustomer = useCallback(
    async (
      id: string,
      customerData: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>,
    ) => {
      await put(`/api/customers/${id}`, customerData)
      await fetchCustomers(1)
    },
    [fetchCustomers],
  )

  const deleteCustomer = useCallback(
    async (id: string) => {
      await del(`/api/customers/${id}`)
      await fetchCustomers(1)
    },
    [fetchCustomers],
  )

  const filterCustomers = (customersToFilter: Customer[], searchQuery: string) => {
    let filtered = [...customersToFilter]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(query) ||
          (customer.phone && customer.phone.includes(query)),
      )
    }

    return filtered
  }

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    filterCustomers,
  }
}