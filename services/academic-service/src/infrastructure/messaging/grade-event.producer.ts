import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { EVENTS, GradeRecordedPayload } from "@mentorapredict/event-contracts";
import { lastValueFrom, timeout, catchError, EMPTY } from "rxjs";

@Injectable()
export class GradeEventProducer {
  private readonly logger = new Logger(GradeEventProducer.name);

  constructor(
    @Inject("RABBITMQ_CLIENT") private readonly client: ClientProxy,
  ) {}

  async gradeRecorded(payload: GradeRecordedPayload): Promise<void> {
    try {
      await lastValueFrom(
        this.client.emit(EVENTS.GRADE_RECORDED, payload).pipe(
          timeout(5000),
          catchError((err) => {
            this.logger.warn(
              `Failed to emit ${EVENTS.GRADE_RECORDED}: ${err.message}`,
            );
            return EMPTY;
          }),
        ),
      );
    } catch (error) {
      this.logger.warn(
        `RabbitMQ unavailable — grade.recorded event dropped for student ${payload.studentId}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.client.close();
  }
}
