import { TheDb } from './thedb';
import {User} from "./user";

/**
 * class for selecting, inserting, updating and deleting Interns in intern table.
 *
 * @export
 * @class Intern
 */
export class Intern{
    public id = -1;
    public name = '';
    public birth: Date | number;
    public name_arabic = '';
    public phone = '';
    public phone2 = '';
    public address = '';
    public email = '';
    public sold = 0;
    public photo: string;
    public scholar = '';
    public isAllowed: number | boolean = 0;
    public isPromo: number | boolean = 0;
    public isVip: number | boolean = 0;
    public parent: any;
    public user_id: number | User;


    public static getCount(filter: string): Promise<Intern[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "intern" WHERE name ILIKE '%${filter}%' OR 
                                        phone ILIKE '%${filter}%'`, {})
            .then((count: any) => count);
    }

    public static getCountInternBySession(session_id: number): Promise<Intern[]> {
        return TheDb.selectAll(`SELECT count(i.id) as count
                                                   FROM "enrollment" AS e 
                                                   INNER JOIN "session" AS s ON e.session_id = s.id
                                                   INNER JOIN "intern" AS i ON e.intern_id = i.id
                                                   INNER JOIN "training" AS t ON s.training_id = t.id
                    WHERE s.id = ${session_id}`, {})
            .then((count: any) => count);
    }

    public static getCountInternByParent(parent: number): Promise<Intern[]> {
        return TheDb.selectAll(`SELECT count(i.id) as count
                                                   FROM "enrollment" AS e 
                                                   INNER JOIN "session" AS s ON e.session_id = s.id
                                                   INNER JOIN "intern" AS i ON e.intern_id = i.id
                                                   INNER JOIN "training" AS t ON s.training_id = t.id
                    WHERE i.parent = ${parent}`, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Intern> {
        const sql = `SELECT * FROM "intern" WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Intern().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Intern. Found 0.');
                }
            });
    }

    public static getByPhone(phone: number): Promise<Intern> {
        const sql = `SELECT * FROM "intern" WHERE phone = '${phone}'`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Intern().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 User. Found 0.');
                }
            });
    }

    public static getAll(): Promise<Intern[]> {
        const sql = `SELECT * FROM "intern"`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Intern[] = [];
                for (const row of rows) {
                    const intern = new Intern().fromRow(row);
                    users.push(intern);
                }
                return users;
            });
    }

    public static getByParent(id: number): Promise<Intern[]> {
        const sql = `SELECT * FROM "intern" where parent = ${id}`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Intern[] = [];
                for (const row of rows) {
                    const intern = new Intern().fromRow(row);
                    users.push(intern);
                }
                return users;
            });
    }

    public static getInternBySession(session_id: number ): Promise<Intern[]> {
        const sql = `SELECT i.id, i.name, i.phone, i.phone2, i.email, i.birth, i.address, i.user_id, i."isAllowed",i."isPromo", i."isVip", i.scholar, i.sold 
                                                   FROM "enrollment" AS e 
                                                   INNER JOIN "session" AS s ON e.session_id = s.id
                                                   INNER JOIN "intern" AS i ON e.intern_id = i.id
                                                   INNER JOIN "training" AS t ON s.training_id = t.id
                    WHERE s.id = ${session_id}`  ;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Intern[] = [];
                for (const row of rows) {
                    const intern = new Intern().fromRow(row);
                    users.push(intern);
                }
                return users;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<Intern[]> {
        const sql = `select i.id, i.name, i.phone, i.sold, i."isAllowed",i."isPromo", i."isVip",i.user_id,i.name_arabic,
                            STRING_AGG(w.name || ' ' || w.time || ' ' || s.name || ' ' || r.number, '---') as weekdays 
                            from intern as i 
                            left join enrollment as e  on e.intern_id = i.id
                            left join session as s on e.session_id = s.id
                            left join weekday as w on w.session_id = s.id
                            left JOIN "room" as r ON w.room_id = r.id
                            WHERE i.name ILIKE '%${filter}%' OR 
                            i.phone ILIKE '%${filter}%'
                            group by i.id, i.name, i.phone, i.sold, i."isAllowed",i."isPromo", i."isVip"
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Intern[] = [];
                for (const row of rows) {
                    const intern = new Intern().fromRow(row);
                    users.push(intern);
                }
                return users;
            });
    }

    public static getAllPagedBySession(pageIndex: number, pageSize: number, sort: string, order: string, session: number): Promise<Intern[]> {
        const sql = `SELECT i.id, i.name, i.birth, i.email, i.phone, i.phone2, i.name_arabic, i.sold, i."isAllowed",i."isPromo", i."isVip" FROM "enrollment" as e 
                            INNER JOIN "intern" as i ON e.intern_id = i.id
                            INNER JOIN "session" as s ON e.session_id = s.id
                            WHERE s.id = ${session}
                           
                            ORDER BY i.${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Intern[] = [];
                for (const row of rows) {
                    const intern = new Intern().fromRow(row);
                    users.push(intern);
                }
                return users;
            });
    }

    public static getAllPagedByInstructor(pageIndex: number, pageSize: number, sort: string, order: string, filter: string, instructor: number): Promise<Intern[]> {
        const sql = `SELECT DISTINCT i.id, i.name, i.birth, i.email, i.phone, i.phone2, i.name_arabic, i.sold, i."isAllowed",i."isPromo", i."isVip" FROM "enrollment" as e 
                            INNER JOIN "intern" as i ON e.intern_id = i.id
                            INNER JOIN "session" as s ON e.session_id = s.id
                            INNER JOIN "instructor" ins ON s.instructor_id = ins.id
                            WHERE ins.id = ${instructor} AND i.name ILIKE '%${filter}%'
                           
                            ORDER BY i.${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Intern[] = [];
                for (const row of rows) {
                    const intern = new Intern().fromRow(row);
                    users.push(intern);
                }
                return users;
            });
    }

    public static getAllPagedBySessions(pageIndex: number, pageSize: number, sort: string, order: string,filter: string, sessions: string): Promise<Intern[]> {
        const where: string = sessions ? `s.id in (${sessions}) and` : '';
        const sql = `SELECT DISTINCT i.id, i.name, i.birth, i.email, i.phone, i.phone2, i.name_arabic, i.sold, i."isAllowed", i."isPromo", i."isVip" FROM "enrollment" as e 
                            INNER JOIN "intern" as i ON e.intern_id = i.id
                            INNER JOIN "session" as s ON e.session_id = s.id
                            WHERE ${where} i.name ILIKE '%${filter}%'
                           
                            ORDER BY i.${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Intern[] = [];
                for (const row of rows) {
                    const intern = new Intern().fromRow(row);
                    users.push(intern);
                }
                return users;
            });
    }

    public insert(cloud?: boolean): Promise<void> {
        const sql = `
            INSERT INTO "intern" (name, birth, name_arabic, address, phone, phone2, email, sold, "isAllowed", "isPromo", "isVip", scholar, photo, parent)
            VALUES('${this.name ? this.name.replace(/\'/g, "''") : ''}', '${this.birth}', '${this.name_arabic ? this.name_arabic.replace(/\'/g, "''") : ''}','${this.address ? this.address.replace(/\'/g, "''"):''}', '${this.phone}', '${this.phone2}', '${this.email ? this.email.replace(/\'/g, "''") : ''}', ${this.sold}, ${this.isAllowed},${this.isPromo}, ${this.isVip}, '${this.scholar}', '${this.photo}', ${this.parent}) RETURNING *`;

        const values = {
        };

        return TheDb.insert(sql, values, cloud)
            .then((result: any) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Intern to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.id;
                }
            });
    }

    public insertWithId(cloud?: boolean): Promise<void> {
        const sql = `
            INSERT INTO "intern" (id, name, birth, name_arabic, address, phone, phone2, email, sold, "isAllowed", "isPromo", "isVip", scholar, photo, parent)
            VALUES(${this.id}, '${this.name ? this.name.replace(/\'/g, "''") : ''}', '${this.birth}', '${this.name_arabic ? this.name_arabic.replace(/\'/g, "''") : ''}','${this.address ? this.address.replace(/\'/g, "''"):''}', '${this.phone}', '${this.phone2}', '${this.email ? this.email.replace(/\'/g, "''") : ''}', ${this.sold}, ${this.isAllowed},${this.isPromo}, ${this.isVip}, '${this.scholar}', '${this.photo}', ${this.parent}) RETURNING *`;

        const values = {
        };

        return TheDb.insert(sql, values, cloud)
            .then((result: any) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Intern to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.id;
                }
            });
    }


    public static getByUser(id: number): Promise<Intern> {
        const sql = `SELECT * FROM "intern" WHERE user_id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Intern().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Instructor. Found 0.');
                }
            });
    }

    public updateUser(): Promise<void> {
        const sql = `
            UPDATE "intern"
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

    public static updateUserId(id: number, userId: number): Promise<void> {
        const sql = `
            UPDATE "intern"
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

    public update(cloud?: boolean): Promise<void> {
        const sql = `
            UPDATE "intern"
               SET user_id = ${this.user_id}, name = '${this.name ? this.name.replace(/\'/g, "''"): ''}', birth = '${this.birth}', name_arabic = '${this.name_arabic ? this.name_arabic.replace(/\'/g, "''") : ''}', 
               address = '${this.address ? this.address.replace(/\'/g, "''"): ''}', phone = '${this.phone}',  phone2 = '${this.phone2}', "isAllowed" = ${this.isAllowed},"isPromo" = ${this.isPromo}, "isVip" = ${this.isVip}, 
               email = '${this.email ? this.email.replace(/\'/g, "''"): ''}', sold = ${this.sold},  scholar = '${this.scholar}',  photo = '${this.photo}', parent = ${this.parent}   
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Intern to be updated. Was ${result.changes}`);
                }
            });
    }

    public static updateSold(id: number, sold: number): Promise<void> {
        const sql = `
            UPDATE "intern" SET sold = ${sold} WHERE id = ${id}`;

        const values = {
        };

        return TheDb.update(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Intern to be updated. Was ${result.changes}`);
                }
            });
    }

    public static nameExist(name: string) {
        const sql = `SELECT * FROM "intern" WHERE name ilike '${name}'`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    throw new Error('duplicated name');
                } else {
                    return null;
                }
            });
    }
    public static delete(id: number, cloud?: boolean): Promise<void> {
        const sql = `
            DELETE FROM "intern" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Intern to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): Intern {
        this.id = row['id'];
        this.name = row['name'];
        this.birth = Number(row['birth']);
        this.name_arabic = row['name_arabic'];
        this.address = row['address'];
        this.phone = row['phone'];
        this.phone2 = row['phone2'];
        this.email = row['email'];
        this.sold = row['sold'];
        this.scholar = row['scholar'];
        this.photo = row['photo'];
        this.isAllowed = row['isAllowed'];
        this.isPromo = row['isPromo'];
        this.isVip = row['isVip'];
        this.parent = row['parent'];
        this.user_id = row['user_id'];
        this['enrollments'] = row['enrollments'];
        this['weekdays'] = row['weekdays'];
        return this;
    }
}
