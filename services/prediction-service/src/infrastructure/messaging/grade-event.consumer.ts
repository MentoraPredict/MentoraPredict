import { Controller, Logger } from "@nestjs/common";
import { EventPattern, Payload, Ctx, RmqContext } from "@nestjs/microservices";
import { EVENTS, GradeRecordedPayload } from "@mentorapredict/event-contracts";

@Controller()
export class GradeEventConsumer {
  private readonly logger = new Logger(GradeEventConsumer.name);

  @EventPattern(EVENTS.GRADE_RECORDED)
  async handleGradeRecorded(
    @Payload() payload: GradeRecordedPayload,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      this.logger.log(
        `Received grade.recorded — student=${payload.studentId}, subject=${payload.subjectId}, value=${payload.value}`,
      );

      channel.ack(originalMessage);
    } catch (error) {
      this.logger.error(
        `Error processing grade.recorded for student ${payload.studentId}`,
        error instanceof Error ? error.stack : undefined,
      );
      channel.nack(originalMessage, false, true);
    }
  }
}
