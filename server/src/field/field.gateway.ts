import { FieldService } from "./field.service";

import {
    OnGatewayConnection,
    OnGatewayDisconnect, OnGatewayInit, SubscribeMessage,
    WebSocketGateway, WebSocketServer
} from '@nestjs/websockets';

import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Field } from "./schemas/field.schemas";
import { TMoveObj, TStatsObj } from "src/exp-types";

const subscribers: TSubscribers = {}  // temporary

@WebSocketGateway({ path: '/ws', namespace: 'woofwoof', cors: { origin: '*' } })
export class FieldGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(private fieldService: FieldService) { }

    @WebSocketServer() server: Server;

    private logger: Logger = new Logger('FieldGateway');

    @SubscribeMessage('msgToServer')
    async handleMessage(client: Socket, payload: any) {

        const userId = client.handshake.query.userId as string;
        const gameId = client.handshake.query.gameId as string;

        this.logger.log(`┍ Event >>${payload.event}<< from userId ${userId} at gameId ${gameId}`);

        if (gameId && userId) {
            if (!subscribers[gameId]) {
                subscribers[gameId] = new Set();
            }

            subscribers[gameId].add(client.id);
        }

        const emitAllSubscribers = (subscribersSet: TUsers,
            emitEventType: string, dataToEmit: Field | TStatsObj | TMoveObj) => {
            subscribersSet.forEach(subscriberId => {
                this.server.to(subscriberId).emit(emitEventType, dataToEmit)
            });
        }


        if (payload.event == 'click') {
            const [x, y] = payload.array;
            const { is_accepted, is_need2redraw, move } =
                await this.fieldService.updateField(gameId, userId, [x, y]);

            if (is_need2redraw) {
                const field = await this.fieldService.getFieldById(gameId);
                emitAllSubscribers(subscribers[gameId], 'fieldToClient', field)
            }

            if (is_accepted) {
                emitAllSubscribers(subscribers[gameId], 'dotToClient', move)
            }

            const result = await this.fieldService.getStats(gameId, userId);
            result.subscribers = subscribers[gameId].size;
            emitAllSubscribers(subscribers[gameId], 'statsToClient', result)

        }

        if (payload.event == 'getField') {

            const field = await this.fieldService.getFieldById(gameId);
            if (!field) {
                this.server.to(client.id).emit('statsToClient', { err: 'NSG' })
            } else {
                this.server.to(client.id).emit('fieldToClient', field)

                const result = await this.fieldService.getStats(gameId, userId);
                result.subscribers = subscribers[gameId].size;
                this.server.to(client.id).emit('statsToClient', result);
            }
        }


        if (payload.event == 'newGame') {
            const field = await this.fieldService.createField(userId);
            this.server.to(client.id).emit('fieldToClient', field)

            subscribers[field._id] = new Set([client.id]);

            const result = await this.fieldService.getStats(field._id, userId);
            this.server.to(client.id).emit('statsToClient', result);
        }
    }


    afterInit() {
        this.logger.log('Websocket server initialized');
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`▞ Disconnected ${client.id}`);
        // TODO remove from subscribers
    }

    handleConnection(client: Socket) {
        const userId = client.handshake.query.userId as string;
        const gameId = client.handshake.query.gameId as string;

        this.logger.log(`▚ Connected cid ${client.id} userId ${userId} gameId ${gameId}`);
    }

}