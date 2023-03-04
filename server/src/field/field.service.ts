import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { TStatsObj, TUpdResObj } from "src/exp-types";
import { Field, FieldDocument } from "./schemas/field.schemas";
import { getStats, initField } from './utils/etc';
import { update } from './utils/update';

@Injectable()
export class FieldService {

    constructor(@InjectModel(Field.name) private fieldModel: Model<FieldDocument>) { }

    private logger: Logger = new Logger('FieldService');

    async createField(userId = 'none'): Promise<FieldDocument> {
        this.logger.log(`░ user ${userId} demands field creation`);
        const field = await this.fieldModel.create(initField(userId))
        return field;
    }


    async getAllFields(): Promise<Field[]> {
        const field = await this.fieldModel.find()
        return field;
    }


    async getSumFields(): Promise<Field[]> {
        const field = await this.fieldModel.find({}, { _id: 1, moves: 1, createdAt: 1 })
        return field;
    }


    async getIds(): Promise<Field[]> {
        const field = await this.fieldModel.aggregate([{ $match: {} }, { $group: { _id: "$_id" } }])
        return field;
    }


    async getFieldById(gameid: string): Promise<Field> {
        if (gameid.match(/^[0-9a-fA-F]{24}$/)) {
            const field = await this.fieldModel.find({ _id: gameid })
            if (field.length) { return field[0] }
        }
    }


    async updateField(fieldId: string, userId: string, [x0, y0]: TPair): Promise<TUpdResObj> {
        this.logger.log(`┆ user ${userId} demands update field ${fieldId} at ${x0}x${y0}`);

        const field = await this.fieldModel.findById(fieldId);
        const result = update(field, userId, [x0, y0])
        await new this.fieldModel(field).save();

        this.logger.log(`┕ Response for user ${userId}: accepted ` +
            `${result.is_accepted} need2redraw ${result.is_need2redraw}`)
        return result
    }


    async addPlayer(fieldId: string, userId: string): Promise<any> {
        const field = await this.fieldModel.findById({ _id: fieldId });
        field.players = [...field.players, userId];
        await new this.fieldModel(field).save();
        // field.save();
    }


    async getStats(fieldId: string, userId: string = undefined): Promise<TStatsObj> {
        const field = await this.fieldModel.findById({ _id: fieldId });
        const result = getStats(field)

        if (userId && field.players) {
            if (field.players.length == 1) {
                if (field.players[0] == userId) {
                    result.title.shareLink = fieldId;
                } else {
                    // add requesting user as 2nd player
                    await this.addPlayer(fieldId, userId);
                    field.players.push(userId);
                }
            }
        }

        return result;
    }
}