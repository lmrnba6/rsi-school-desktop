import { TheDb } from './thedb';

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


    public static getCount(filter: string): Promise<Instructor[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "instructor" WHERE name LIKE '%${filter}%' OR 
                                        phone LIKE '%${filter}%' OR email LIKE '%${filter}%'`, {})
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
        const sql = `SELECT * FROM "instructor" WHERE name LIKE '%${filter}%' OR 
                            phone LIKE '%${filter}%' OR
                            email LIKE '%${filter}%' 
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

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "instructor" (name, name_arabic, address, phone, email, sold)
            VALUES('${this.name}', '${this.name_arabic}', '${this.address}', '${this.phone}', '${this.email}', ${this.sold})`;

        const values = {
        };

        return TheDb.insert(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Instructor to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(): Promise<void> {
        const sql = `
            UPDATE "instructor"
               SET name = '${this.name}', name_arabic = '${this.name_arabic}', address = '${this.address}', phone = '${this.phone}', 
               email = '${this.email}' , sold = '${this.sold}'   
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

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "instructor" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values)
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
        return this;
    }
}
