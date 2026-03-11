import NodeCache from 'node-cache';

// TTL of 45 seconds
const cache = new NodeCache({ stdTTL: 45, checkperiod: 15 });

export default cache;
