import 'dotenv/config';
import { AppDataSource } from './models/dataSource';
import { createApp } from './app';
import { createServer } from 'http';

import swaggerUi from 'swagger-ui-express';

const swaggerJSDoc = require('swagger-jsdoc');
const PORT = process.env.PORT;
const HOST = process.env.HOST;

const definition = {
  openapi: '3.0.0',
  info: {
    title: 'Express API with Swagger',
    version: '1.0.0',
    description:
      'A simple CRUD API application made with Express and documented with Swagger',
  },
  servers: [
    {
      url: `http://${HOST}:${PORT}`,
    },
  ],
  basePath: '/',
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

const swaggerSpec = swaggerJSDoc({
  definition,
  apis: [],
});

(async () => {
  await AppDataSource.initialize()
    .then(() => {
      console.log('Data Source has been initialized!');

      const app = createApp();

      app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

      //   app.all('*', (req: Request, res: Response, next: NextFunction) => {
      //     const err = new Error(`Can't find ${req.originalUrl} on this server!`);

      //     next(err); -> 이부분에서 에러가 발생하면 미들웨어로 돌아가게 해야하는데 현재 나는 미들웨어를 사용하지 않기 때문에
      //   });              주석을 풀고 서버를 열었을 때 에러가 발생하는 것이다.

      const server = createServer(app);
      server.listen(PORT, async () => {
        console.log(`🚀 Server running at http://${HOST}:${PORT}`);
        console.log(
          `📚 Swagger docs available at http://${HOST}:${PORT}/api-docs`
        );
      });
    })
    .catch((error) => {
      console.error('DataSource.initialize() -->', error);
      process.exit(1);
    });
})();
