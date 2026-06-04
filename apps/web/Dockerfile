FROM node:18-alpine

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

RUN echo '{"name":"@mentorapredict/web","version":"0.1.0","scripts":{"start":"node server.js"}}' > package.json

RUN echo "const http = require('http'); \
const server = http.createServer((req, res) => { \
  res.writeHead(200, {'Content-Type': 'text/html'}); \
  res.end('<h1>MentoraPredict Web - Development Environment</h1><p>Frontend placeholder. Implementation in progress.</p>'); \
}); \
server.listen(3007, () => console.log('Web app running on port 3007'));" > server.js

RUN pnpm install

EXPOSE 3007

CMD ["pnpm", "start"]