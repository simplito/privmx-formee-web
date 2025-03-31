import { Endpoint } from '@simplito/privmx-webendpoint';
import { Inboxes, Utils } from '@simplito/privmx-webendpoint/extra';

type InboxResponseQuestion = {
    id: string;
    name: string;
} & (
    | {
          type: 'single' | 'multiple' | 'input';
          answers: Array<{
              selected: boolean;
              value: string;
          }>;
      }
    | {
          type: 'file';
          answers: Array<{
              fileName: string;
          }>;
      }
);

type InboxResponse = {
    questions: Array<InboxResponseQuestion>;
};
/**
 * @todo Add file support
 */
type FormAnswer =
    | {
          type: 'text';
          answered: string;
      }
    | {
          type: 'single';
          answers: string[];
          answered: string;
      }
    | {
          type: 'multiple';
          answers: string[];
          answered: string[];
      }
    | {
          type: 'file';
          answered: Array<File & { fileId: number }>;
      };

function createResponse(question: FormAnswer & { question: string }): InboxResponseQuestion {
    switch (question.type) {
        case 'text':
            return {
                id: crypto.randomUUID().slice(0, 6),
                type: 'input',
                name: question.question,
                answers: [
                    {
                        value: question.answered,
                        selected: true
                    }
                ]
            };
        case 'single':
            return {
                id: crypto.randomUUID().slice(0, 6),
                type: 'single',
                name: question.question,
                answers: question.answers.map((answer) => {
                    return {
                        value: answer,
                        selected: answer === question.answered
                    };
                })
            };
        case 'multiple':
            if (!Array.isArray(question.answered)) {
                question.answered = [question.answered];
            }

            return {
                id: crypto.randomUUID().slice(0, 6),
                type: 'multiple',
                name: question.question,
                answers: question.answers.map((answer) => {
                    return {
                        value: answer,
                        selected:
                            question.answered.find((answered) => answered === answer) !== undefined
                    };
                })
            };
        case 'file':
            return {
                id: crypto.randomUUID().slice(0, 6),
                type: 'file',
                name: question.question,
                answers: question.answered.map((file) => ({
                    fileName: file.name
                }))
            };
        default:
            throw Error('unknown question type');
    }
}

async function submitFormAnswer(
    inboxID: string,
    solutionID: string,
    platformUrl: string,
    data: InboxResponse
) {
    await Endpoint.setup('/privmx-assets');
    const con = await Endpoint.connectPublic(solutionID, platformUrl);
    const [threadApi, storeApi] = await Promise.all([
        Endpoint.createThreadApi(con),
        Endpoint.createStoreApi(con)
    ]);
    const inboxApi = await Endpoint.createInboxApi(con, threadApi, storeApi);
    await Inboxes.sendEntry(inboxApi, inboxID, {
        data: Utils.serializeObject(data)
    });
}

export async function submitForm<const T extends Record<string, FormAnswer>>(config: {
    inboxID: string;
    solutionID: string;
    platformUrl: string;
    form: T;
}) {
    const entries = Object.entries(config.form).map(([question, config]) => {
        return createResponse({ question, ...config });
    });

    await submitFormAnswer(config.inboxID, config.solutionID, config.platformUrl, {
        questions: entries
    });
}
