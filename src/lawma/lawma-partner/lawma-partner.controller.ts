import { Controller } from "@nestjs/common";
import { LawmaPartnerService } from "./lawma-partner.service";

@Controller()
export class LawmaPartnerController{
    constructor(
        private readonly lawmaPartnerService: LawmaPartnerService
    ){

    }
}