import Service from 'api-service';

export default new Service('https://api.typeform.com/v0')
 
// Add users endpoints 
.add('responses.get', { method: 'get', route: '/api/responses' });