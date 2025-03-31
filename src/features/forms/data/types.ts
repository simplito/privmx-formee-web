export type InboxResponseQuestion = {
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
              fileId: string;
              fileName: string;
          }>;
      }
);

export type InboxResponse = {
    questions: Array<InboxResponseQuestion>;
    createDate: number;
    id: string;
    files: CustomFile[];
};

export interface CustomFile {
    privateMeta: {
        name: string;
        type: string;
    };
    publicMeta: '';
    id: string;
    size: number;
}

export interface CustomPrivateMeta {
    customData: string;
    name: string;
}
