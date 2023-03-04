import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type FieldDocument = Field & Document;

@Schema({timestamps: true})
export class Field {
    @Prop()
    matrix: TField;

    @Prop()
    ame: string;

    @Prop()
    paths: TPathNum[];

    @Prop()
    areas: TPathNum[];

    @Prop()
    moves: TMove[];

    @Prop()
    current: number;

    @Prop()
    players: Array<string>;

    @Prop()
    squares: Array<number>;

}

export const FieldSchema = SchemaFactory.createForClass(Field);