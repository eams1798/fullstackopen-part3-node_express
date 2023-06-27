import { connect, Schema, model } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const url = process.env.MONGODB_URI || "";
console.log("connecting to", url);

connect(url)
  .then(() => { console.log("connected to MongoDB"); })
  .catch((error) => { console.log("error connecting to MongoDB:", error.message); });

interface IPerson {
  name: string,
  number: string;
}

const personSchema= new Schema<IPerson>({
  name: { type: String, minlength: 3, required: true, unique: true },
  number: { type:String, minlength: 8, required: true, unique: true }
});

personSchema.plugin(uniqueValidator);

personSchema.set("toJSON", { transform: (document, returnedObject) => {
  returnedObject.id = returnedObject._id.toString();
  delete returnedObject._id;
  delete returnedObject.__v;
} });

const Person = model<IPerson> ("Person", personSchema);

export default Person;