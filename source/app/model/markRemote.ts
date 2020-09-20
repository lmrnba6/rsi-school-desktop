import {Settings} from "./settings";
import {Exam} from "./exam";
import {Question} from "./question";

/**
 * class for selecting, inserting, updating and deleting payments in MarkRemote table.
 *
 * @export
 * @class MarkRemote
 */
export class MarkRemote {
    public id = -1;
    public answer = '';
    public exam: number | Exam;
    public question: number | Question

    public static getAll(): Promise<MarkRemote[]> {
        const sql = `SELECT * FROM "mark_remote"`;

        return new Promise<any>((resolve, reject) => {
            Settings.cloudClient.query(sql, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    const marks: MarkRemote[] = [];
                    for (const r of row.rows) {
                        const m = new MarkRemote().fromRow(r);
                        marks.push(m);
                    }
                    resolve(marks);
                }
            });
        });
    }

    public fromRow(row: object): MarkRemote {
        this.id = row['id'];
        this.exam = row['exam'];
        this.answer = row['answer'];
        this.question = row['question'];
        return this;
    }

}
