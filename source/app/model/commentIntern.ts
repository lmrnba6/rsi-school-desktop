import { TheDb } from './thedb';

/**
 * class for selecting, inserting, updating and deleting CommentInterns in comment table.
 *
 * @export
 * @class CommentIntern
 */
export class CommentIntern {
    public id = -1;
    public comment = '';
    public date: Date| number;
    public intern = -1;



    public static getCount(filter: string, intern: number): Promise<CommentIntern[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "commentIntern" WHERE   
                            comment ILIKE '%${filter}%' AND intern = ${intern}`, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<CommentIntern> {
        const sql = `SELECT * FROM "commentIntern" WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new CommentIntern().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 CommentIntern. Found 0.');
                }
            });
    }


    public static getAll(): Promise<CommentIntern[]> {
        const sql = `SELECT * FROM "commentIntern"`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: CommentIntern[] = [];
                for (const row of rows) {
                    const comment = new CommentIntern().fromRow(row);
                    users.push(comment);
                }
                return users;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string, intern: number): Promise<CommentIntern[]> {
        const sql = `SELECT c.* FROM "commentIntern" c
                            WHERE c.comment ILIKE '%${filter}%' AND
                            c.intern = ${intern}
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: CommentIntern[] = [];
                for (const row of rows) {
                    const comment = new CommentIntern().fromRow(row);
                    users.push(comment);
                }
                return users;
            });
    }

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "commentIntern" (comment, date, intern)
            VALUES('${this.comment ? this.comment.replace(/\'/g, "''") : ''}', '${this.date}', ${this.intern})`;

        const values = {
        };

        return TheDb.insert(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 CommentIntern to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(): Promise<void> {
        const sql = `
            UPDATE "commentIntern" SET
               comment = '${this.comment ? this.comment.replace(/\'/g, "''") : ''}'   
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 CommentIntern to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "commentIntern" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 CommentIntern to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): CommentIntern {
        this.id = row['id'];
        this.intern = row['intern'];
        this.comment = row['comment'];
        this.date = row['date'];
        return this;
    }
}
