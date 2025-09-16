import { useAuthStore } from '@/state/pinia'

export function usePermissions(){
    const auth = useAuthStore()

    const hasPerm = (perm) => {
        return auth.hasPerm(perm)
    }

    return {
        hasPerm
    }
}