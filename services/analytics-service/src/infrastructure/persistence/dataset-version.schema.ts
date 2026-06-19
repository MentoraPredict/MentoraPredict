import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DatasetVersionDocument = HydratedDocument<DatasetVersion>;

@Schema({ collection: 'dataset_versions', timestamps: false })
export class DatasetVersion {
  @Prop({ required: true }) studentId!: string;
  @Prop({ required: true }) type!: string;
  @Prop({ type: Object, required: true }) inputs!: Record<string, unknown>;
  @Prop({ type: Object, required: true }) result!: Record<string, unknown>;
  @Prop({ required: true }) timestamp!: Date;
}

export const DatasetVersionSchema = SchemaFactory.createForClass(DatasetVersion);
