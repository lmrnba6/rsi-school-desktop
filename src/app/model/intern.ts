import { TheDb } from './thedb';

/**
 * class for selecting, inserting, updating and deleting Interns in intern table.
 *
 * @export
 * @class Intern
 */
export class Intern {
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
    public parent: number;


    public static getCount(filter: string): Promise<Intern[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "intern" WHERE name LIKE '%${filter}%' OR 
                                        phone LIKE '%${filter}%' OR 
                                        phone2 LIKE '%${filter}%'`, {})
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
        const sql = `SELECT i.id, i.name, i.phone, i.phone2, i.email, i.birth, i.address, i."isAllowed", i.scholar, i.sold 
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
        const sql = `SELECT * FROM "intern" WHERE name LIKE '%${filter}%' OR 
                            phone LIKE '%${filter}%' OR 
                            phone2 LIKE '%${filter}%'OR
                            name_arabic LIKE '%${filter}%'
                             
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
        const sql = `SELECT i.id, i.name, i.birth, i.email, i.phone, i.phone2, i.name_arabic, i.sold, i."isAllowed" FROM "enrollment" as e 
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

    public static getAllPagedBySessions(pageIndex: number, pageSize: number, sort: string, order: string,filter: string, sessions: string): Promise<Intern[]> {
        const sql = `SELECT i.id, i.name, i.birth, i.email, i.phone, i.phone2, i.name_arabic, i.sold, i."isAllowed" FROM "enrollment" as e 
                            INNER JOIN "intern" as i ON e.intern_id = i.id
                            INNER JOIN "session" as s ON e.session_id = s.id
                            WHERE s.id in (${sessions}) and i.name LIKE '%${filter}%'
                           
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

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "intern" (name, birth, name_arabic, address, phone, phone2, email, sold, "isAllowed", scholar, photo, parent)
            VALUES('${this.name}', '${this.birth}', '${this.name_arabic}','${this.address}', 
            '${this.phone}', '${this.phone2}', '${this.email}','${this.sold}', ${this.isAllowed}, '${this.scholar}', '${this.photo}', ${this.parent})`;

        const values = {
        };

        return TheDb.insert(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Intern to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(): Promise<void> {
        const sql = `
            UPDATE "intern"
               SET name = '${this.name}', birth = '${this.birth}', name_arabic = '${this.name_arabic}', 
               address = '${this.address}', phone = '${this.phone}',  phone2 = '${this.phone2}', "isAllowed" = ${this.isAllowed}, 
               email = '${this.email}', sold = '${this.sold}',  scholar = '${this.scholar}',  photo = '${this.photo}', parent = ${this.parent}   
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Intern to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "intern" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values)
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
        this.parent = row['parent'];
        return this;
    }
}
