import {TheDb} from './thedb';
import {Questionnaire} from "./questionnaire";

/**
 * class for selecting, inserting, updating and deleting Questions in question table.
 *
 * @export
 * @class Question
 */
export class Question {
    public id = -1;
    public title = '';
    public note = '';
    public type = '';
    public sequence = 0;
    public questionnaire: number | Questionnaire

    constructor() {
    }

    public static getCount(filter: string): Promise<Question[]> {
        return TheDb.selectAll(`SELECT count(*)
                            FROM "question" as q
                            WHERE 
                            q.title ILIKE '%${filter}%'`, {})
            .then((count: any) => count);
    }


    public static getCountByQuestionnaire(filter: string, questionnaire: number): Promise<Question[]> {
        return TheDb.selectAll(`SELECT q.*
                            FROM "question" as q
                            INNER JOIN questionnaire as t ON t.id = q.questionnaire
                            WHERE 
                            q.title ILIKE '%${filter}%' AND t.id = ${questionnaire}`, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Question> {
        const sql = `SELECT count(*) FROM "question" WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Question().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Question. Found 0.');
                }
            });
    }

    public static getAll(): Promise<Question[]> {
        const sql = `SELECT q.*
                            FROM "question"`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Question[] = [];
                for (const row of rows) {
                    const question = new Question().fromRow(row);
                    users.push(question);
                }
                return users;
            });
    }

    public static getAllByQuestionnaire(questionnaire: number): Promise<Question[]> {
        const sql = `SELECT q.*
                            FROM "question" as q
                            INNER JOIN questionnaire as t ON t.id = q.questionnaire
                            WHERE t.id = ${questionnaire}
                            ORDER BY q.sequence ASC`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Question[] = [];
                for (const row of rows) {
                    const question = new Question().fromRow(row);
                    users.push(question);
                }
                return users;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<Question[]> {
        const sql = `SELECT q.*
                            FROM "question" as q
                            INNER JOIN questionnaire as t ON t.id = q.questionnaire
                             WHERE
                            q.title ILIKE '%${filter}%'
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Question[] = [];
                for (const row of rows) {
                    const question = new Question().fromRow(row);
                    users.push(question);
                }
                return users;
            });
    }

    public static getAllPagedByQuestionnaire(pageIndex: number, pageSize: number, sort: string, order: string, filter: string, questionnaire: number): Promise<Question[]> {
        const sql = `SELECT q.*, t.name
                            FROM "question" as q
                            INNER JOIN questionnaire as t ON t.id = q.questionnaire
                             WHERE
                            q.title ILIKE '%${filter}%' OR 
                            t.id = %${questionnaire}% 
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Question[] = [];
                for (const row of rows) {
                    const question = new Question().fromRow(row);
                    users.push(question);
                }
                return users;
            });
    }

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "question" (title, type,note, sequence, questionnaire)
            VALUES('${this.title}', '${this.type}', 
            '${this.note ? this.note.replace(/\'/g, "''") : ''}', 
            ${this.sequence}, ${this.questionnaire}) RETURNING *`;

        const values = {
        };

        return TheDb.insert(sql, values)
            .then((result: any) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Question to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.id;
                }
            });
    }

    public update(): Promise<void> {
        const sql = `
            UPDATE "question"
               SET title = '${this.title}', type = '${this.type}', 
               note = '${this.note ? this.note.replace(/\'/g, "''") : ''}',
               sequence = ${this.sequence}, questionnaire = ${this.questionnaire}  
             WHERE id = ${this.id} RETURNING *`;

        const values = {
        };

        return TheDb.update(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Question to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "question" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Question to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): Question {
        this.id = row['id'];
        this.title = row['title'];
        this.type = row['type'];
        this.sequence = row['sequence'];
        this.note = row['note'];
        this.questionnaire = row['questionnaire'];
        return this;
    }
}
