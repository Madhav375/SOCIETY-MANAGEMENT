const { mongoose } = require("../config/mongodb");

// Atomic sequence generator (used for complaint ids).
const schema = new mongoose.Schema({ _id: String, seq: { type: Number, default: 0 } });
const Counter = mongoose.model("Counter", schema);

async function nextSequence(name) {
  const doc = await Counter.findOneAndUpdate({ _id: name }, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return doc.seq;
}

module.exports = Counter;
module.exports.nextSequence = nextSequence;
