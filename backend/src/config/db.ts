import mongoose from "mongoose";

export const connectToDatabase = async (): Promise<void> => {
  //Hämtar databas-URI från miljövariabler
  const mongoUri= process.env.MONGODB_URI;

  //Stoppar appen tidigt om URI saknas (fail fast)
  if (!mongoUri) {
    throw new Error('MONGODB_URI saknas i miljövariablerna');
  }

  try {
    //Ansluter till MongoDB med Mongoose
    await mongoose.connect(mongoUri);
    console.log('MongoDB ansluten');
  }catch (error){
    //Loggar tydligt fel och kastar vidare så servern inte startar trasig
    console.error('Kunde inte ansluta till MongoDB:', error);
    throw error;
  }
};