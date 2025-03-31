import { InboxResponse } from '@/features/forms/data';
import { HoverableElement } from '@atoms/hoverable-element/HoverableElement';
import { useFormContext } from '@/features/forms/logic';
import { Text, Badge, Grid, GridCol, Group, Anchor } from '@mantine/core';
import { IconFile } from '@tabler/icons-react';
import Link from 'next/link';

type ArrayValue<T> = T extends Array<infer R> ? R : never;

function FormAnswerCell({ cell }: { cell: ArrayValue<InboxResponse['questions']> }) {
    if (cell.type === 'file') {
        return (
            <Group key={cell.id} gap={'sm'}>
                {cell.answers.map((file) => (
                    <Badge
                        tt="initial"
                        fw="bolder"
                        key={file.fileName}
                        variant={'outline'}
                        leftSection={<IconFile size={12} />}
                        size="sm">
                        {file.fileName}
                    </Badge>
                ))}
            </Group>
        );
    } else if (cell.type === 'input') {
        return (
            <>
                {cell.answers.map((answer, i) => {
                    return (
                        <Text lineClamp={1} key={i} size="sm">
                            {answer.value}
                        </Text>
                    );
                })}
            </>
        );
    } else {
        return (
            <Group
                key={cell.id}
                gap={'xs'}
                wrap="nowrap"
                style={{ overflow: 'clip', textOverflow: 'ellipsis' }}>
                {cell.answers
                    .filter((x) => x.selected)
                    .map((answer, i) => {
                        return (
                            <Badge
                                tt="capitalize"
                                size="sm"
                                miw="max-content"
                                key={i}
                                variant={answer.selected ? 'default' : 'light'}>
                                {answer.value}
                            </Badge>
                        );
                    })}
            </Group>
        );
    }
}

export function FormAnswer({
    questions,
    row,
    responseId
}: {
    questions: string[];
    responseId: string;
    row: InboxResponse;
}) {
    const { inboxId } = useFormContext();

    return (
        <Anchor component={Link} underline={'never'} href={`/form/${inboxId}/${responseId}`}>
            <HoverableElement p="sm" data-no-shadow>
                <Grid columns={questions.length}>
                    {new Array(questions.length).fill('').map((_, i) => {
                        const questionAtIndex = questions.at(i);
                        const cellForAnswer = row.questions.find(
                            (rowQuestion) =>
                                rowQuestion.name.toLocaleLowerCase() ===
                                questionAtIndex.toLocaleLowerCase()
                        );
                        let questionContent = <></>;

                        if (questionAtIndex && cellForAnswer) {
                            questionContent = <FormAnswerCell cell={cellForAnswer} />;
                        }

                        return (
                            <GridCol key={i} order={i} span={1}>
                                {questionContent}
                            </GridCol>
                        );
                    })}
                </Grid>
            </HoverableElement>
        </Anchor>
    );
}
