import {TheDb} from './thedb';
import {Question} from "./question";

/**
 * class for selecting, inserting, updating and deleting Answers in answer table.
 *
 * @export
 * @class Answer
 */
export class Answer {
    public id = -1;
    public correct;
    public note = '';
    public title = '';
    public question: number | Question


    public static getCount(): Promise<Answer[]> {
        return TheDb.selectAll(`SELECT count(*)
                            FROM "answer"`, {})
            .then((count: any) => count);
    }


    public static getCountByQuestion(question: number): Promise<Answer[]> {
        return TheDb.selectAll(`SELECT count(*)
                            FROM "answer" as a
                            INNER JOIN question as t ON t.id = a.question
                            WHERE 
                            t.id = ${question}`, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Answer> {
        const sql = `SELECT * FROM "answer" WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Answer().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Answer. Found 0.');
                }
            });
    }

    public static getAll(): Promise<Answer[]> {
        const sql = `SELECT a.*
                            FROM "answer"`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Answer[] = [];
                for (const row of rows) {
                    const answer = new Answer().fromRow(row);
                    users.push(answer);
                }
                return users;
            });
    }

    public static getAllByQuestion(question: number): Promise<Answer[]> {
        const sql = `SELECT a.*
                            FROM "answer" as a
                            INNER JOIN question as t ON t.id = a.question
                            WHERE t.id = ${question}`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Answer[] = [];
                for (const row of rows) {
                    const answer = new Answer().fromRow(row);
                    users.push(answer);
                }
                return users;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, question: number): Promise<Answer[]> {
        const sql = `SELECT a.*
                            FROM "answer" as a
                            INNER JOIN question as t ON t.id = a.question
                             WHERE
                            t.id = %${question}% 
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Answer[] = [];
                for (const row of rows) {
                    const answer = new Answer().fromRow(row);
                    users.push(answer);
                }
                return users;
            });
    }

    public static getAllPagedByQuestion(pageIndex: number, pageSize: number, sort: string, order: string, question: number): Promise<Answer[]> {
        const sql = `SELECT a.*, t.name
                            FROM "answer" as a
                            INNER JOIN question as t ON t.id = a.question
                             WHERE
                            t.id = %${question}% 
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Answer[] = [];
                for (const row of rows) {
                    const answer = new Answer().fromRow(row);
                    users.push(answer);
                }
                return users;
            });
    }

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "answer" (correct,note,title, question)
            VALUES(${this.correct}, '${this.note ? this.note.replace(/\'/g, "''") : ''}', 
            '${this.title ? this.title.replace(/\'/g, "''") : ''}', ${this.question}) RETURNING *`;

        const values = {};

        return TheDb.insert(sql, values)
            .then((result: any) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Answer to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.id;
                }
            });
    }

    public update(): Promise<void> {
        const sql = `
            UPDATE "answer"
               SET correct = '${this.correct}', 
               note = '${this.note ? this.note.replace(/\'/g, "''") : ''}',
               title = '${this.title ? this.title.replace(/\'/g, "''") : ''}',
               question = ${this.question}  
             WHERE id = ${this.id} RETURNING *`;

        const values = {};

        return TheDb.update(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Answer to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "answer" WHERE id = ${id}`;

        const values = {};

        return TheDb.delete(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Answer to be deleted. Was ${result.changes}`);
                }
            });
    }

    public static deleteByQuestion(id: number): Promise<void> {
        const sql = `
            DELETE FROM "answer" WHERE question = ${id}`;

        const values = {};

        return TheDb.delete(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Answer to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): Answer {
        this.id = row['id'];
        this.correct = row['correct'];
        this.title = row['title'];
        this.note = row['note'];
        this.question = row['question'];
        return this;
    }
}
