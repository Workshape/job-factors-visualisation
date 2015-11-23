import Service from 'api-service';

export default new Service('/api/')
 
// Get responses endpoint
.add('responses.get', { method: 'get', route: 'responses' })

// Get config endpoint
.add('config.get', { method: 'get', route: 'config' });