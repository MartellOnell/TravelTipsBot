import {Model, DataTypes, Optional} from 'sequelize';
import {sequelize} from "./db.js";
import {jsonUser} from "../index.types.js";

interface UserAttributes extends jsonUser {}

type UserCreationAttributes = Optional<UserAttributes, 'id'>
export class User extends Model<UserAttributes, UserCreationAttributes> {
    declare id: number;
    declare counts: number;
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    counts: {
        type: DataTypes.INTEGER
    }
}, {sequelize})