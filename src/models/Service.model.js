import mongoose from 'mongoose'

const serviceSchema = new mongoose.Schema(

    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        image: { type: String, required: true },
        href: { type: String, required: true, unique: true },
    },
    { timestamps: true }
)

export default mongoose.model("Service", serviceSchema)