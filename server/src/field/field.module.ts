import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { FieldController } from "../field/field.controller";
import { FieldGateway } from "./field.gateway";
import { FieldService } from "./field.service";
import { Field, FieldSchema } from "./schemas/field.schemas";


@Module({
    imports: [
        MongooseModule.forFeature([{ name: Field.name, schema: FieldSchema }]),
    ],
    controllers: [FieldController],
    providers: [FieldService, FieldGateway]
})

export class FieldModule { }