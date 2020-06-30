import { TheDb } from './thedb';

/**
 * class for selecting, inserting, updating and deleting Useres in user table.
 *
 * @export
 * @class User
 */
export class User {
    public id = -1;
    public name = '';
    public username = '';
    public password = '';
    public role = '';

    public static getCount(filter: string): Promise<User[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "user" WHERE name ILIKE '%${filter}%' OR 
                                        username ILIKE '%${filter}%' OR role ILIKE '%${filter}%'`, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<User> {
        const sql = `SELECT * FROM "user" WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new User().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 User. Found 0.');
                }
            });
    }

    public static getByUsername(id: number): Promise<User> {
        const sql = `SELECT * FROM "user" WHERE username = '${id}'`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new User().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 User. Found 0.');
                }
            });
    }

    public static getAllTeachers(): Promise<Array<User>> {
        const sql = `SELECT * FROM "user" WHERE role = 'teacher'`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: User[] = [];
                for (const row of rows) {
                    const user = new User().fromRow(row);
                    users.push(user);
                }
                return users;
            });
    }

    public static getAllStudents(): Promise<Array<User>> {
        const sql = `SELECT * FROM "user" WHERE role = 'student'`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: User[] = [];
                for (const row of rows) {
                    const user = new User().fromRow(row);
                    users.push(user);
                }
                return users;
            });
    }

    public static getAllParents(): Promise<Array<User>> {
        const sql = `SELECT * FROM "user" WHERE role = 'parent'`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: User[] = [];
                for (const row of rows) {
                    const user = new User().fromRow(row);
                    users.push(user);
                }
                return users;
            });
    }

    public static verify(username: string, password: string): Promise<User> {
        const sql = `SELECT * FROM "user" WHERE username = '${username}' AND password = '${password}'`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new User().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 User. Found 0.');
                }
            });
    }

    public static getByUserName(userName: string): Promise<User> {
        const sql = `SELECT * FROM "user" WHERE username = '${userName}'`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new User().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 User. Found 0.');
                }
            });
    }

    public static getAll(): Promise<User[]> {
        const sql = `SELECT * FROM "user" ORDER BY name`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: User[] = [];
                for (const row of rows) {
                    const user = new User().fromRow(row);
                    users.push(user);
                }
                return users;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<User[]> {
        const sql = `SELECT * FROM "user" WHERE name ILIKE '%${filter}%' OR 
                            username ILIKE '%${filter}%' OR
                            role ILIKE '%${filter}%' 
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: User[] = [];
                for (const row of rows) {
                    const user = new User().fromRow(row);
                    users.push(user);
                }
                return users;
            });
    }

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "user" (name, username, password, role)
            VALUES('${this.name}', '${this.username}', '${this.password}', '${this.role}')`;

        const values = {
        };

        return TheDb.insert(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 User to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(): Promise<void> {
        const sql = `
            UPDATE "user"
               SET name = '${this.name}', username = '${this.username}', password = '${this.password}', role = '${this.role}'
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 User to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "user" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 User to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): User {
        this.id = row['id'];
        this.name = row['name'];
        this.username = row['username'];
        this.password = row['password'];
        this.role = row['role'];
        return this;
    }
}
