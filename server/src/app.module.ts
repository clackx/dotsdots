import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { FieldModule } from "./field/field.module";


@Module({
    imports: [
        FieldModule,
        MongooseModule.forRoot('mongodb://127.0.0.1:27017/dotsdots')]
})

export class AppModule { }
