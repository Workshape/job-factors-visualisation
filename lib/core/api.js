import Service from 'api-service';

export default new Service('/api/')
 
// Add users endpoints 
.add('responses.get', { method: 'get', route: 'responses' });