import mongoose, { connect, Schema, model } from "mongoose";

if (process.argv.length < 3) {
  console.error("You must provide a password");
  process.exit(1);
} else {
  interface IPerson {
    name: string;
    number: string;
  }
  const personSchema = new Schema<IPerson> ({
    name: {
      type: String,
      required: true
    },
    number: {
      type: String,
      required: true
    }
  });
  const Person = model<IPerson>("Person", personSchema);
  const password: string = process.argv[2];
  const url = `mongodb+srv://eams1798:${encodeURIComponent(password)}@eamsmdbcluster.x0cqryh.mongodb.net/persons`;
  connect(url);
  if (process.argv.length === 3) {
    Person.find({}).then(persons => {
      console.log("phonebook :");
      persons.forEach(person => {
        console.log(`${person.name} ${person.number}`);
      });
      mongoose.connection.close();
    });
  } else if (process.argv.length === 4) {
    console.error("You must set a number for the given person");
    process.exit(1);
  } else {
    const personName: string = process.argv[3];
    const personNumber: string = process.argv[4];
    const newPerson = new Person({
      name: personName,
      number: personNumber
    });
    newPerson.save().then(() /* (response) */ => {
      console.log(`added ${personName} number ${personNumber} to phonebook`);
      mongoose.connection.close();
    }).catch(err => {
      console.error(err);
      mongoose.connection.close();
    });
  }
}