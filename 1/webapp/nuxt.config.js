export default {
  modules: ['@nuxtjs/apollo'],
  apollo: {
    clientConfigs: {
      default: {
        httpEndpoint: 'http://localhost:4000',
        getAuth: () => 'Bearer your_token_string'
      }
    }
  }
}
