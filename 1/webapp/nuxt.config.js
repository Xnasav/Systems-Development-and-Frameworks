export default {
  modules: ['@nuxtjs/apollo'],
  apollo: {
    clientConfigs: {
      default: {
        httpEndpoint: 'http://backend:4000',
        getAuth: () => 'Bearer your_token_string'
      }
    }
  }
}
