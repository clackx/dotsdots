
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { Logger } from '@nestjs/common';

const start = async () => {
  
  const logger: Logger = new Logger('Main');

  try {
    const PORT = 5000;
    const app = await NestFactory.create(AppModule)
    app.enableCors();
    app.listen (PORT, () => logger.log('server started'))
  } catch (e) {
    logger.log(e)
  }
}

start()
