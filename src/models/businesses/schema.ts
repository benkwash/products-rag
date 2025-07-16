import mongoose, { Schema, Document } from 'mongoose'

export type Business = {
  name: string
  description: string
  image?: string
  createdAt: Date
  updatedAt: Date
}
export type BusinessDocument = Business & Document

const BusinessSchema: Schema = new Schema<BusinessDocument>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: false }
  },
  {
    timestamps: true
  }
)

export const BusinessModel = mongoose.model<BusinessDocument>(
  'businesses_rag',
  BusinessSchema
)
