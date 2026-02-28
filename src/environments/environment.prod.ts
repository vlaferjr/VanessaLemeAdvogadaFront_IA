export const environment = {
  production: true,
  apiUrl: 'https://sua-api-producao.com/api',
  endpoints: {
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      refreshToken: '/auth/refresh-token',
      checkSession: '/auth/check-session',
      renewSession: '/auth/renew-session',
      me: '/auth/me',
      changePassword: '/auth/change-password',
      forgotPassword: '/auth/forgot-password',
      resetPassword: '/auth/reset-password'
    },
    contato: {
      enviar: '/contato/enviar'
    },
    usuarios: '/usuarios',
    clientes: '/clientes',
    processos: '/processos',
    atualizacoes: '/atualizacoes',
    agenda: '/agenda',
    trt: '/trt'
  }
};
