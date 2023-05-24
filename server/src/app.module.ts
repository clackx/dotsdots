import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { FieldModule } from "./field/field.module";

const mongoHost = process.env.MONGO_HOST || '127.0.0.1';

@Module({
    imports: [
        FieldModule,
        MongooseModule.forRoot(`mongodb://${mongoHost}:27017/dotsdots`)]
})

export class AppModule { }
