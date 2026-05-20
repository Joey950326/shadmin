import type { Api } from '../types/api'
import { useMutation } from '@tanstack/react-query'
import { loginApi } from '../modules/auth'

export function useLogin() {
  return useMutation({
    mutationFn: (data: Api.Auth.LoginParams): Promise<Api.Auth.LoginResponse> => loginApi(data),
  })
}
