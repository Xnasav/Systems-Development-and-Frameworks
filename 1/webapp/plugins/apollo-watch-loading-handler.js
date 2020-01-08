// plugins/apollo-error-handler.js
export default (error, nuxtContext) => {
  console.log('Global error handler')
  console.error(error)
}
