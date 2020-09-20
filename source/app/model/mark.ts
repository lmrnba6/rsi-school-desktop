import {TheDb} from './thedb';
import {Question} from "./question";
import {Exam} from "./exam";

/**
 * class for selecting, inserting, updating and deleting Marks in mark table.
 *
 * @export
 * @class Mark
 */
export class Mark {
    public id = -1;
    public answer = '';
    public exam: number | Exam;
    public question: number | Question


    public static getCount(): Promise<Mark[]> {
        return TheDb.selectAll(`SELECT count(*)
                            FROM "mark"`, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Mark> {
        const sql = `SELECT * FROM "mark" WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Mark().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Mark. Found 0.');
                }
            });
    }

    public static getAll(): Promise<Mark[]> {
        const sql = `SELECT * FROM "mark"`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Mark[] = [];
                for (const row of rows) {
                    const mark = new Mark().fromRow(row);
                    users.push(mark);
                }
                return users;
            });
    }

    public static getAllByExamAndQuestionnaire(exam: number): Promise<Mark[]> {
        const sql = `SELECT m.id, m.answer, q.title as question, q.note
                            FROM "mark" as m
                            INNER JOIN question as q ON q.id = m.question
                            INNER JOIN exam as e ON e.id = m.exam
                          
                            WHERE e.id = ${exam}`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Mark[] = [];
                for (const row of rows) {
                    const mark = new Mark().fromRow(row);
                    users.push(mark);
                }
                return users;
            });
    }

    public insert(cloud?: boolean): Promise<void> {
        const sql = `
            INSERT INTO "mark" (exam,answer, question)
            VALUES(${this.exam}, '${this.answer ? this.answer.replace(/\'/g, "''") : ''}', 
            ${this.question}) RETURNING *`;

        const values = {};

        return TheDb.insert(sql, values, cloud)
            .then((result: any) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Mark to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.id;
                }
            });
    }

    public insertWithId(cloud?: boolean): Promise<void> {
        const sql = `
            INSERT INTO "mark" (id,exam,answer, question)
            VALUES(${this.id},${this.exam}, '${this.answer ? this.answer.replace(/\'/g, "''") : ''}', 
            ${this.question}) RETURNING *`;

        const values = {};

        return TheDb.insert(sql, values, cloud)
            .then((result: any) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Mark to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.id;
                }
            });
    }

    public update(cloud?: boolean): Promise<void> {
        const sql = `
            UPDATE "mark"
               SET exam = ${this.exam}, 
               answer = '${this.answer ? this.answer.replace(/\'/g, "''") : ''}',
               question = ${this.question}  
             WHERE id = ${this.id} RETURNING *`;

        const values = {};

        return TheDb.update(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Mark to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number, cloud?: boolean): Promise<void> {
        const sql = `
            DELETE FROM "mark" WHERE id = ${id}`;

        const values = {};

        return TheDb.delete(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Mark to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): Mark {
        this.id = row['id'];
        this.exam = row['exam'];
        this.answer = row['answer'];
        this.question = row['question'];
        this['note'] = row['note'];
        return this;
    }
}
