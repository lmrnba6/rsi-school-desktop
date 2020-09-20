import {TheDb} from './thedb';
import {Training} from "./training";

/**
 * class for selecting, inserting, updating and deleting Questionnaires in questionnaire table.
 *
 * @export
 * @class Questionnaire
 */
export class Questionnaire {
    public id = -1;
    public title = '';
    public description = '';
    public timed = 0;
    public time = 0;
    public number = 0;
    public jump = 0;
    public save = 0;
    public training: number | Training



    public static getCount(filter: string): Promise<Questionnaire[]> {
        return TheDb.selectAll(`SELECT count(*)
                            FROM "questionnaire" as q
                            LEFT JOIN training as t ON t.id = q.training
                            WHERE 
                            q.title ILIKE '%${filter}%' OR  t.name ILIKE '%${filter}%'`, {})
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Questionnaire> {
        const sql = `SELECT * FROM "questionnaire" WHERE id = ${id}`;
        const values = {};

        return TheDb.selectOne(sql, values)
            .then((row) => {
                if (row) {
                    return new Questionnaire().fromRow(row);
                } else {
                    throw new Error('Expected to find 1 Questionnaire. Found 0.');
                }
            });
    }

    public static getAll(): Promise<Questionnaire[]> {
        const sql = `SELECT q.*, t.name
                            FROM "questionnaire" as q
                            LEFT JOIN training as t ON t.id = q.training`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Questionnaire[] = [];
                for (const row of rows) {
                    const questionnaire = new Questionnaire().fromRow(row);
                    users.push(questionnaire);
                }
                return users;
            });
    }

    public static getAllByTraining(training: number): Promise<Questionnaire[]> {
        const sql = `SELECT q.*, t.name
                            FROM "questionnaire" as q
                            INNER JOIN training as t ON t.id = q.training
                            WHERE t.id = ${training}`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Questionnaire[] = [];
                for (const row of rows) {
                    const questionnaire = new Questionnaire().fromRow(row);
                    users.push(questionnaire);
                }
                return users;
            });
    }

    public static titleExist(name: string) {
        const sql = `SELECT * FROM "questionnaire" WHERE title = '${name}'`;
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

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<Questionnaire[]> {
        const sql = `SELECT q.*, t.name, count(q2) questions
                            FROM "questionnaire" as q
                            LEFT JOIN training as t ON t.id = q.training
                            LEFT JOIN question q2 on q.id = q2.questionnaire
                             WHERE
                            q.title ILIKE '%${filter}%' OR 
                            t.name ILIKE '%${filter}%' 
                            GROUP BY q.id, t.name
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        const values = {
        };

        return TheDb.selectAll(sql, values)
            .then((rows) => {
                const users: Questionnaire[] = [];
                for (const row of rows) {
                    const questionnaire = new Questionnaire().fromRow(row);
                    users.push(questionnaire);
                }
                return users;
            });
    }

    public insert(cloud?: boolean): Promise<void> {
        const sql = `
            INSERT INTO "questionnaire" (title, timed,description, jump,number, save, training)
            VALUES('${this.title}', ${this.timed}, 
            '${this.description ? this.description.replace(/\'/g, "''") : ''}', 
            ${this.jump}, ${this.number}, ${this.save}, ${this.training})`;

        const values = {
        };

        return TheDb.insert(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Questionnaire to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public insertWithId(cloud?: boolean): Promise<void> {
        const sql = `
            INSERT INTO "questionnaire" (id, title, timed,description, jump,number, save, training)
            VALUES(${this.id}, '${this.title}', ${this.timed}, 
            '${this.description ? this.description.replace(/\'/g, "''") : ''}', 
            ${this.jump}, ${this.number}, ${this.save}, ${this.training})`;

        const values = {
        };

        return TheDb.insert(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Questionnaire to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }


    public update(cloud?: boolean): Promise<void> {
        const sql = `
            UPDATE "questionnaire"
               SET title = '${this.title}', timed = '${this.timed}', jump= ${this.jump}, 
               description = '${this.description ? this.description.replace(/\'/g, "''") : ''}',
               number = ${this.number}, save = ${this.save}, training = ${this.training}  
             WHERE id = ${this.id}`;

        const values = {
        };

        return TheDb.update(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Questionnaire to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number, cloud?: boolean): Promise<void> {
        const sql = `
            DELETE FROM "questionnaire" WHERE id = ${id}`;

        const values = {
        };

        return TheDb.delete(sql, values, cloud)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Questionnaire to be deleted. Was ${result.changes}`);
                }
            });
    }

    public fromRow(row: object): Questionnaire {
        this.id = row['id'];
        this.title = row['title'];
        this.timed = row['timed'];
        this.jump = row['jump'];
        this.number = row['number'];
        this.save = row['save'];
        this.description = row['description'];
        this.training = row['training'];
        this['name'] = row['name'];
        this['questions'] = row['questions']
        return this;
    }
}
