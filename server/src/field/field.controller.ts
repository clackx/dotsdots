import { Controller, Get, Param } from "@nestjs/common";
import { FieldService } from "../field/field.service";


@Controller('/field')
export class FieldController {

    constructor(private fieldService: FieldService) { }

    @Get()
    getFields() {
        return "It's not allowed"
    }

    @Get('/sum')
    getSum() {
        return this.fieldService.getSumFields()
    }

    @Get('/ids')
    getIds() {
        return this.fieldService.getIds()
    }

    @Get('/:gameid')
    getGame(@Param('gameid') gameid: string) {
        return this.fieldService.getFieldById(gameid)
    }

    // TODO temporary
    @Get('/new/:userid')
    createField(@Param('userid') userid: string) {
        return this.fieldService.createField(userid)
    }


}

