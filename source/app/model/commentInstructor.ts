import { TheDb } from './thedb';

/**
 * class for selecting, inserting, updating and deleting CommentInstructors in comment-instructor table.
 *
 * @export
 * @class CommentInstructor
 */
export class CommentInstructor {
    public id = -1;
    public comment = '';
    public date: Date| number;
    public instructor = -1;



    public static getCount(filter: string, instructor: number): Promise<CommentInstructor[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "commentInstructor" WHERE   
                            comment ILIKE '%${filter}%' AND instructor = ${instructor}`, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<CommentInstructor> {
        const sql = `SELECT * FROM "commentInstructor" WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new CommentInstructor().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 CommentInstructor. Found 0.');
                }
            });
    }


    public static getAll(): Promise<CommentInstructor[]> {
        const sql = `SELECT * FROM "commentInstructor"`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: CommentInstructor[] = [];
                for (const row of rows) {
                    const comment = new CommentInstructor().fromRow(row);
                    users.push(comment);
                }
                return users;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string, instructor: number): Promise<CommentInstructor[]> {
        const sql = `SELECT c.* FROM "commentInstructor" c
                            WHERE c.comment ILIKE '%${filter}%' AND
                            c.instructor = ${instructor}
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: CommentInstructor[] = [];
                for (const row of rows) {
                    const comment = new CommentInstructor().fromRow(row);
                    users.push(comment);
                }
                return users;
            });
    }

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "commentInstructor" (comment, date, instructor)
            VALUES('${this.comment ? this.comment.replace(/\'/g, "''") : ''}', '${this.date}', ${this.instructor})`;

        const values = {
        };

        return TheDb.insert(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 CommentInstructor to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(): Promise<void> {
        const sql = `
            UPDATE "commentInstructor" SET
               comment = '${this.comment ? this.comment.replace(/\'/g, "''") : ''}'   
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 CommentInstructor to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "commentInstructor" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 CommentInstructor to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): CommentInstructor {
        this.id = row['id'];
        this.instructor = row['instructor'];
        this.comment = row['comment'];
        this.date = row['date'];
        return this;
    }
}
