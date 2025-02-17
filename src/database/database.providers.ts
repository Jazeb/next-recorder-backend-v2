import * as mongoose from 'mongoose';

export const databaseProviders = [
  {
    provide: String(process.env.MONGO_DB_CONNECTION_PROVIDER),
    useFactory: async (): Promise<typeof mongoose> =>
      await mongoose.connect(process.env.MONGO_URI),
  },
];
