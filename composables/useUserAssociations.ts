/**
 * User associations composable
 * Provides reactive state and methods for managing user connections
 */
import { ref, computed } from 'vue'

export interface UserAssociation {
  id: number
  user_id: number
  associated_user_id: number
  status: 'pending' | 'accepted' | 'blocked'
  relationship_type: 'colleague' | 'friend' | 'family' | 'client' | 'manager' | 'team_member'
  notes?: string
  requested_by: number
  created_at: string
  updated_at: string
  // Joined user data
  username?: string
  full_name?: string
  email?: string
  avatar?: string
}

export interface SearchUser {
  id: number
  username: string
  full_name?: string
  email: string
  avatar?: string
  association_status?: 'pending' | 'accepted' | 'blocked' | null
}

export const useUserAssociations = () => {
  const associations = ref<UserAssociation[]>([])
  const pendingRequests = ref<UserAssociation[]>([])
  const searchResults = ref<SearchUser[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const acceptedAssociations = computed(() => 
    associations.value.filter(a => a.status === 'accepted')
  )

  const associationsByType = computed(() => {
    const grouped: Record<string, UserAssociation[]> = {}
    acceptedAssociations.value.forEach(association => {
      const type = association.relationship_type
      if (!grouped[type]) {
        grouped[type] = []
      }
      grouped[type].push(association)
    })
    return grouped
  })

  const pendingRequestsCount = computed(() => pendingRequests.value.length)

  /**
   * Load user's associations
   */
  const loadAssociations = async (status?: UserAssociation['status']) => {
    try {
      isLoading.value = true
      error.value = null

      const { data } = await $fetch('/api/user-associations', {
        method: 'GET',
        params: status ? { status } : {},
        headers: {
          'Authorization': `Bearer ${useAuth().token.value}`
        }
      })

      associations.value = data.associations || []
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to load associations'
      console.error('Error loading associations:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load pending association requests
   */
  const loadPendingRequests = async () => {
    try {
      isLoading.value = true
      error.value = null

      const { data } = await $fetch('/api/user-associations', {
        method: 'GET',
        params: { pending: 'true' },
        headers: {
          'Authorization': `Bearer ${useAuth().token.value}`
        }
      })

      pendingRequests.value = data.requests || []
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to load pending requests'
      console.error('Error loading pending requests:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Search for users to associate with
   */
  const searchUsers = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      searchResults.value = []
      return
    }

    try {
      isLoading.value = true
      error.value = null

      const { data } = await $fetch('/api/user-associations', {
        method: 'GET',
        params: { search: searchTerm },
        headers: {
          'Authorization': `Bearer ${useAuth().token.value}`
        }
      })

      searchResults.value = data.users || []
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to search users'
      console.error('Error searching users:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Send association request
   */
  const sendRequest = async (
    toUserId: number, 
    relationshipType: UserAssociation['relationship_type'] = 'colleague',
    notes?: string
  ) => {
    try {
      isLoading.value = true
      error.value = null

      const { data } = await $fetch('/api/user-associations', {
        method: 'POST',
        body: {
          action: 'request',
          toUserId,
          relationshipType,
          notes
        },
        headers: {
          'Authorization': `Bearer ${useAuth().token.value}`
        }
      })

      // Update search results to reflect the new pending status
      const userIndex = searchResults.value.findIndex(u => u.id === toUserId)
      if (userIndex >= 0) {
        searchResults.value[userIndex].association_status = 'pending'
      }

      return data.association
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to send association request'
      console.error('Error sending request:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Accept association request
   */
  const acceptRequest = async (associationId: number) => {
    try {
      isLoading.value = true
      error.value = null

      const { data } = await $fetch('/api/user-associations', {
        method: 'POST',
        body: {
          action: 'accept',
          associationId
        },
        headers: {
          'Authorization': `Bearer ${useAuth().token.value}`
        }
      })

      // Remove from pending requests
      pendingRequests.value = pendingRequests.value.filter(r => r.id !== associationId)
      
      // Add to associations
      associations.value.unshift(data.association)

      return data.association
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to accept association request'
      console.error('Error accepting request:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reject or remove association
   */
  const removeAssociation = async (associationId: number) => {
    try {
      isLoading.value = true
      error.value = null

      await $fetch('/api/user-associations', {
        method: 'DELETE',
        params: { id: associationId },
        headers: {
          'Authorization': `Bearer ${useAuth().token.value}`
        }
      })

      // Remove from both lists
      associations.value = associations.value.filter(a => a.id !== associationId)
      pendingRequests.value = pendingRequests.value.filter(r => r.id !== associationId)

      return true
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to remove association'
      console.error('Error removing association:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update association details
   */
  const updateAssociation = async (
    associationId: number,
    updates: { relationshipType?: UserAssociation['relationship_type']; notes?: string }
  ) => {
    try {
      isLoading.value = true
      error.value = null

      const { data } = await $fetch('/api/user-associations', {
        method: 'PUT',
        body: {
          associationId,
          relationshipType: updates.relationshipType,
          notes: updates.notes
        },
        headers: {
          'Authorization': `Bearer ${useAuth().token.value}`
        }
      })

      // Update in local state
      const index = associations.value.findIndex(a => a.id === associationId)
      if (index >= 0) {
        associations.value[index] = data.association
      }

      return data.association
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to update association'
      console.error('Error updating association:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get association display name
   */
  const getDisplayName = (association: UserAssociation) => {
    return association.full_name || association.username || association.email
  }

  /**
   * Get relationship type display name
   */
  const getRelationshipTypeLabel = (type: UserAssociation['relationship_type']) => {
    const labels = {
      colleague: 'Colleague',
      friend: 'Friend',
      family: 'Family',
      client: 'Client',
      manager: 'Manager',
      team_member: 'Team Member'
    }
    return labels[type] || type
  }

  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    associations: readonly(associations),
    pendingRequests: readonly(pendingRequests),
    searchResults: readonly(searchResults),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Computed
    acceptedAssociations,
    associationsByType,
    pendingRequestsCount,
    
    // Methods
    loadAssociations,
    loadPendingRequests,
    searchUsers,
    sendRequest,
    acceptRequest,
    removeAssociation,
    updateAssociation,
    getDisplayName,
    getRelationshipTypeLabel,
    clearError
  }
}
