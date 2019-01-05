var env = process.env.NODE_ENV || 'development';
console.log('env ********', env);

if(env === 'development') {
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/nicdb';
  process.env.secret = '12345-67890-09876-54321';
} else if (env === 'test') {
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/nicdbTest';
  process.env.secret = '12345-67890-09876-54321';
}
