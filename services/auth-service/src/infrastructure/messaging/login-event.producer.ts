import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { EVENTS, StudentLoginPayload } from "@mentorapredict/event-contracts";
import { lastValueFrom, timeout, catchError, EMPTY } from "rxjs";

@Injectable()
export class LoginEventProducer {
  private readonly logger = new Logger(LoginEventProducer.name);

  constructor(
    @Inject("RABBITMQ_CLIENT") private readonly client: ClientProxy,
  ) {}

  async studentLoggedIn(payload: StudentLoginPayload): Promise<void> {
    try {
      await lastValueFrom(
        this.client.emit(EVENTS.STUDENT_LOGIN, payload).pipe(
          timeout(5000),
          catchError((err) => {
            this.logger.warn(
              `Failed to emit ${EVENTS.STUDENT_LOGIN}: ${err.message}`,
            );
            return EMPTY;
          }),
        ),
      );
    } catch (error) {
      this.logger.warn(
        `RabbitMQ unavailable — student.login event dropped for student ${payload.studentId}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.client.close();
  }
}
