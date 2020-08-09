import { TheDb } from './thedb';

/**
 * class for selecting, inserting, updating and deleting Schools in school table.
 *
 * @export
 * @class School
 */
export class School {
    public id = -1;
    public name = '';
    public photo = '';
    public address = '';
    public phone1 = '';
    public phone2 = '';
    public email = '';
    public website = ''
    public dist = ''

    public static getCount(filter: string): Promise<School[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "school" WHERE name LIKE '%${filter}%' OR 
                                        photo LIKE '%${filter}%'`, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<School> {
        const sql = `SELECT * FROM "school" WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new School().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 School. Found 0.');
                }
            });
    }

    public static getAll(): Promise<School[]> {
        const sql = `SELECT * FROM "school"`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: School[] = [];
                for (const row of rows) {
                    const school = new School().fromRow(row);
                    users.push(school);
                }
                return users;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<School[]> {
        const sql = `SELECT * FROM "school" WHERE name LIKE '%${filter}%' OR 
                            photo LIKE '%${filter}%'
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: School[] = [];
                for (const row of rows) {
                    const school = new School().fromRow(row);
                    users.push(school);
                }
                return users;
            });
    }

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "school" (name, photo, dist, address, phone1,phone2, email,website)
            VALUES('${this.name}', '${this.photo}', '${this.dist}', '${this.address}', '${this.phone1}', 
            '${this.phone2}', '${this.email}', '${this.website}')`;

        const values = {
        };

        return TheDb.insert(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 School to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(): Promise<void> {
        const sql = `
            UPDATE "school"
               SET name = '${this.name}', photo = '${this.photo}', address = '${this.address}', phone1 = '${this.phone1}', 
               phone2 = '${this.phone2}', dist = '${this.dist}', email = '${this.email}', website = '${this.website}'
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 School to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "school" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 School to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): School {
        this.id = row['id'];
        this.name = row['name'];
        this.photo = row['photo'];
        this.dist = row['dist'];
        this.address = row['address'];
        this.phone1 = row['phone1'];
        this.phone2 = row['phone2'];
        this.email = row['email'];
        this.website = row['website'];
        return this;
    }
}
