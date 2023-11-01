import mongoose from 'mongoose'

const fileSchema = new mongoose.Schema(
  {
    name: String,
    path: String,
    mimeType: String,
    fileSize: Number,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, toJSON: { virtuals: true } }
)

fileSchema.virtual('fullPath').get(function () {
  return `${process.env.FILE_STORAGE}/files/${this.path}`
})

export const File = mongoose.model('File', fileSchema)
