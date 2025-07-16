import mongoose, { Schema, Document, ObjectId } from 'mongoose'

export type Product = {
  name: string
  description: string
  businessId: ObjectId
  embeddings: number[]
  //.... other fields for the real app
  createdAt: Date
  updatedAt: Date
}

export type ProductDocument = Product & Document

const ProductSchema: Schema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    businessId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'businesses_rags'
    },
    embeddings: { type: [Number], required: true }
  },
  {
    timestamps: true
  }
)

export const ProductModel = mongoose.model<ProductDocument>(
  'products_rag',
  ProductSchema
)
