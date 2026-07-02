import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PredictionLogDocument = HydratedDocument<PredictionLogDoc>;

@Schema({ collection: 'prediction_logs', timestamps: { createdAt: true, updatedAt: false } })
export class PredictionLogDoc {
  @Prop({ required: true }) studentId!: string;
  @Prop({ required: true }) periodId!: string;
  @Prop({ type: Object, required: true }) risk!: Record<string, unknown>;
  @Prop({ required: true }) summary!: string;
  @Prop({ type: [Object], required: true }) recommendations!: Record<string, unknown>[];
  @Prop({ required: true }) modelVersion!: string;
}

export const PredictionLogSchema = SchemaFactory.createForClass(PredictionLogDoc);
