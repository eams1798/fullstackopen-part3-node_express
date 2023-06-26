import { connect, Schema, model } from "mongoose";

const url = process.env.MONGODB_URI || '';
console.log('connecting to', url);

connect(url)
  .then(result => { console.log('connected to MongoDB') })
  .catch((error) => { console.log('error connecting to MongoDB:', error.message) });

interface IPerson {
  name: string,
  number: string;
} 

const personSchema= new Schema<IPerson>({
  name: {type: String, required: true },
  number : { type:String, required: true }
});

personSchema.set('toJSON', { transform: (document, returnedObject) => {
  returnedObject.id = returnedObject._id.toString();
  delete returnedObject._id;
  delete returnedObject.__v;
}});

const Person = model<IPerson> ("Person", personSchema); 

export default Person;