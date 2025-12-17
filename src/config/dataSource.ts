import { DataSource } from "typeorm";
import { User } from "../entities/userEntity";
import { Post } from "../entities/postEntity";
import { Comment } from "../entities/commentEntity";
import 'dotenv/config';

const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DATABASE_HOST,
    port: 3306,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [User, Post, Comment],
    synchronize: process.env.NODE_ENV === "development",
    logging: false,
});

export default AppDataSource;