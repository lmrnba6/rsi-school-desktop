import { TheDb } from './thedb';
import {User} from "./user";

/**
 * class for selecting, inserting, updating and deleting Interns in instructor table.
 *
 * @export
 * @class Instructor
 */
export class Instructor {
    public id = -1;
    public name = '';
    public name_arabic = '';
    public  phone = '';
    public address = '';
    public email = '';
    public sold = 0;
    public isFullTime: number | boolean = 0;
    public user_id: number | User;



    public static getCount(filter: string): Promise<Instructor[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "instructor" WHERE name ILIKE '%${filter}%' OR 
                                        phone ILIKE '%${filter}%' OR email ILIKE '%${filter}%'`, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Instructor> {
        const sql = `SELECT * FROM "instructor" WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Instructor().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Instructor. Found 0.');
                }
            });
    }

    public static getByUser(id: number): Promise<Instructor> {
        const sql = `SELECT * FROM "instructor" WHERE user_id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Instructor().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Instructor. Found 0.');
                }
            });
    }

    public static getByName(name: string): Promise<Instructor> {
        const sql = `SELECT * FROM "instructor" WHERE name = ${name}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Instructor().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 User. Found 0.');
                }
            });
    }

    public static getByPhone(phone: number): Promise<Instructor> {
        const sql = `SELECT * FROM "instructor" WHERE phone = '${phone}'`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Instructor().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 User. Found 0.');
                }
            });
    }


    public static getAll(): Promise<Instructor[]> {
        const sql = `SELECT * FROM "instructor"`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Instructor[] = [];
                for (const row of rows) {
                    const instructor = new Instructor().fromRow(row);
                    users.push(instructor);
                }
                return users;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<Instructor[]> {
        const sql = `SELECT i.*, 
                            STRING_AGG(w.name || ' ' || w.time || ' ' || s.name || ' ' || r.number, '---') as weekdays  
                            FROM "instructor" i             
                            left join session as s on i.id = s.instructor_id
                            left join weekday as w on w.session_id = s.id
                            left JOIN "room" as r ON w.room_id = r.id               
                            WHERE i.name ILIKE '%${filter}%' OR 
                            i.phone ILIKE '%${filter}%' OR
                            i.email ILIKE '%${filter}%' 
                            group by i.id
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Instructor[] = [];
                for (const row of rows) {
                    const instructor = new Instructor().fromRow(row);
                    users.push(instructor);
                }
                return users;
            });
    }

    public insert(cloud?: boolean): Promise<void> {
        const sql = `
            INSERT INTO "instructor" (name, name_arabic, address, phone, email, sold, "isFullTime")
            VALUES('${this.name ? this.name.replace(/\'/g, "''") : ''}', '${this.name_arabic.replace(/\'/g, "''")}', '${this.address.replace(/\'/g, "''")}', '${this.phone}', '${this.email.replace(/\'/g, "''")}', ${this.sold}, ${this.isFullTime}) RETURNING *`;

        const values = {
        };

        return TheDb.insert(sql, values, cloud)
            .then((result: any) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Instructor to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.id;
                }
            });
    }

    public insertWithId(cloud?: boolean): Promise<void> {
        const sql = `
            INSERT INTO "instructor" (id,name, name_arabic, address, phone, email, sold, "isFullTime")
            VALUES(${this.id},'${this.name ? this.name.replace(/\'/g, "''") : ''}', '${this.name_arabic.replace(/\'/g, "''")}', '${this.address.replace(/\'/g, "''")}', '${this.phone}', '${this.email.replace(/\'/g, "''")}', ${this.sold}, ${this.isFullTime}) RETURNING *`;

        const values = {
        };

        return TheDb.insert(sql, values, cloud)
            .then((result: any) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Instructor to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.id;
                }
            });
    }

    public static updateUserId(id: number, userId: number): Promise<void> {
        const sql = `
            UPDATE "instructor"
               SET user_id = ${userId}   
             WHERE id = ${id}`;

        const values = {
        };

        return TheDb.update(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Instructor to be updated. Was ${result.changes}`);
                }
            });
    }

    public updateUser(): Promise<void> {
        const sql = `
            UPDATE "instructor"
               SET user_id = ${this.user_id}   
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Instructor to be updated. Was ${result.changes}`);
                }
            });
    }

    public update(cloud?: boolean): Promise<void> {
        const sql = `
            UPDATE "instructor"
               SET user_id = ${this.user_id}, name = '${this.name ? this.name.replace(/\'/g, "''") : ''}', name_arabic = '${this.name_arabic.replace(/\'/g, "''")}', address = '${this.address.replace(/\'/g, "''")}', phone = '${this.phone}', 
               email = '${this.email ? this.email.replace(/\'/g, "''") : ''}' , sold = '${this.sold}', "isFullTime" = ${this.isFullTime}   
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Instructor to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number, cloud?: boolean): Promise<void> {
        const sql = `
            DELETE FROM "instructor" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Instructor to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): Instructor {
        this.id = row['id'];
        this.name = row['name'];
        this.name_arabic = row['name_arabic'];
        this.address = row['address'];
        this.phone = row['phone'];
        this.email = row['email'];
        this.sold = row['sold'];
        this.isFullTime = row['isFullTime']
        this.user_id = row['user_id']
        this['weekdays'] = row['weekdays'];
        return this;
    }
}
